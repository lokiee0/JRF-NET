import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'glass',
  outlined: 'bg-transparent border border-surface-border',
  elevated: 'glass glow-border',
};

/**
 * Glassmorphism card component with entrance animation
 * @param {Object} props
 * @param {'default'|'outlined'|'elevated'} props.variant - Card style
 * @param {React.ReactNode} props.header - Optional header content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {boolean} props.hover - Enable hover effects
 * @param {boolean} props.animate - Enable entrance animation
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Card body content
 */
export default function Card({
  variant = 'default',
  header,
  footer,
  hover = true,
  animate = true,
  className,
  children,
  ...props
}) {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={cn(
        'rounded-2xl overflow-hidden',
        variantStyles[variant],
        hover && 'glass-hover',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-surface-border/50">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-surface-border/50 bg-dark-950/30">
          {footer}
        </div>
      )}
    </Component>
  );
}
