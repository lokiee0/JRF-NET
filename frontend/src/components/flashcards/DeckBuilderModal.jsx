import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { flashcardApi } from '../../api/flashcards';
import { subjectApi } from '../../api/subjects';
import { Button, Input, Card } from '../ui';

export default function DeckBuilderModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [generateWithAi, setGenerateWithAi] = useState(true);
  const [cardCount, setCardCount] = useState(10);

  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll() });
  const subjects = subjectsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => flashcardApi.createDeck(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
      resetAndClose();
    },
  });

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setTopicId('');
    setGenerateWithAi(true);
    setCardCount(10);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || (generateWithAi && !topicId)) return;

    createMutation.mutate({
      title,
      description,
      topicId: topicId ? parseInt(topicId, 10) : null,
      generateWithAi,
      requestedCardCount: cardCount
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
          <h2 className="text-lg font-bold text-gray-200">Create Flashcard Deck</h2>
          <button onClick={resetAndClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Deck Title *</label>
            <Input placeholder="E.g., Algorithms Core Concepts" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <Input placeholder="Optional description..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={generateWithAi} 
                onChange={(e) => setGenerateWithAi(e.target.checked)}
                className="w-4 h-4 rounded border-surface-border bg-dark-900 text-accent-500 focus:ring-accent-500 focus:ring-offset-dark-950"
              />
              <span className="text-sm text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Auto-generate with Gemini
              </span>
            </label>
          </div>

          {generateWithAi && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Source Topic *</label>
                <select 
                  value={topicId} 
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full bg-dark-900/60 border border-surface-border rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50"
                  required={generateWithAi}
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
                <label className="block text-xs font-medium text-gray-400 mb-1">Number of Cards (Max 20)</label>
                <Input type="number" min="1" max="20" value={cardCount} onChange={(e) => setCardCount(parseInt(e.target.value, 10))} />
              </div>
            </motion.div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={resetAndClose}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending} disabled={!title || (generateWithAi && !topicId)}>
              Create Deck
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
