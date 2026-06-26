import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const colorMap = {
  accent: 'from-accent-500 to-accent-400',
  success: 'from-emerald-500 to-emerald-400',
  warning: 'from-amber-500 to-amber-400',
  error: 'from-red-500 to-red-400',
  info: 'from-blue-500 to-blue-400',
};

/**
 * Animated progress bar with percentage and color variants
 * @param {Object} props
 * @param {number} props.value - Current progress (0-100)
 * @param {'accent'|'success'|'warning'|'error'|'info'} props.color - Bar color
 * @param {string} props.label - Optional label text
 * @param {boolean} props.showPercent - Show percentage text
 * @param {'sm'|'md'|'lg'} props.size - Bar height
 * @param {string} props.className - Additional classes
 */
export default function ProgressBar({
  value = 0,
  color = 'accent',
  label,
  showPercent = true,
  size = 'md',
  className,
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-400">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-gray-300">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-dark-800 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorMap[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
