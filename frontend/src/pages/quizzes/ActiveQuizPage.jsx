import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { quizApi } from '../../api/quizzes';
import { Button, Spinner, Card, ProgressBar } from '../../components/ui';

export default function ActiveQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(`quiz_answers_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(() => {
    return parseInt(localStorage.getItem(`quiz_idx_${id}`) || '0', 10);
  });

  useEffect(() => {
    localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(answers));
    localStorage.setItem(`quiz_idx_${id}`, currentQuestionIdx);
  }, [answers, currentQuestionIdx, id]);

  const clearQuizStorage = () => {
    localStorage.removeItem(`quiz_answers_${id}`);
    localStorage.removeItem(`quiz_idx_${id}`);
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getById(id),
  });

  const submitMutation = useMutation({
    mutationFn: (submitData) => quizApi.submit(submitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Spinner size="lg" /></div>;

  const quiz = response?.data;
  if (!quiz) return <div className="p-20 text-center">Quiz not found</div>;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const isCompleted = !!quiz.takenAt;

  const handleSelectOption = (option) => {
    if (isCompleted) return;
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleSubmit = () => {
    submitMutation.mutate({ quizId: quiz.id, answers });
    clearQuizStorage();
  };

  const getOptionClass = (q, optionValue) => {
    if (!isCompleted) {
      return answers[q.id] === optionValue 
        ? "border-accent-500 bg-accent-500/10" 
        : "border-surface-border bg-dark-900/50 hover:bg-dark-800 hover:border-accent-500/50 cursor-pointer";
    }

    // Completed state logic
    if (q.correctOption === optionValue) {
      return "border-success bg-success/10";
    }
    if (q.selectedOption === optionValue && q.correctOption !== optionValue) {
      return "border-danger bg-danger/10";
    }
    return "border-surface-border bg-dark-900/30 opacity-50";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/quizzes')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>
      </div>

      {isCompleted && (
        <Card className="bg-gradient-to-br from-surface to-dark-900 border-accent-500/30 shadow-xl mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-100">Quiz Completed!</h2>
            <div className="flex items-center justify-center gap-8">
              <div>
                <div className="text-5xl font-bold text-accent-400 mb-2">{Math.round(quiz.scorePercentage)}%</div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
              <div className="h-16 w-px bg-surface-border" />
              <div>
                <div className="text-3xl font-bold text-gray-200 mb-2">{quiz.correctAnswers} / {quiz.totalQuestions}</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card animate={false} className="p-0 overflow-hidden border-surface-border">
        {/* Header */}
        <div className="p-6 border-b border-surface-border bg-dark-900/30 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{quiz.topicName}</div>
            <h1 className="text-xl font-bold text-gray-200">{quiz.title}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-400">Question {currentQuestionIdx + 1} of {questions.length}</div>
            <div className="w-32 mt-2">
              <ProgressBar value={((currentQuestionIdx + 1) / questions.length) * 100} size="sm" showPercent={false} />
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="p-8">
          <div className="text-lg text-gray-200 mb-8 font-medium leading-relaxed">
            {currentQuestion.question}
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(opt => {
              const optText = currentQuestion[`option${opt}`];
              return (
                <div 
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${getOptionClass(currentQuestion, opt)}`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-dark-950 flex items-center justify-center text-xs font-bold text-gray-400 border border-surface-border/50">
                    {opt}
                  </div>
                  <div className="text-gray-300 pt-0.5">{optText}</div>
                  
                  {isCompleted && currentQuestion.correctOption === opt && (
                    <CheckCircle className="w-5 h-5 text-success ml-auto flex-shrink-0" />
                  )}
                  {isCompleted && currentQuestion.selectedOption === opt && currentQuestion.correctOption !== opt && (
                    <XCircle className="w-5 h-5 text-danger ml-auto flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {isCompleted && currentQuestion.explanation && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-sm">
              <div className="flex items-center gap-2 text-accent-400 font-semibold mb-2">
                <HelpCircle className="w-4 h-4" /> AI Explanation
              </div>
              <p className="text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-dark-900/50 border-t border-surface-border flex justify-between items-center">
          <Button 
            variant="ghost" 
            disabled={currentQuestionIdx === 0} 
            onClick={() => setCurrentQuestionIdx(idx => idx - 1)}
          >
            Previous
          </Button>

          {currentQuestionIdx === questions.length - 1 ? (
            !isCompleted && (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-500 text-white" 
                onClick={handleSubmit}
                loading={submitMutation.isPending}
                disabled={Object.keys(answers).length !== questions.length}
              >
                Submit Quiz
              </Button>
            )
          ) : (
            <Button 
              iconRight={<ChevronRight className="w-4 h-4" />} 
              onClick={() => setCurrentQuestionIdx(idx => idx + 1)}
            >
              Next Question
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
