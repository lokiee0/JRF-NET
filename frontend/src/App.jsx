import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Spinner } from './components/ui';

// Lazy-loaded page components
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const SubjectsPage = lazy(() => import('./pages/subjects/SubjectsPage'));
const SubjectDetailsPage = lazy(() => import('./pages/subjects/SubjectDetailsPage'));
const SessionsPage = lazy(() => import('./pages/sessions/SessionsPage'));
const NotesPage = lazy(() => import('./pages/notes/NotesPage'));
const NoteEditorPage = lazy(() => import('./pages/notes/NoteEditorPage'));
const ResourcesPage = lazy(() => import('./pages/resources/ResourcesPage'));
const QuizzesPage = lazy(() => import('./pages/quizzes/QuizzesPage'));
const ActiveQuizPage = lazy(() => import('./pages/quizzes/ActiveQuizPage'));
const FlashcardsPage = lazy(() => import('./pages/flashcards/FlashcardsPage'));
const ActiveReviewPage = lazy(() => import('./pages/flashcards/ActiveReviewPage'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));
const MockTestsPage = lazy(() => import('./pages/mock-tests/MockTestsPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const PlannerPage = lazy(() => import('./pages/planner/PlannerPage'));

/**
 * Loading fallback displayed during lazy load
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Root App component with route definitions
 */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:id" element={<SubjectDetailsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:id" element={<NoteEditorPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id" element={<ActiveQuizPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/flashcards/review/:deckId" element={<ActiveReviewPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/mock-tests" element={<MockTestsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
