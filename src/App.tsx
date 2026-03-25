import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Loader2, BookOpen, FileText, Info, X, Moon, Sun, Globe } from 'lucide-react';
import { generateFlashcards, analyzeCode, Flashcard, CodeAnalysisResult } from './lib/gemini';
import { extractTextFromPDF } from './lib/pdf';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, PenLine, Terminal } from 'lucide-react';
import Markdown from 'react-markdown';

const translations = {
  it: {
    title: "Anki AI Generator",
    notesTitle: "I tuoi appunti",
    notesDesc: "Incolla qui i tuoi appunti o carica un file di testo. L'intelligenza artificiale li analizzerà per creare flashcard dettagliate.",
    placeholder: "Incolla i tuoi appunti qui...",
    uploadFile: "Carica File",
    generate: "Genera Flashcard",
    generating: "Generazione...",
    generatingProgress: "Generazione parte {current} di {total}...",
    errorEmpty: "Inserisci degli appunti o carica un file prima di generare.",
    errorGen: "Si è verificato un errore durante la generazione delle flashcard. Riprova.",
    howItWorks: "Come funziona?",
    step1Title: "Prepara il materiale",
    step1Desc: "Carica un PDF, un file di testo, oppure incolla i tuoi appunti. Puoi anche usare il box di testo per dare istruzioni specifiche (es. <em>\"Fai carte solo sul capitolo 2\"</em>).",
    step2Title: "Genera e personalizza",
    step2Desc: "Clicca su \"Genera Flashcard\". L'IA creerà domande, risposte e curiosità. Scegli il nome del mazzo e scarica il file.",
    step3Title: "Importa in Anki",
    step3Desc1: "Apri Anki e vai su File > Importa.",
    step3Desc2: "Seleziona il file .txt appena scaricato.",
    step3Desc3: "Imposta il separatore su Tabulazione.",
    step3Desc4: "Spunta \"Consenti HTML nei campi\" (fondamentale per la formattazione).",
    step3Desc5: "Clicca su Importa.",
    exportName: "Nome del file di esportazione",
    downloadTxt: "Scarica .txt",
    previewTitle: "Anteprima Flashcard",
    cardsCount: "carte",
    noCardsTitle: "Nessuna flashcard generata.",
    noCardsDesc: "Inserisci gli appunti e clicca su Genera per iniziare.",
    front: "Fronte (Domanda)",
    back: "Retro (Risposta)",
    trivia: "Curiosità",
    promptLang: "italiano",
    defaultDeckName: "Mazzo_Anki",
    modeStandard: "Appunti",
    modeCoding: "Coding",
    codingPlaceholder: "Incolla il tuo codice qui...",
    codingTitle: "Analisi del Codice",
    explanation: "Spiegazione",
    examples: "Esempi di Utilizzo"
  },
  en: {
    title: "Anki AI Generator",
    notesTitle: "Your Notes",
    notesDesc: "Paste your notes here or upload a text file. The AI will analyze them to create detailed flashcards.",
    placeholder: "Paste your notes here...",
    uploadFile: "Upload File",
    generate: "Generate Flashcards",
    generating: "Generating...",
    generatingProgress: "Generating part {current} of {total}...",
    errorEmpty: "Please enter some notes or upload a file before generating.",
    errorGen: "An error occurred while generating flashcards. Please try again.",
    howItWorks: "How it works?",
    step1Title: "Prepare your material",
    step1Desc: "Upload a PDF, a text file, or paste your notes. You can also use the text box to give specific instructions (e.g., <em>\"Only make cards for chapter 2\"</em>).",
    step2Title: "Generate and customize",
    step2Desc: "Click \"Generate Flashcards\". The AI will create questions, answers, and trivia. Choose the deck name and download the file.",
    step3Title: "Import into Anki",
    step3Desc1: "Open Anki and go to File > Import.",
    step3Desc2: "Select the newly downloaded .txt file.",
    step3Desc3: "Set the separator to Tab.",
    step3Desc4: "Check \"Allow HTML in fields\" (crucial for formatting).",
    step3Desc5: "Click Import.",
    exportName: "Export file name",
    downloadTxt: "Download .txt",
    previewTitle: "Flashcard Preview",
    cardsCount: "cards",
    noCardsTitle: "No flashcards generated.",
    noCardsDesc: "Enter your notes and click Generate to start.",
    front: "Front (Question)",
    back: "Back (Answer)",
    trivia: "Trivia",
    promptLang: "english",
    defaultDeckName: "Anki_Deck",
    modeStandard: "Notes",
    modeCoding: "Coding",
    codingPlaceholder: "Paste your code here...",
    codingTitle: "Code Analysis",
    explanation: "Explanation",
    examples: "Usage Examples"
  }
};

type Language = 'it' | 'en';

export default function App() {
  const [lang, setLang] = useState<Language>('it');
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState<'standard' | 'coding'>('standard');
  const t = translations[lang];

  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [documentText, setDocumentText] = useState<{ text: string; name: string } | null>(null);
  const [deckName, setDeckName] = useState(t.defaultDeckName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setDeckName(baseName);

    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        setDocumentText({ text, name: file.name });
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocumentText({ text: event.target?.result as string, name: file.name });
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Errore durante l'estrazione del testo:", err);
      setError("Impossibile leggere il file. Assicurati che sia un file di testo o un PDF valido.");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const chunkText = (text: string, maxLength: number = 15000): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxLength) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = paragraph + '\n';
      } else {
        currentChunk += paragraph + '\n';
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };

  const handleGenerate = async () => {
    if (!notes.trim() && !documentText?.text.trim()) {
      setError(t.errorEmpty);
      return;
    }

    setError('');
    setIsGenerating(true);
    setFlashcards([]);
    setCodeAnalysis(null);

    try {
      const combinedText = [notes, documentText?.text].filter(Boolean).join('\n\n');
      
      if (mode === 'coding') {
        const result = await analyzeCode(combinedText, t.promptLang);
        setCodeAnalysis(result);
        setFlashcards(result.flashcards);
      } else {
        const chunks = chunkText(combinedText);
        setProgress({ current: 0, total: chunks.length });

        for (let i = 0; i < chunks.length; i++) {
          setProgress({ current: i + 1, total: chunks.length });
          const cards = await generateFlashcards(chunks[i], t.promptLang);
          setFlashcards(prev => [...prev, ...cards]);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t.errorGen);
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const exportToAnki = () => {
    if (flashcards.length === 0) return;

    const tsvContent = flashcards.map(card => {
      const front = card.front.replace(/\n/g, '<br>').replace(/\t/g, ' ');
      const back = `${card.back.replace(/\n/g, '<br>')}<br><br><b>💡 ${t.trivia}:</b><br>${card.trivia.replace(/\n/g, '<br>')}`.replace(/\t/g, ' ');
      return `${front}\t${back}`;
    }).join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = deckName.trim() ? `${deckName.trim()}.txt` : `${t.defaultDeckName}.txt`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'it' ? 'en' : 'it');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Change Language"
            >
              <Globe size={16} />
              <span className="uppercase">{lang}</span>
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
              
              {/* Mode Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6">
                <button
                  onClick={() => setMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'standard' 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <PenLine size={16} />
                  {t.modeStandard}
                </button>
                <button
                  onClick={() => setMode('coding')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'coding' 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Code2 size={16} />
                  {t.modeCoding}
                </button>
              </div>

              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                {mode === 'coding' ? <Code2 size={20} className="text-blue-600 dark:text-blue-400" /> : <FileText size={20} className="text-blue-600 dark:text-blue-400" />}
                {mode === 'coding' ? t.codingTitle : t.notesTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.notesDesc}
              </p>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={mode === 'coding' ? t.codingPlaceholder : t.placeholder}
                className={`w-full h-64 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none transition-all text-sm dark:text-slate-200 ${mode === 'coding' ? 'font-mono' : ''}`}
              />

              {documentText && (
                <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <FileText size={18} />
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{documentText.name}</span>
                  </div>
                  <button 
                    onClick={() => setDocumentText(null)}
                    className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors p-1"
                    title="Rimuovi file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  accept=".txt,.md,.csv,.pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <Upload size={18} />
                  {t.uploadFile}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!notes.trim() && !documentText?.text.trim())}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {progress.total > 1 
                        ? t.generatingProgress.replace('{current}', progress.current.toString()).replace('{total}', progress.total.toString())
                        : t.generating}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t.generate}
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 transition-colors duration-200">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-600 dark:text-blue-400" />
                {t.howItWorks}
              </h3>
              <div className="space-y-5 text-sm text-blue-800 dark:text-blue-200/80">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                    {t.step1Title}
                  </h4>
                  <p className="ml-7 text-blue-700/90 dark:text-blue-200/70 leading-relaxed" dangerouslySetInnerHTML={{__html: t.step1Desc}}></p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                    {t.step2Title}
                  </h4>
                  <p className="ml-7 text-blue-700/90 dark:text-blue-200/70 leading-relaxed">{t.step2Desc}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                    {t.step3Title}
                  </h4>
                  <ul className="list-disc list-outside ml-10 space-y-1.5 text-blue-700/90 dark:text-blue-200/70">
                    <li>{t.step3Desc1}</li>
                    <li>{t.step3Desc2}</li>
                    <li>{t.step3Desc3}</li>
                    <li>{t.step3Desc4}</li>
                    <li>{t.step3Desc5}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-4">
            {flashcards.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4 justify-between transition-colors duration-200">
                <div className="flex-1 w-full">
                  <label htmlFor="deckName" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t.exportName}
                  </label>
                  <input
                    id="deckName"
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Es. Storia Romana"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm transition-all font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
                <button
                  onClick={exportToAnki}
                  className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap h-[42px]"
                >
                  <Download size={18} />
                  {t.downloadTxt}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Sparkles size={20} className="text-amber-500" />
                {t.previewTitle}
              </h2>
              {flashcards.length > 0 && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {flashcards.length} {t.cardsCount}
                </span>
              )}
            </div>

            {flashcards.length === 0 && !codeAnalysis ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center transition-colors duration-200">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-slate-500 dark:text-slate-400">{t.noCardsTitle}</p>
                <p className="text-sm mt-1">{t.noCardsDesc}</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 pb-8 custom-scrollbar">
                
                {mode === 'coding' && codeAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Explanation */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
                        <Info size={18} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.explanation}</h3>
                      </div>
                      <div className="p-5">
                        <div className="markdown-body">
                          <Markdown>{codeAnalysis.explanation}</Markdown>
                        </div>
                      </div>
                    </div>

                    {/* Examples */}
                    {codeAnalysis.examples.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
                          <Terminal size={18} className="text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.examples}</h3>
                        </div>
                        <div className="p-5 space-y-6">
                          {codeAnalysis.examples.map((ex, idx) => (
                            <div key={idx} className="space-y-2">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{ex.description}</p>
                              <pre className="bg-slate-900 dark:bg-black text-slate-50 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800">
                                <code>{ex.code}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <AnimatePresence>
                    {flashcards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">{t.front}</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">{card.front}</p>
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">{t.back}</span>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{card.back}</p>

                        <div className="mt-5 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles size={12} />
                            {t.trivia}
                          </span>
                          <p className="text-sm text-amber-900 dark:text-amber-200/80 leading-relaxed">{card.trivia}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
