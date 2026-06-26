# JRF-NET

> A personal AI-powered Operating System for UGC NET JRF Computer Science preparation.

Built for one purpose — cracking JRF.

---

## What is this?

JRF-NET is a full-stack local study OS. It runs entirely on your machine. All your data stays with you.

**Everything in one place:**
- 📚 Full UGC NET CS + Paper I syllabus (pre-seeded with all topics and subtopics)
- ⏱️ Study session timer with topic linking and quality rating
- 🧠 AI-generated quizzes (Gemini 2.0 Flash)
- 🃏 Spaced repetition flashcards (SM-2 algorithm)
- 📝 Markdown note editor with AI summarization and auto-save
- 📊 Mock test score tracker with trend charts
- 🤖 AI Mentor chat (context-aware: knows your progress, weak topics, days until exam)
- 📅 AI Daily Planner (generates personalized study plan based on your weak areas)
- 📈 Analytics dashboard (JRF Readiness Score, streak, consistency, weak areas)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3, Java 17, H2 (file-based), JPA/Hibernate |
| AI | Google Gemini 2.0 Flash API |
| Frontend | React 18, Vite, TailwindCSS, React Query, Framer Motion |
| Database | H2 file database (persists locally at `~/.jrfos/jrfosdb`) |

---

## Setup & Running

### Prerequisites
- Java 17+
- Node.js 18+
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Add your Gemini API key

Open `backend/src/main/resources/application.yml` and replace the key value:

```yaml
gemini:
  api:
    key: ${GEMINI_API_KEY:YOUR_GEMINI_API_KEY_HERE}
```

Either replace `YOUR_GEMINI_API_KEY_HERE` directly, or set a `GEMINI_API_KEY` system environment variable.

### 2. Personalize the app

Open `frontend/src/lib/constants.js`:

```js
export const USER_NAME  = 'Your Name';
export const EXAM_DATE  = '2025-12-15';   // Your target exam date
export const EXAM_LABEL = 'UGC NET JRF December 2025';
```

### 3. Run

**Windows — double-click:**
```
Start-JRF-OS.bat
```

This starts both servers and opens the app in your browser automatically.

**Manual:**
```bash
# Terminal 1 — Backend
cd backend
mvnw.cmd spring-boot:run

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

---

## First Run

On first startup, the database is seeded automatically with the complete UGC NET syllabus:
- **Paper I:** 10 subjects (Teaching Aptitude, Research Aptitude, Communication, etc.)
- **Paper II:** 10 subjects (DSA, OS, DBMS, CN, TOC, AI, SE, Discrete Structures, Architecture, Programming)

---

## Project Structure

```
jrf-os/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/jrfos/
│       ├── config/           # DataSeeder, CORS, JPA Auditing
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic + AI integration
│       ├── entity/           # JPA entities
│       ├── repository/       # Spring Data repositories
│       ├── dto/              # Request/Response DTOs
│       └── enums/            # PaperType, MasteryLevel, etc.
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/            # One folder per route
│       ├── components/       # Shared UI components
│       ├── api/              # Axios API client modules
│       └── lib/              # utils.js, constants.js
├── Start-JRF-OS.bat          # One-click launcher
├── Stop-JRF-OS.bat           # One-click stopper
├── CHANGES.md                # Full change log + improvement roadmap
└── README.md
```

---

## Stopping the App

Double-click `Stop-JRF-OS.bat` or close the two terminal windows.

---

*Built for one student. One exam. JRF or nothing.*
