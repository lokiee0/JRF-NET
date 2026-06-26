import { Badge } from '../ui';

const masteryConfig = {
  NOT_STARTED: { label: 'Not Started', variant: 'default' },
  LEARNING: { label: 'Learning', variant: 'info' },
  REVISION: { label: 'Revision', variant: 'warning' },
  MASTERED: { label: 'Mastered', variant: 'success' },
};

export default function MasteryBadge({ level = 'NOT_STARTED', className }) {
  const config = masteryConfig[level] || masteryConfig.NOT_STARTED;
  
  return (
    <Badge variant={config.variant} className={className} dot>
      {config.label}
    </Badge>
  );
}
