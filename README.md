# SpeakPrep — AI-Powered IELTS & CEFR Speaking Practice App

SpeakPrep is an interactive, full-stack Next.js web application designed to help students and test takers practice for the **IELTS Speaking Test (Parts 1, 2 & 3)** and **CEFR Oral Examinations**.

It provides real-time voice recognition using the browser's `SpeechRecognition` API, custom timed test sessions, and automated speech evaluation against official band criteria using the **Claude API**.

---

## 🚀 Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark mode strategy
- **Client State**: [Zustand](https://github.com/pmndrs/zustand)
- **Localization**: [i18next](https://www.i18next.com/) & `react-i18next` (English, Uzbek, Russian)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Evaluation**: Server-side [Anthropic Claude API](https://www.anthropic.com/) (`/app/api/evaluate`)
- **Database**: Local JSON database (`data/questions.json` & `data/history.json`) served via Next.js Route Handlers

---

## ✨ Features

- 🎯 **Multiple Exam Modules**: Practice IELTS Part 1, Part 2 (Cue Card with 1-min prep timer + 2-min talk timer), Part 3, and CEFR Speaking tasks.
- 🎙️ **Live Speech Recognition**: Natural microphone input with real-time text transcription, sound wave equalizer animations, and manual fallback typing.
- 🤖 **Instant Band Score Evaluation**: Detailed criteria breakdown across:
  - Fluency & Coherence
  - Lexical Resource (Vocabulary)
  - Grammatical Range & Accuracy
  - Pronunciation & Delivery
- 💡 **Band 8.5+ Recommended Responses**: Automated rewrite and diagnostic feedback for every prompt.
- 🌐 **Full i18n Support**: Seamless toggle between **English (EN)**, **Uzbek (UZ)**, and **Russian (RU)** across all UI elements.
- 🌙 **Dark Mode**: Persisted dark/light theme supporting system preferences.
- 📊 **Session History & Analytics**: Visual score progression chart and session log stored in local JSON database.
- 📚 **Question Bank**: 20+ seed prompts categorized by topic with custom filters and quick-start practice.

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables Setup (Optional for Claude API)

Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> **Note**: If `ANTHROPIC_API_KEY` is not set, SpeakPrep automatically utilizes its built-in criteria-aligned mock evaluator, so you can test and demonstrate the app immediately!

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```
