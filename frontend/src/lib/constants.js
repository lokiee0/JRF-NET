/**
 * ─────────────────────────────────────────────
 *  PERSONAL CONFIGURATION — edit these values
 * ─────────────────────────────────────────────
 */

/** Your name — shown on the dashboard greeting */
export const USER_NAME = 'Warrior';

/**
 * Target UGC NET exam date (YYYY-MM-DD).
 * UGC NET is typically held in June & December each year.
 * Update this to your next scheduled exam date.
 */
export const EXAM_DATE = '2025-12-15';

/** Exam session label shown in the countdown */
export const EXAM_LABEL = 'UGC NET JRF December 2025';

// ──────────────────────────────────────────────

/**
 * Navigation items for the sidebar
 */
export const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',     icon: 'LayoutDashboard' },
  { path: '/subjects',   label: 'Subjects',       icon: 'BookOpen'        },
  { path: '/sessions',   label: 'Study Sessions', icon: 'Clock'           },
  { path: '/notes',      label: 'Notes',          icon: 'FileText'        },
  { path: '/resources',  label: 'Resources',      icon: 'FolderOpen'      },
  { path: '/quizzes',    label: 'Quizzes',        icon: 'HelpCircle'      },
  { path: '/flashcards', label: 'Flashcards',     icon: 'Layers'          },
  { path: '/chat',       label: 'AI Chat',        icon: 'MessageSquare'   },
  { path: '/mock-tests', label: 'Mock Tests',     icon: 'ClipboardCheck'  },
  { path: '/analytics',  label: 'Analytics',      icon: 'BarChart3'       },
  { path: '/planner',    label: 'Planner',        icon: 'Calendar'        },
];

/**
 * Page title mapping for TopBar
 */
export const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/subjects':   'Subjects',
  '/sessions':   'Study Sessions',
  '/notes':      'Notes',
  '/resources':  'Resources',
  '/quizzes':    'Quizzes',
  '/flashcards': 'Flashcards',
  '/chat':       'AI Chat',
  '/mock-tests': 'Mock Tests',
  '/analytics':  'Analytics',
  '/planner':    'Planner',
};
