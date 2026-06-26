import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { flashcardApi } from '../../api/flashcards';
import { Card, Button, Spinner, EmptyState, Badge } from '../../components/ui';
import DeckBuilderModal from '../../components/flashcards/DeckBuilderModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FlashcardsPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['flashcardDecks'],
    queryFn: () => flashcardApi.getAllDecks(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => flashcardApi.deleteDeck(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] }),
  });

  const decks = response?.data || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">Spaced Repetition</h1>
          </div>
          <p className="text-gray-500">Memorize effectively using the SM-2 spaced repetition algorithm.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsBuilderOpen(true)}>
            New Deck
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : decks.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={Layers} 
            title="No decks found" 
            description="Create your first flashcard deck or let AI generate one for you."
            action={{ label: 'Create Deck', onClick: () => setIsBuilderOpen(true) }}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <Card key={deck.id} hover className="flex flex-col relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => deleteMutation.mutate(deck.id)} 
                  className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant={deck.dueCardsCount > 0 ? "warning" : "secondary"}>
                  <Clock className="w-3 h-3 mr-1" />
                  {deck.dueCardsCount} Due
                </Badge>
                <Badge variant="outline">{deck.totalCards} Cards</Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-200 mb-1">{deck.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                {deck.description || (deck.topicName ? `Topic: ${deck.topicName}` : 'No description provided.')}
              </p>

              <div className="mt-auto pt-4 border-t border-surface-border/50">
                <Button 
                  className="w-full" 
                  variant={deck.dueCardsCount > 0 ? "primary" : "secondary"}
                  icon={<Play className="w-4 h-4" />}
                  onClick={() => navigate(`/flashcards/review/${deck.id}`)}
                  disabled={deck.dueCardsCount === 0}
                >
                  {deck.dueCardsCount > 0 ? "Review Now" : "All Caught Up"}
                </Button>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <DeckBuilderModal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
    </motion.div>
  );
}
