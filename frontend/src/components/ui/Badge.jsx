import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'bg-surface-lighter text-gray-300 border-surface-border',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  accent: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * Badge component with color variants and optional dot indicator
 * @param {Object} props
 * @param {'default'|'success'|'warning'|'error'|'info'|'accent'} props.variant
 * @param {'sm'|'md'} props.size
 * @param {boolean} props.dot - Show dot indicator
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-gray-400': variant === 'default',
            'bg-emerald-400': variant === 'success',
            'bg-amber-400': variant === 'warning',
            'bg-red-400': variant === 'error',
            'bg-blue-400': variant === 'info',
            'bg-accent-400': variant === 'accent',
          })}
        />
      )}
      {children}
    </span>
  );
}
