import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Flashcard {
  front: string;
  back: string;
  trivia: string;
}

export interface CodeExample {
  description: string;
  code: string;
}

export interface CodeAnalysisResult {
  explanation: string;
  examples: CodeExample[];
  flashcards: Flashcard[];
}

export async function generateFlashcards(textChunk: string, language: string = 'italiano'): Promise<Flashcard[]> {
  const prompt = `Analizza il seguente testo e crea un mazzo di flashcard per Anki in lingua ${language}.
Le flashcard devono essere completamente esaustive e approfondite.
Per ogni concetto chiave, crea una domanda chiara e una risposta dettagliata.
Inoltre, aggiungi una curiosità significativa o un fatto interessante legato all'argomento per facilitare la memorizzazione.

Testo:
${textChunk}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "La domanda della flashcard (Fronte)" },
            back: { type: Type.STRING, description: "La risposta dettagliata (Retro)" },
            trivia: { type: Type.STRING, description: "Una curiosità o fatto interessante sull'argomento" }
          },
          required: ["front", "back", "trivia"]
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Nessuna risposta generata.");
  }

  return JSON.parse(response.text);
}

export async function analyzeCode(codeText: string, language: string = 'italiano'): Promise<CodeAnalysisResult> {
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
2. "examples": Un array di esempi pratici di esecuzione o utilizzo del codice (questo copre il punto "esempi di funzionamento"). Ogni esempio deve avere una "description" e il "code" (il codice dell'esempio o l'output).
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
                code: { type: Type.STRING, description: "Codice dell'esempio o output" }
              },
              required: ["description", "code"]
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
