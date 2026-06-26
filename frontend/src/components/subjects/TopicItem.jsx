import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { topicApi } from '../../api/topics';
import { subtopicApi } from '../../api/subtopics';
import { Card, ProgressBar } from '../ui';
import MasteryBadge from './MasteryBadge';

export default function TopicItem({ topic }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const toggleMasteryMutation = useMutation({
    mutationFn: ({ id, level }) => topicApi.updateMastery(id, level),
    onSuccess: () => {
      // Invalidate all subject queries (list + individual detail)
      queryClient.invalidateQueries({ queryKey: ['subject'],  exact: false });
      queryClient.invalidateQueries({ queryKey: ['subjects'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });

  const toggleSubtopicMutation = useMutation({
    mutationFn: (id) => subtopicApi.toggleComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject'],  exact: false });
      queryClient.invalidateQueries({ queryKey: ['subjects'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });

  const handleMasteryCycle = (e) => {
    e.stopPropagation();
    const levels = ['NOT_STARTED', 'LEARNING', 'REVISION', 'MASTERED'];
    const currentIndex = levels.indexOf(topic.masteryLevel);
    const nextLevel = levels[(currentIndex + 1) % levels.length];
    toggleMasteryMutation.mutate({ id: topic.id, level: nextLevel });
  };

  return (
    <Card variant="outlined" className="p-0 overflow-hidden" animate={false} hover={false}>
      {/* Topic Header */}
      <div 
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-lighter/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-gray-500">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
        
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-200">{topic.name}</h4>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
            <span>{topic.completedSubtopics} / {topic.subtopicCount} Subtopics</span>
            <div className="w-24">
              <ProgressBar value={topic.progressPercentage} size="sm" showPercent={false} />
            </div>
          </div>
        </div>

        <div onClick={handleMasteryCycle} className="cursor-pointer hover:opacity-80 transition-opacity">
          <MasteryBadge level={topic.masteryLevel} />
        </div>
      </div>

      {/* Subtopics List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-surface-border/50 bg-dark-900/30"
          >
            <div className="py-2">
              {topic.subtopics?.length > 0 ? (
                topic.subtopics.map((subtopic) => (
                  <div 
                    key={subtopic.id}
                    className="flex items-center gap-3 px-6 py-2.5 hover:bg-surface-lighter/30 group transition-colors cursor-pointer"
                    onClick={() => toggleSubtopicMutation.mutate(subtopic.id)}
                  >
                    <div className="text-gray-500 group-hover:text-accent-400 transition-colors">
                      {subtopic.isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm ${subtopic.isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                      {subtopic.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-sm text-gray-500 italic">
                  No subtopics defined.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
