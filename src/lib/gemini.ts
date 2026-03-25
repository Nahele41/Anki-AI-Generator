import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Flashcard {
  front: string;
  back: string;
  trivia: string;
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
