import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Trash2 } from 'lucide-react';
import { sessionApi } from '../../api/sessions';
import { Card, Spinner } from '../ui';

const QUALITY_META = {
  POOR:   { label: '😞 Rough',  color: 'text-red-400    bg-red-400/10'    },
  LOW:    { label: '😐 Okay',   color: 'text-orange-400 bg-orange-400/10' },
  MEDIUM: { label: '🙂 Good',   color: 'text-yellow-400 bg-yellow-400/10' },
  HIGH:   { label: '😊 Great',  color: 'text-emerald-400 bg-emerald-400/10' },
  PEAK:   { label: '🚀 Peak',   color: 'text-blue-400   bg-blue-400/10'   },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0  },
};

export default function SessionHistory() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => sessionApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionApi.delete(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center"><Spinner /></div>;

  const sessions = response?.data || [];

  const formatDuration = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <Card header={
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-200">Session History</h3>
        <span className="text-xs text-gray-500">{sessions.length} total</span>
      </div>
    }>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No sessions recorded yet. Start the timer above!
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {sessions.map((session, i) => {
            const q = QUALITY_META[session.quality] ?? QUALITY_META.MEDIUM;

            return (
              <motion.div
                key={session.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 hover:bg-dark-800 transition-colors group"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div className="p-2 rounded-lg bg-dark-800 text-accent-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-200 flex items-center gap-2 flex-wrap">
                      <span className="truncate max-w-[160px]">
                        {session.topicName || 'General Study'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-gray-400 shrink-0">
                        {formatDuration(session.durationMinutes)}
                      </span>
                      {session.quality && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${q.color}`}>
                          {q.label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {session.subjectName || 'Uncategorized'} •{' '}
                      {new Date(session.startTime).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteMutation.mutate(session.id)}
                  className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
