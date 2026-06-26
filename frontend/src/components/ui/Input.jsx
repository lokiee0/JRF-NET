import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Styled input component with label, error state, and icon support
 * @param {Object} props
 * @param {string} props.label - Input label text
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.iconLeft - Left icon element
 * @param {React.ReactNode} props.iconRight - Right icon element
 * @param {string} props.className - Additional wrapper classes
 * @param {string} props.inputClassName - Additional input classes
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      className,
      inputClassName,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-sm font-medium text-gray-400">{label}</label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {iconLeft}
            </div>
          )}
          <motion.input
            ref={ref}
            type={type}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            animate={{
              borderColor: error
                ? '#ef4444'
                : focused
                ? 'rgba(109, 40, 217, 0.5)'
                : 'rgba(42, 42, 61, 1)',
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl text-sm text-gray-200 placeholder:text-gray-600',
              'bg-dark-900/80 border outline-none transition-all duration-200',
              'focus:ring-2 focus:ring-accent-500/20',
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-error ring-2 ring-error/20',
              inputClassName
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-error mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
