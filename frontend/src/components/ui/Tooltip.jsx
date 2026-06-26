import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Hover tooltip with Framer Motion animation
 * @param {Object} props
 * @param {string} props.content - Tooltip text
 * @param {'top'|'bottom'|'left'|'right'} props.position - Tooltip position
 * @param {number} props.delay - Delay before showing (ms)
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Trigger element
 */
export default function Tooltip({
  content,
  position = 'top',
  delay = 200,
  className,
  children,
}) {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const show = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const motionOrigin = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-50 px-3 py-1.5 text-xs font-medium text-gray-200 bg-dark-800 border border-surface-border rounded-lg whitespace-nowrap shadow-xl',
              positionStyles[position],
              className
            )}
            initial={motionOrigin[position].initial}
            animate={motionOrigin[position].animate}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
