# 🧠 Anki AI Flashcard Generator

An intelligent web application that automatically generates comprehensive Anki flashcards from your study notes and PDF documents using the power of Google's Gemini AI.

## ✨ Features

- **📄 PDF & Text Support:** Upload PDF documents or paste your notes directly.
- **🧩 Smart Chunking:** Processes large documents (20-40 pages) by automatically chunking text to maintain high-quality generation without hitting token limits.
- **🌍 Bilingual (IT/EN):** Interface and AI generation available in both Italian and English.
- **🌗 Dark Mode:** Eye-friendly dark theme for late-night study sessions.
- **💡 Trivia Generation:** Automatically adds interesting facts/trivia to the back of each card to aid memory retention.
- **📥 Direct Anki Export:** Downloads a ready-to-import `.txt` file formatted perfectly for Anki.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (`@google/genai` using `gemini-3.1-pro-preview`)
- **PDF Parsing:** PDF.js (`pdfjs-dist`)
- **Animations:** Motion (`motion/react`)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository or download the source code.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## 📖 How to Import to Anki

1. Generate your flashcards in the app and click **Download .txt**.
2. Open the Anki desktop application.
3. Go to **File > Import**.
4. Select the downloaded `.txt` file.
5. Ensure the separator is set to **Tab**.
6. **Crucial:** Check the box that says **"Allow HTML in fields"** (this ensures the formatting and trivia sections render correctly).
7. Click **Import**.

## 📝 License

This project is open-source and available under the MIT License.
