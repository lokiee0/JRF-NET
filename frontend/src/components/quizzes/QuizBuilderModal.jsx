import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizzes';
import { subjectApi } from '../../api/subjects';
import { Button, Input } from '../ui';

export default function QuizBuilderModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll() });
  const subjects = subjectsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => quizApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      onClose();
      navigate(`/quizzes/${res.data.id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !topicId) return;

    createMutation.mutate({
      title,
      topicId: parseInt(topicId, 10),
      source: 'AI_GENERATED',
      requestedQuestionCount: questionCount
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass rounded-2xl overflow-hidden border border-surface-border shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-border/50 bg-dark-900/50">
          <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Generate AI Quiz
          </h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Target Topic *</label>
            <select 
              value={topicId} 
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full bg-dark-900/60 border border-surface-border rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50"
              required
            >
              <option value="">Select a topic...</option>
              {subjects.map(s => (
                <optgroup key={s.id} label={s.name}>
                  {s.topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Quiz Title *</label>
            <Input placeholder="E.g., Operating Systems Quick Test" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Number of Questions (Max 10)</label>
            <Input 
              type="number" 
              min="1" max="10" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))} 
              required 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              loading={createMutation.isPending} 
              disabled={!title || !topicId}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Generate with Gemini
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
