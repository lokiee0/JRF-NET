import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Plus, Trash2, CheckCircle, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizzes';
import { Card, Button, Spinner, EmptyState, ProgressBar } from '../../components/ui';
import QuizBuilderModal from '../../components/quizzes/QuizBuilderModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function QuizzesPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => quizApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
  });

  const quizzes = response?.data || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">AI Quiz Engine</h1>
          </div>
          <p className="text-gray-500">Test your knowledge with AI-generated multiple choice questions.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3 items-center">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 shadow-lg"
            icon={<Sparkles className="w-4 h-4" />} 
            onClick={() => setIsBuilderOpen(true)}
          >
            Generate AI Quiz
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : quizzes.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={Target} 
            title="No quizzes yet" 
            description="Generate your first AI quiz to test your preparation."
            action={{ label: 'Generate Quiz', onClick: () => setIsBuilderOpen(true) }}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <Card key={quiz.id} hover className="flex flex-col relative group cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(quiz.id); }} 
                  className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                  {quiz.source.replace('_', ' ')}
                </span>
                {quiz.takenAt && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> COMPLETED
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-200 mb-1">{quiz.title}</h3>
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> {quiz.topicName}
              </p>

              <div className="mt-auto pt-4 border-t border-surface-border/50">
                {quiz.takenAt ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Score: {quiz.correctAnswers}/{quiz.totalQuestions}</span>
                      <span className="font-semibold text-gray-200">{Math.round(quiz.scorePercentage)}%</span>
                    </div>
                    <ProgressBar value={quiz.scorePercentage} size="sm" color={quiz.scorePercentage >= 80 ? 'success' : quiz.scorePercentage >= 50 ? 'warning' : 'danger'} />
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 text-center py-1">
                    {quiz.totalQuestions} Questions • Untaken
                  </div>
                )}
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <QuizBuilderModal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
    </motion.div>
  );
}
