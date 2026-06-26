import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

/**
 * Loading spinner with size variants
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} props.size - Spinner size
 * @param {string} props.className - Additional classes
 */
export default function Spinner({ size = 'md', className }) {
  return (
    <motion.div
      className={cn(
        'rounded-full border-accent-500/30 border-t-accent-400',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}
