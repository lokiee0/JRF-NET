import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Book, Clock, Target, Calendar, MessageSquare, Flame } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Mock static search results for now, as we don't have a global search backend endpoint yet
  // In a real implementation, this would hit /api/search?q=query
  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { title: 'Subjects & Topics', path: '/subjects', icon: Book, keywords: ['syllabus', 'subject', 'topic'] },
    { title: 'Study Sessions', path: '/sessions', icon: Clock, keywords: ['timer', 'study', 'session'] },
    { title: 'Quizzes', path: '/quizzes', icon: Target, keywords: ['quiz', 'test', 'question'] },
    { title: 'Flashcards', path: '/flashcards', icon: Flame, keywords: ['flashcard', 'review', 'deck'] },
    { title: 'Mock Tests', path: '/mock-tests', icon: Target, keywords: ['mock', 'test', 'score'] },
    { title: 'Analytics', path: '/analytics', icon: Target, keywords: ['chart', 'analytics', 'progress', 'score'] },
    { title: 'Daily Planner', path: '/planner', icon: Calendar, keywords: ['plan', 'todo', 'task'] },
    { title: 'AI Chat', path: '/chat', icon: MessageSquare, keywords: ['ai', 'chat', 'ask', 'help'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-surface-border">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search JRF OS (e.g., 'flashcards', 'planner')..."
              className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && filteredItems.length > 0) {
                  handleSelect(filteredItems[0].path);
                }
              }}
            />
            <div className="text-xs text-gray-500 bg-dark-900 px-2 py-1 rounded">ESC</div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() === '' ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Start typing to search across your study OS</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <ul className="space-y-1">
                {filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleSelect(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left hover:bg-dark-800 ${index === 0 ? 'bg-dark-800/50' : ''}`}
                      >
                        <div className="p-2 rounded-lg bg-dark-900 text-accent-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-gray-200 font-medium">{item.title}</span>
                        <span className="text-xs text-gray-500">Jump to</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
