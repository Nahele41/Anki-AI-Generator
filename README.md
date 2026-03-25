# Anki AI Generator 🧠✨

Anki AI Generator is a powerful web application built with React and Google's Gemini AI that automatically transforms your study notes, PDFs, or source code into high-quality Anki flashcards. 

## 🌟 Features

- **Two Specialized Modes**:
  - 📝 **Notes Mode**: Perfect for standard text, history, biology, literature, etc.
  - 💻 **Coding Mode**: Tailored for analyzing source code, providing explanations, and usage examples.
- **Multiple Input Methods**: Paste your text directly or upload files (`.txt`, `.md`, `.csv`, `.pdf`).
- **Smart AI Generation**: Doesn't just generate flashcards! It provides a clear explanation of the topic, practical examples, and creates flashcards with Front (Question), Back (Answer), and Trivia.
- **Anki-Ready Export**: Downloads a `.txt` file perfectly formatted for Anki (Tab-separated with HTML support for math formulas and code highlighting).
- **Bilingual UI**: Supports both Italian and English.
- **Dark/Light Mode**: Beautiful UI that respects your system preferences.
- **Math & Code Support**: Renders LaTeX math formulas and Markdown code blocks seamlessly.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **Markdown & Math**: `react-markdown`, `remark-math`, `rehype-katex`
- **PDF Parsing**: `pdfjs-dist`

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nahele41/Anki-AI-Generator.git
   cd Anki-AI-Generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 How to Import into Anki

1. Generate and download your `.txt` file from the app.
2. Open **Anki** and go to `File` > `Import`.
3. Select the downloaded `.txt` file.
4. **Crucial Settings**:
   - Set the separator to **Tab**.
   - Check the box for **"Allow HTML in fields"** (This is required for code blocks and math formulas to render correctly).
5. Click **Import** and start studying!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Nahele41/Anki-AI-Generator/issues).

## 📄 License

This project is open-source and available under the MIT License.
