import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import { PAGE_TITLES } from '../../lib/constants';
import GlobalSearchModal from './GlobalSearchModal';

/**
 * Top bar with dynamic page title, search, and notifications
 * @param {Object} props
 * @param {boolean} props.sidebarCollapsed - Whether sidebar is collapsed
 */
export default function TopBar({ sidebarCollapsed }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'JRF OS';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <motion.header
        animate={{
          marginLeft: sidebarCollapsed ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 glass border-b border-surface-border/30"
      >
        {/* Page Title */}
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold text-gray-100"
        >
          {pageTitle}
        </motion.h1>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block" onClick={() => setIsSearchOpen(true)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <div
              className="w-56 pl-9 pr-4 py-2 text-sm rounded-xl bg-dark-900/60 border border-surface-border text-gray-500 cursor-pointer hover:border-accent-500/40 transition-all flex items-center"
            >
              Search anything...
            </div>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-dark-800 rounded border border-surface-border pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-surface-lighter/50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-400 ring-2 ring-surface" />
          </motion.button>
        </div>
      </motion.header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
