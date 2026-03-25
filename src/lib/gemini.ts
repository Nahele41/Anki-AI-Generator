import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Flashcard {
  front: string;
  back: string;
  trivia: string;
}

export interface Example {
  description: string;
  content: string;
}

export interface AnalysisResult {
  explanation: string;
  examples: Example[];
  flashcards: Flashcard[];
}

export async function analyzeNotes(textChunk: string, language: string = 'italiano'): Promise<AnalysisResult> {
  const prompt = `Analizza il seguente testo (appunti o documento) e fornisci un'analisi dettagliata in lingua ${language}.

REGOLE FONDAMENTALI:
1. La spiegazione deve essere formattata in Markdown valido. Usa DOPPI A CAPO (\\n\\n) per separare i paragrafi, usa intestazioni (##), elenchi puntati e grassetti per rendere il testo leggibile.
2. Estrai i concetti chiave e spiegali in modo chiaro, come se fossi un tutor esperto.

Devi restituire un oggetto JSON con tre proprietà:
1. "explanation": Un riassunto strutturato e discorsivo in Markdown che spieghi i concetti chiave del testo.
2. "examples": Un array di esempi pratici, analogie o casi d'uso legati ai concetti spiegati. Ogni esempio deve avere una "description" e un "content" (il dettaglio dell'esempio o l'analogia).
3. "flashcards": Un array di ALMENO 5 o 6 flashcard per Anki per memorizzare i concetti chiave. Ogni flashcard deve avere "front" (domanda), "back" (risposta dettagliata) e "trivia" (curiosità).

Testo da analizzare:
${textChunk}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "Riassunto chiaro e strutturato in Markdown" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING, description: "Descrizione dell'esempio o analogia" },
                content: { type: Type.STRING, description: "Dettaglio dell'esempio" }
              },
              required: ["description", "content"]
            }
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "La domanda della flashcard (Fronte)" },
                back: { type: Type.STRING, description: "La risposta dettagliata (Retro)" },
                trivia: { type: Type.STRING, description: "Una curiosità o fatto interessante" }
              },
              required: ["front", "back", "trivia"]
            }
          }
        },
        required: ["explanation", "examples", "flashcards"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Nessuna risposta generata.");
  }

  return JSON.parse(response.text);
}

export async function analyzeCode(codeText: string, language: string = 'italiano'): Promise<AnalysisResult> {
  const prompt = `Agisci come un professore universitario che spiega un frammento di codice a uno studente di laurea magistrale in Ingegneria Informatica.
Fornisci un'analisi accademica, tecnica e approfondita in lingua ${language}.

REGOLE FONDAMENTALI:
1. Se introduci un argomento avanzato o non necessariamente noto (es. classi di complessità come P vs NP, teoremi specifici, pattern architetturali di nicchia, algoritmi complessi), DEVI fornire una breve e chiara spiegazione di background affinché lo studente abbia le conoscenze minime per comprendere il resto. Non dare nulla per scontato.
2. La spiegazione deve essere formattata in Markdown valido. Usa DOPPI A CAPO (\\n\\n) per separare i paragrafi, usa intestazioni (##), elenchi puntati e grassetti per rendere il testo leggibile e ben spaziato.

Devi restituire un oggetto JSON con tre proprietà:
1. "explanation": Una spiegazione strutturata in Markdown (con doppi a capo tra i paragrafi) che copra ESATTAMENTE i seguenti punti:
   - Concetti fondamentali introdotti dal codice (algoritmi, strutture dati, complessità, paradigmi). Includi background se necessario.
   - Strumenti utilizzati (librerie, framework, API di sistema, peculiarità del linguaggio).
   - Pattern da ricordare per implementare altre funzionalità (design pattern, best practice architetturali, idiomi).
2. "examples": Un array di esempi pratici di esecuzione o utilizzo del codice (questo copre il punto "esempi di funzionamento"). Ogni esempio deve avere una "description" e il "content" (il codice dell'esempio o l'output).
3. "flashcards": Un array di ALMENO 5 o 6 flashcard per Anki basate STRETTAMENTE sulla spiegazione appena fornita. Le flashcard devono testare la comprensione dei concetti avanzati, dei pattern e degli strumenti discussi. Ogni flashcard deve avere "front" (domanda), "back" (risposta dettagliata) e "trivia" (curiosità tecnica o storica).

Codice da analizzare:
${codeText}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "Spiegazione chiara di cosa fa il codice" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING, description: "Descrizione dell'esempio" },
                content: { type: Type.STRING, description: "Codice dell'esempio o output" }
              },
              required: ["description", "content"]
            }
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "La domanda della flashcard (Fronte)" },
                back: { type: Type.STRING, description: "La risposta dettagliata (Retro)" },
                trivia: { type: Type.STRING, description: "Una curiosità o fatto interessante" }
              },
              required: ["front", "back", "trivia"]
            }
          }
        },
        required: ["explanation", "examples", "flashcards"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Nessuna risposta generata.");
  }

  return JSON.parse(response.text);
}
