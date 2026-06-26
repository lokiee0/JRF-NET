# JRF OS — Change Log & Improvement Roadmap

> This document covers every change made to the project so far, and a full roadmap of what should be built next to make this a complete, polished JRF preparation system.

---

## PART 1 — CHANGES MADE SO FAR

### 1.1 Critical Bug Fixes

#### Duplicate Seeder Removed
- **File deleted:** `backend/src/main/java/com/jrfos/config/DatabaseSeeder.java`
- Two `CommandLineRunner` beans both ran on first startup. `DatabaseSeeder` seeded a minimal, incomplete syllabus. `DataSeeder` seeds the full UGC NET CS syllabus with all 10+10 subjects, topics, and subtopics. Keeping both caused a race condition where subjects could be seeded twice or partially.
- **Fix:** Deleted `DatabaseSeeder`. Only `DataSeeder` runs now.

#### H2 Database Path Made Absolute
- **File:** `backend/src/main/resources/application.yml`
- The original path `jdbc:h2:file:./jrfosdb` is relative to wherever the JVM is launched from. If you double-click the `.bat` from a different directory, a new empty database gets created.
- **Fix:** Changed to `jdbc:h2:file:${user.home}/.jrfos/jrfosdb` — always resolves to `C:\Users\<you>\.jrfos\jrfosdb` regardless of launch directory.

#### Reserved SQL Word in Resource Entity
- **File:** `backend/src/main/java/com/jrfos/entity/Resource.java`
- Column was annotated `` @Column(name = "`year`") `` using H2-specific backtick quoting. This fails with some JDBC drivers.
- **Fix:** Renamed to `@Column(name = "exam_year")`.

---

### 1.2 Security Fix

#### API Key No Longer Hardcoded
- **File:** `backend/src/main/resources/application.yml`
- The Gemini API key was hardcoded as a plain string. If committed to git it would be immediately compromised.
- **Fix:** Changed to `${GEMINI_API_KEY:YOUR_KEY_HERE}` — reads from environment variable with a fallback. Set `GEMINI_API_KEY` as a Windows system environment variable for clean separation, or just edit the fallback value in place.
- Also upgraded the Gemini model URL from `gemini-1.5-flash` → `gemini-2.0-flash`.

---

### 1.3 Analytics Service — All Metrics Now Real

**File:** `backend/src/main/java/com/jrfos/service/AnalyticsService.java`

| Metric | Before | After |
|---|---|---|
| Study streak | Only looked at last 14 days — broke any streak > 14 days | Uses full session history |
| Consistency score | Hardcoded `75` always | Real: % of last 30 days with at least one session |
| Weak topic accuracy | `Math.random()` on every request | Real: average quiz score per topic from all submitted quizzes |
| JRF Readiness formula | No consistency component | `40% mock + 40% mastery + 20% consistency` |
| 14-day chart | Used `HashMap` with unordered keys | Uses `LinkedHashMap` — chart is always chronological |

---

### 1.4 Planner — Due Flashcards Wired In

**File:** `backend/src/main/java/com/jrfos/service/PlannerService.java`

- Due flashcard count was hardcoded to `0`. The AI planner never knew how many cards needed review.
- **Fix:** Queries all flashcards where `nextReviewDate <= now()` and passes the real count to the AI prompt.

---

### 1.5 AI Chat — Exam-Aware System Prompt

**File:** `backend/src/main/java/com/jrfos/service/ai/AiService.java`

The AI mentor system prompt now includes:
- Exam name and target date (December 2025)
- Days remaining until the exam (recalculated on every message)
- JRF cutoff score context (180/300)
- Real weak topic names with subject context
- Study consistency score
- Instruction to relate answers to UGC NET CS syllabus

---

### 1.6 Entity Table Names — All Explicit

All JPA entities now have explicit `@Table(name = "...")` annotations. Without these, Hibernate uses the class name to generate a table name which can collide with H2 reserved SQL words (e.g. `RESOURCE`, `NOTE`, `SESSION`).

| Entity | Table Name |
|---|---|
| ChatMessage | `chat_messages` |
| DailyPlan | `daily_plans` |
| DailyPlanItem | `daily_plan_items` |
| Flashcard | `flashcards` |
| FlashcardDeck | `flashcard_decks` |
| MockTest | `mock_tests` |
| MockTestTopicPerformance | `mock_test_topic_performances` |
| Note | `notes` |
| Quiz | `quizzes` |
| QuizQuestion | `quiz_questions` |
| Resource | `resources` |
| StudySession | `study_sessions` |

---

### 1.7 SessionQuality Enum Expanded

**File:** `backend/src/main/java/com/jrfos/enums/SessionQuality.java`

Was: `LOW, MEDIUM, HIGH`
Now: `POOR, LOW, MEDIUM, HIGH, PEAK`

Gives meaningful granularity for self-assessment during study sessions.

---

### 1.8 Study Session Timer — Major Upgrade

**File:** `frontend/src/components/sessions/ActiveTimer.jsx`

| Feature | Before | After |
|---|---|---|
| Topic selection | Not available (always "General Study") | Full dropdown with all subjects and topics |
| Quality rating | Hardcoded `MEDIUM` | 5-button selector (Rough / Okay / Good / Great / Peak) |
| Browser close warning | None | `beforeunload` event warns you to save first |
| Minimum session length | Any length (1-second sessions polluted history) | Only saves if ≥ 1 minute |
| Analytics refresh | Only sessions invalidated | Also invalidates `analyticsDashboard` cache |

---

### 1.9 Session History — Quality Badges + Better Display

**File:** `frontend/src/components/sessions/SessionHistory.jsx`

- Each session now shows a coloured quality badge (😞 Rough / 🙂 Good / 🚀 Peak etc.)
- Duration formatted as `1h 30m` instead of raw minutes
- Scrollable list for long histories
- Deleting a session also refreshes the analytics dashboard

---

### 1.10 StudyStats Chart — Timezone Bug Fixed

**File:** `frontend/src/components/sessions/StudyStats.jsx`

- Previous code used `startTime.split('T')[0]` — this gives the UTC date, not your local date. A session at 11 PM IST would show up on the previous day.
- **Fix:** Uses `new Date(s.startTime)` and extracts local date using `getFullYear/getMonth/getDate`.
- Chart now also shows total hours and active days in the header.

---

### 1.11 Note Editor — Auto-Save + Unsaved Warning

**File:** `frontend/src/pages/notes/NoteEditorPage.jsx`

| Feature | Before | After |
|---|---|---|
| Auto-save | None — closing lost all work | Saves automatically 30 seconds after last change |
| Unsaved indicator | None | Shows "Unsaved changes" in amber / "Saved HH:MM" in green |
| Browser close warning | None | `beforeunload` event warns if unsaved changes exist |
| AI Summary cleared on save | Yes — wiped on every save | Only regenerate clears it; regular saves preserve it |
| Topic link clearing | Couldn't unlink a topic | Setting topic to empty now correctly sets `null` |
| First-time save navigation | Navigated to `/notes/new` again | Correctly navigates to `/notes/:id` after first save |

---

### 1.12 Chat — Confirmation Before Clear

**File:** `frontend/src/pages/chat/ChatPage.jsx`

- Clicking the trash icon now shows `window.confirm()` before deleting all chat history.
- Empty history state — trash button does nothing.

---

### 1.13 Flashcard Review — Session Persistence

**File:** `frontend/src/pages/flashcards/ActiveReviewPage.jsx`

| Feature | Before | After |
|---|---|---|
| Progress on refresh | Lost — started from card 0 again | Reviewed card IDs stored in localStorage per deck |
| Resuming | Always re-reviewed same cards | Filters out already-reviewed cards from the queue |
| Progress bar | None | Shows `N / Total reviewed` with animated bar |
| Session cleanup | `localStorage` index lingered | Cleared when session ends or user navigates away |
| Card flip | Used CSS classes with potential z-fighting | Uses proper `backfaceVisibility: 'hidden'` inline style |

---

### 1.14 TopicItem — Analytics Cache Invalidation Fixed

**File:** `frontend/src/components/subjects/TopicItem.jsx`

- After marking a topic mastered or completing a subtopic, the analytics dashboard was not refreshing.
- **Fix:** Both mutations now also invalidate `analyticsDashboard` query key.
- Fixed query key matching: used `exact: false` so `['subject', id]` keys are all caught.

---

### 1.15 Sidebar — Live JRF Readiness Bar

**File:** `frontend/src/components/layout/Sidebar.jsx`

- Progress bar was hardcoded to `value={0}` — always showed 0% regardless of your data.
- **Fix:** Fetches analytics data with React Query (shares the cache — no extra network request) and displays the real readiness score. Updates automatically as you study.

---

### 1.16 Dashboard — Personalization + Exam Countdown

**File:** `frontend/src/pages/dashboard/DashboardPage.jsx`

- Welcome greeting now uses your name from `constants.js`
- Exam countdown pill shows days remaining, colour-coded by urgency:
  - Purple: > 90 days
  - Amber: 30–90 days
  - Red: < 30 days
- "Upcoming Tasks" card replaced with a "Daily Planner" shortcut card

---

### 1.17 Personal Config File

**File:** `frontend/src/lib/constants.js`

One place to configure everything personal:
```js
export const USER_NAME  = 'Warrior';
export const EXAM_DATE  = '2025-12-15';
export const EXAM_LABEL = 'UGC NET JRF December 2025';
```

---

### 1.18 Utility Functions Added

**File:** `frontend/src/lib/utils.js`

- `getDaysUntilExam()` — calculates days to exam from `EXAM_DATE`
- `formatDuration(minutes)` — formats `90` → `1h 30m`
- `truncate()` — null-safe now

---

### 1.19 EmptyState Component Fixed

**File:** `frontend/src/components/ui/EmptyState.jsx`

- `PlannerPage` passed an `action` object `{ label, onClick, icon, loading }` but the component only accepted `actionLabel` + `onAction`.
- **Fix:** Component now supports both the old and new API. Shows a loading spinner in the button when `action.loading` is true.

---

### 1.20 Tailwind Typography Plugin Registered

**File:** `frontend/tailwind.config.js`

- `@tailwindcss/typography` was installed but not registered in the `plugins` array. Markdown content in notes had no styling.
- **Fix:** Added `require('@tailwindcss/typography')` to plugins.

---

### 1.21 Launch Script Fixed

**File:** `Start-JRF-OS.bat`

- Old script used relative `cd backend` which fails if you run it from a different directory.
- **Fix:** Uses `%~dp0` to get the script's own directory and builds absolute paths.

---

### 1.22 Root `.gitignore` Created

**File:** `.gitignore`

Protects: H2 database files, `uploads/` folder, `node_modules/`, `target/`, IDE files, `.env` files.

---

### 1.23 NoteService Topic Unlinking Fixed

**File:** `backend/src/main/java/com/jrfos/service/NoteService.java`

- Could not unlink a topic from a note once set.
- **Fix:** When `request.getTopicId()` is null, `note.setTopic(null)` is now called explicitly.


---

## PART 2 — WHAT NEEDS TO BE BUILT NEXT

> Ordered by impact. The first few sections are the most critical for your JRF prep.

---

### 2.1 🔴 CRITICAL — The Existing Database Has Old Table Names

**Problem:** If you have an existing `jrfosdb.mv.db` from before the `@Table` annotations were added, Hibernate's `ddl-auto: update` will try to create new tables (`notes`, `quizzes`, etc.) alongside the old ones (e.g. `NOTE`, `QUIZ`). Your old data will be in the old tables and the app will appear empty.

**Fix needed:**
- Either delete `~/.jrfos/jrfosdb.mv.db` and `~/.jrfos/jrfosdb.trace.db` to start fresh (all study data is lost but syllabus is reseeded automatically).
- OR add a Flyway/Liquibase migration to rename the old tables. For a solo local app, deleting and reseeding is simpler.

---

### 2.2 🔴 CRITICAL — Resources Page Has No Frontend UI

**Problem:** `ResourcesPage` exists as a route and the backend is fully implemented (upload, download, delete), but the frontend page component only shows a placeholder. You cannot upload PDFs, notes, or PYQs through the UI.

**What to build:**
- File upload form (drag-and-drop + browse)
- Resource list with type badges (PDF, VIDEO, LINK, PYQ)
- Download/open button
- Filter by type or topic
- Year field for PYQs

---

### 2.3 🔴 CRITICAL — Active Quiz Page Has No Answer Submission Loop

**Problem:** `ActiveQuizPage` loads questions but there is no visible UI for selecting answers — the submit logic exists in the backend (`QuizService.submitQuiz`) but the frontend doesn't render option buttons.

**What to build:**
- Radio button option selector for each question
- Navigation between questions (prev/next)
- Submit all answers at once
- Post-submission review screen showing correct/incorrect per question with explanations

---

### 2.4 🟠 HIGH — Mock Test Entry Modal Missing Subject-Wise Performance

**Problem:** `MockTestEntryModal` exists but has not been read — it likely only records the total score. The backend `MockTestRequest` supports `performances` (per-subject correct/incorrect/unattempted), but the modal probably doesn't have that UI.

**What to build:**
- Per-subject performance grid in the entry modal
- Input fields for correct, incorrect, unattempted per subject
- Auto-calculate total score from Paper I + Paper II

---

### 2.5 🟠 HIGH — No "Today's Due Flashcards" Count on Dashboard

**Problem:** Dashboard shows 4 stat cards but none of them show pending flashcard reviews.

**What to build:**
- Add a 5th card or a small badge: "X cards due for review today"
- Link it directly to the flashcards page
- Backend: add `GET /api/flashcards/due-count` endpoint that returns total due cards across all decks

---

### 2.6 🟠 HIGH — AI Planner Regeneration Button Missing

**Problem:** The planner generates a plan once per day. If it's wrong or you want a different focus, you cannot regenerate it.

**What to build:**
- "Regenerate Plan" button that deletes today's plan and generates a fresh one
- Backend: add `DELETE /api/planner/today` endpoint
- Show a confirmation dialog before deleting

---

### 2.7 🟠 HIGH — No Mock Test Detail View

**Problem:** Mock tests are listed but you cannot click into a test to see the subject-wise breakdown in detail.

**What to build:**
- `MockTestDetailPage` at `/mock-tests/:id`
- Shows Paper I and Paper II scores separately
- Shows per-subject accuracy bars
- Shows notes/observations field

---

### 2.8 🟡 MEDIUM — Quiz History Has No Filtering or Search

**Problem:** All quizzes are listed together. As you take more quizzes (especially AI-generated), the list becomes cluttered.

**What to build:**
- Filter by subject or topic (dropdown)
- Filter by completed/untaken
- Sort by date, score, or topic name
- Search by quiz title

---

### 2.9 🟡 MEDIUM — Sessions Page Missing Topic Filter

**Problem:** Session history shows all sessions. No way to filter by subject or topic to see how much time you've spent on specific areas.

**What to build:**
- Filter dropdown for subject/topic
- Date range picker
- Total hours for the filtered period
- Backend already has `GET /api/sessions/topic/:topicId`

---

### 2.10 🟡 MEDIUM — Notes Page Missing Markdown Preview in Card

**Problem:** Note cards in `NotesPage` strip markdown with `.replace(/[#*`]/g, '')` — this is fragile and loses formatting context.

**What to build:**
- Use a proper markdown-to-plain-text converter for the card preview
- Or show a 3-line truncated markdown preview using `MDEditor.Markdown` with CSS clamp

---

### 2.11 🟡 MEDIUM — No Notification/Reminder System

**Problem:** There is a notification bell in the TopBar that always shows a red dot. It does nothing.

**What to build:**
- Notifications array stored in localStorage or backend
- Automatic notifications for:
  - "You have X flashcards due for review"
  - "You haven't studied today — keep your streak alive!"
  - "Your study plan for today hasn't been generated yet"
- Click bell to open a dropdown list of notifications
- Mark as read functionality

---

### 2.12 🟡 MEDIUM — Chat History Not Grouped by Date

**Problem:** Chat messages are shown as one long flat list. After a few days of use this becomes hard to navigate.

**What to build:**
- Group messages by date ("Today", "Yesterday", "Jun 20", etc.)
- Date separator dividers between groups
- Scroll to bottom button when not at the bottom

---

### 2.13 🟡 MEDIUM — Planner Has No Weekly View

**Problem:** Planner only shows today. You cannot see what you planned yesterday or set goals for the week.

**What to build:**
- Week strip at the top showing Mon–Sun
- Click a past day to view its plan (read-only)
- Streak indicator on each day
- Backend: `GET /api/planner?date=YYYY-MM-DD` already supported via `getPlanForDate`

---

### 2.14 🟡 MEDIUM — Analytics Missing Mock Test Score Card

**Problem:** Analytics page shows study hours and mastery but does not surface your best or latest mock test score prominently.

**What to build:**
- "Latest Mock Score" stat card with JRF level indicator
- "Best Mock Score" card
- "Avg Mock Score (last 5)" card
- These already exist in the backend response data

---

### 2.15 🟢 LOW / POLISH — Dark Mode Toggle (Currently Always Dark)

**Problem:** `tailwind.config.js` has `darkMode: 'class'` but the `dark` class is never toggled. The app is permanently dark.

**What to build:**
- Theme toggle button in TopBar
- Save preference to localStorage
- Apply `dark` class to `<html>` element

---

### 2.16 🟢 LOW / POLISH — Keyboard Shortcuts

**What to build:**
- `Ctrl+S` in NoteEditor → Save (already partially there via auto-save, but explicit shortcut is expected)
- `Space` in ActiveReviewPage → Flip flashcard
- `1/2/3/4` → Rate flashcard (Again/Hard/Good/Easy)
- `Escape` → Close any open modal

---

### 2.17 🟢 LOW / POLISH — Progress Heatmap on Analytics Page

**What to build:**
- GitHub-style contribution heatmap showing study activity over the last 12 months
- Each cell = one day, color intensity = study hours
- Click a cell to see sessions from that day
- Backend already returns all sessions — just need to aggregate by date on the frontend

---

### 2.18 🟢 LOW / POLISH — Subject Progress on SubjectCard Needs `completedTopics` Fix

**Problem:** `SubjectCard` shows "0 / N Mastered" for all subjects because the `completedTopics` field counts topics with `MasteryLevel.MASTERED` only — but you may have topics at `REVISION` or `LEARNING` that represent significant progress.

**What to build:**
- Show a secondary count: "X in revision, Y mastered"
- Or change the progress bar to show a segmented bar: Not Started / Learning / Revision / Mastered

---

### 2.19 🟢 LOW / POLISH — Session Notes Field

**Problem:** `StudySession` entity has a `notes` field and the request DTO carries it, but the timer UI has no text input for session notes.

**What to build:**
- Optional "Session Notes" textarea in ActiveTimer (collapsed by default, expand with a button)
- Show note preview in SessionHistory rows

---

### 2.20 🟢 LOW / POLISH — Export Study Report

**What to build:**
- "Export Report" button on Analytics page
- Generates a PDF or plain text summary:
  - Total study hours
  - Topics mastered per subject
  - Quiz performance summary
  - Mock test trend
  - Weak areas
- Useful for self-review before the exam

---

### 2.21 🟢 LOW / POLISH — PYQ Integration

**Problem:** The `ResourceType` enum includes `PYQ` and the `Resource` entity has a `year` field. But there is no dedicated PYQ viewer page.

**What to build:**
- `PYQsPage` at `/resources/pyq`
- Filter by year (2023, 2022, etc.)
- View PDF inline
- Mark specific questions as "practised"

---

### 2.22 🟢 LOW / POLISH — Global Search — Real Results

**Problem:** `GlobalSearchModal` only searches the static navigation menu. It does not search your notes, topics, or flashcards.

**What to build:**
- Backend: `GET /api/search?q=query` — searches notes (title/content), topics (name), and flashcards (front content)
- Returns grouped results: Notes, Topics, Flashcards
- Frontend: Replace the static menu filter with a debounced API call
- Show result count per category

---

## PART 3 — SUMMARY TABLE

| # | Change | Category | Status |
|---|--------|----------|--------|
| 1 | Removed duplicate DatabaseSeeder | Bug Fix | ✅ Done |
| 2 | H2 path made absolute | Bug Fix | ✅ Done |
| 3 | Reserved SQL word in Resource entity | Bug Fix | ✅ Done |
| 4 | API key secured via env variable | Security | ✅ Done |
| 5 | All analytics metrics made real | Analytics | ✅ Done |
| 6 | Due flashcards wired into planner | Feature Fix | ✅ Done |
| 7 | AI chat exam-aware prompt | AI Quality | ✅ Done |
| 8 | All entities get explicit @Table names | Stability | ✅ Done |
| 9 | SessionQuality expanded to 5 levels | Data Model | ✅ Done |
| 10 | Timer topic picker + quality selector | UX | ✅ Done |
| 11 | Session history quality badges | UX | ✅ Done |
| 12 | StudyStats chart timezone fix | Bug Fix | ✅ Done |
| 13 | Note auto-save every 30s | UX | ✅ Done |
| 14 | Chat clear confirmation | UX | ✅ Done |
| 15 | Flashcard review session persistence | UX | ✅ Done |
| 16 | TopicItem cache invalidation fix | Bug Fix | ✅ Done |
| 17 | Sidebar live readiness bar | UX | ✅ Done |
| 18 | Dashboard countdown + greeting | Personalization | ✅ Done |
| 19 | Personal config file | DX | ✅ Done |
| 20 | EmptyState action prop fixed | Bug Fix | ✅ Done |
| 21 | Tailwind typography plugin | UI Fix | ✅ Done |
| 22 | Start script fixed | DevOps | ✅ Done |
| 23 | Root .gitignore created | Security | ✅ Done |
| 24 | NoteService topic unlinking fixed | Bug Fix | ✅ Done |
| 25 | Old table rename migration needed | 🔴 Critical TODO | ❌ Pending |
| 26 | Resources page UI | 🔴 Critical TODO | ✅ Done |
| 27 | Active quiz answer submission | 🔴 Critical TODO | ✅ Done |
| 28 | Mock test per-subject entry modal | 🟠 High TODO | ✅ Done |
| 29 | Dashboard due flashcard count | 🟠 High TODO | ❌ Pending |
| 30 | Planner regenerate button | 🟠 High TODO | ❌ Pending |
| 31 | Mock test detail view | 🟠 High TODO | ❌ Pending |
| 32 | Quiz history filtering | 🟡 Medium TODO | ❌ Pending |
| 33 | Session topic filter | 🟡 Medium TODO | ❌ Pending |
| 34 | Notes markdown preview fix | 🟡 Medium TODO | ❌ Pending |
| 35 | Notification system | 🟡 Medium TODO | ❌ Pending |
| 36 | Chat date grouping | 🟡 Medium TODO | ❌ Pending |
| 37 | Planner weekly view | 🟡 Medium TODO | ❌ Pending |
| 38 | Analytics mock test stat cards | 🟡 Medium TODO | ❌ Pending |
| 39 | Theme toggle | 🟢 Polish TODO | ❌ Pending |
| 40 | Keyboard shortcuts | 🟢 Polish TODO | ❌ Pending |
| 41 | Activity heatmap | 🟢 Polish TODO | ❌ Pending |
| 42 | Segmented progress bar on subject cards | 🟢 Polish TODO | ❌ Pending |
| 43 | Session notes textarea | 🟢 Polish TODO | ❌ Pending |
| 44 | Study report export | 🟢 Polish TODO | ❌ Pending |
| 45 | PYQ viewer page | 🟢 Polish TODO | ❌ Pending |
| 46 | Global search — real backend results | 🟢 Polish TODO | ❌ Pending |

---

*Last updated: June 2026*
