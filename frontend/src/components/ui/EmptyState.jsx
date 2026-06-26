import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import Button from './Button';

/**
 * Empty state component with icon, title, description, and optional action.
 * Supports both legacy (actionLabel + onAction) and new (action object) API.
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon      - Lucide icon component (not element)
 * @param {string}  props.title               - Heading text
 * @param {string}  props.description         - Subtext description
 * @param {string}  [props.actionLabel]       - Legacy: button label
 * @param {Function}[props.onAction]          - Legacy: button handler
 * @param {{ label, onClick, icon, loading }} [props.action] - New: action object
 * @param {string}  [props.className]         - Additional classes
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
}) {
  // Support both old props and new action-object style
  const btnLabel   = action?.label   ?? actionLabel;
  const btnHandler = action?.onClick ?? onAction;
  const btnIcon    = action?.icon    ?? null;
  const btnLoading = action?.loading ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-surface-light/50 border border-surface-border text-gray-500">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-200 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {btnLabel && btnHandler && (
        <Button
          variant="secondary"
          size="sm"
          onClick={btnHandler}
          disabled={btnLoading}
          className="flex items-center gap-1"
        >
          {btnLoading ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block" />
          ) : (
            btnIcon
          )}
          {btnLabel}
        </Button>
      )}
    </motion.div>
  );
}
