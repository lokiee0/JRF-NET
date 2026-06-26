import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  FileText,
  FolderOpen,
  HelpCircle,
  Layers,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProgressBar from '../ui/ProgressBar';
import Tooltip from '../ui/Tooltip';
import { analyticsApi } from '../../api/analytics';

const iconMap = {
  LayoutDashboard,
  BookOpen,
  Clock,
  FileText,
  FolderOpen,
  HelpCircle,
  Layers,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  Calendar,
};

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',       icon: 'LayoutDashboard' },
  { path: '/subjects',    label: 'Subjects',         icon: 'BookOpen'        },
  { path: '/sessions',    label: 'Study Sessions',   icon: 'Clock'           },
  { path: '/notes',       label: 'Notes',            icon: 'FileText'        },
  { path: '/resources',   label: 'Resources',        icon: 'FolderOpen'      },
  { path: '/quizzes',     label: 'Quizzes',          icon: 'HelpCircle'      },
  { path: '/flashcards',  label: 'Flashcards',       icon: 'Layers'          },
  { path: '/chat',        label: 'AI Chat',          icon: 'MessageSquare'   },
  { path: '/mock-tests',  label: 'Mock Tests',       icon: 'ClipboardCheck'  },
  { path: '/analytics',   label: 'Analytics',        icon: 'BarChart3'       },
  { path: '/planner',     label: 'Planner',          icon: 'Calendar'        },
];

const sidebarVariants = {
  expanded:  { width: 260 },
  collapsed: { width: 72  },
};

const navItemVariants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

/**
 * Collapsible sidebar with navigation, branding, and live JRF readiness indicator.
 */
export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  // Fetch analytics to power the live readiness bar
  const { data: analyticsResponse } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn:  () => analyticsApi.getDashboard(),
    staleTime: 5 * 60 * 1000,
  });

  const readinessScore = analyticsResponse?.data?.jrfReadinessScore ?? 0;
  const readinessLabel = `JRF Readiness: ${readinessScore}%`;

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col glass border-r border-surface-border/50 overflow-hidden"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border/30">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-300 flex items-center justify-center shadow-lg shadow-accent-500/30">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-base font-bold gradient-text">JRF OS</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">AI Study System</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item, i) => {
          const Icon     = iconMap[item.icon];
          const isActive = location.pathname === item.path;

          const link = (
            <NavLink key={item.path} to={item.path} className="block">
              <motion.div
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group',
                  isActive
                    ? 'text-white bg-accent-500/15'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-surface-lighter/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-accent-400 to-accent-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon
                  className={cn(
                    'w-[18px] h-[18px] shrink-0 transition-colors',
                    isActive ? 'text-accent-400' : 'text-gray-500 group-hover:text-gray-400'
                  )}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-accent-500/5 pointer-events-none" />
                )}
              </motion.div>
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} content={item.label} position="right">
                {link}
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      {/* Live JRF Readiness Indicator */}
      <div className="px-3 py-4 border-t border-surface-border/30">
        <AnimatePresence>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  <span className="text-xs font-medium text-gray-400">JRF Readiness</span>
                </div>
                <span className="text-xs font-bold text-accent-300">{readinessScore}%</span>
              </div>
              <ProgressBar value={readinessScore} size="sm" color="accent" />
            </motion.div>
          ) : (
            <Tooltip content={readinessLabel} position="right">
              <div className="flex justify-center">
                <Sparkles className="w-4 h-4 text-accent-500" />
              </div>
            </Tooltip>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-3 border-t border-surface-border/30 text-gray-500 hover:text-gray-300 hover:bg-surface-lighter/50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
