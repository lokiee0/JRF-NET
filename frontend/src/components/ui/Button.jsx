import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary:
    'bg-gradient-to-r from-accent-500 to-accent-400 text-white shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:brightness-110',
  secondary:
    'bg-surface-light text-gray-200 border border-surface-border hover:bg-surface-lighter hover:border-accent-500/30',
  ghost:
    'bg-transparent text-gray-300 hover:bg-surface-light hover:text-white',
  danger:
    'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

/**
 * Premium button component with variants, sizes, loading state, and icon support
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} props.variant - Visual style
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.loading - Shows spinner and disables
 * @param {boolean} props.disabled - Disables the button
 * @param {React.ReactNode} props.icon - Icon element (left side)
 * @param {React.ReactNode} props.iconRight - Icon element (right side)
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional classes
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconRight,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-dark-950',
          variants[variant],
          sizes[size],
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
