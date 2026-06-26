import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, ThumbsUp, AlertTriangle } from 'lucide-react';
import { flashcardApi } from '../../api/flashcards';
import { Button, Spinner, Card } from '../../components/ui';

/**
 * Persist which card IDs have already been reviewed in this session so that
 * refreshing the browser or reopening the deck continues where you left off
 * rather than re-reviewing the same cards.
 */
const REVIEWED_KEY = (deckId) => `flashcard_reviewed_${deckId}`;

export default function ActiveReviewPage() {
  const { deckId }   = useParams();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  // IDs of cards already reviewed this session (persisted to localStorage)
  const [reviewedIds, setReviewedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(REVIEWED_KEY(deckId));
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  // Flip state for the current card
  const [isFlipped, setIsFlipped] = useState(false);

  // Persist reviewed IDs
  useEffect(() => {
    localStorage.setItem(REVIEWED_KEY(deckId), JSON.stringify([...reviewedIds]));
  }, [reviewedIds, deckId]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['dueCards', deckId],
    queryFn:  () => flashcardApi.getDueCards(deckId),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ cardId, quality }) => flashcardApi.reviewCard(cardId, quality),
    onSuccess: (_, { cardId }) => {
      setReviewedIds(prev => new Set([...prev, cardId]));
      setIsFlipped(false);
    },
  });

  const allCards    = response?.data || [];
  // Filter out already-reviewed cards so the queue reflects remaining work
  const pendingCards = allCards.filter(c => !reviewedIds.has(c.id));
  const currentCard  = pendingCards[0] ?? null;
  const isFinished   = !isLoading && (allCards.length === 0 || pendingCards.length === 0);

  if (isLoading) {
    return <div className="flex justify-center p-20"><Spinner size="lg" /></div>;
  }

  const handleReview = (quality) => {
    if (!currentCard) return;
    reviewMutation.mutate({ cardId: currentCard.id, quality });
  };

  const finishSession = () => {
    // Clear the session-review tracking for this deck
    localStorage.removeItem(REVIEWED_KEY(deckId));
    queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
    queryClient.invalidateQueries({ queryKey: ['dueCards', deckId] });
    navigate('/flashcards');
  };

  const reviewed  = reviewedIds.size;
  const total     = allCards.length;
  const progress  = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={finishSession}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> End Session
        </button>

        {!isFinished && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{reviewed} / {total} reviewed</span>
            <div className="w-32 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isFinished ? (
          /* ── Completion screen ───────────────────────────────────────── */
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-100">All Caught Up!</h2>
            <p className="text-gray-400 max-w-md">
              You've reviewed all due cards for this deck. Your spaced repetition intervals have been updated and saved.
            </p>
            <Button onClick={finishSession} className="mt-4">Back to Decks</Button>
          </motion.div>
        ) : (
          /* ── Review card ─────────────────────────────────────────────── */
          <div key={currentCard.id} className="space-y-8">

            {/* Flip card */}
            <div style={{ perspective: '1200px' }}>
              <motion.div
                className="relative w-full cursor-pointer"
                style={{ minHeight: 380, transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.55, type: 'spring', stiffness: 260, damping: 22 }}
                onClick={() => !isFlipped && setIsFlipped(true)}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl glass border border-surface-border flex flex-col items-center justify-center p-8 text-center shadow-2xl bg-gradient-to-br from-dark-800 to-dark-900"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="absolute top-6 text-xs font-bold tracking-widest text-gray-500 uppercase">Question</span>
                  <p className="text-2xl font-bold text-gray-200 leading-tight">{currentCard.frontContent}</p>
                  <span className="absolute bottom-6 text-sm text-accent-500/70 animate-pulse">
                    Click to reveal answer
                  </span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl glass border border-accent-500/30 flex flex-col items-center justify-center p-8 text-center shadow-2xl bg-gradient-to-br from-dark-900 to-dark-950 overflow-y-auto"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="absolute top-6 text-xs font-bold tracking-widest text-accent-500 uppercase">Answer</span>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">{currentCard.backContent}</p>
                </div>
              </motion.div>
            </div>

            {/* SM-2 feedback buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
              className={`grid grid-cols-4 gap-4 ${!isFlipped && 'pointer-events-none'}`}
            >
              {[
                { quality: 0, label: 'Again',  sub: '< 1 min', icon: <RefreshCw  className="w-5 h-5 mb-2" />, border: 'border-red-500/30',     bg: 'bg-red-500/10',     text: 'text-red-400',     hover: 'hover:bg-red-500/20'     },
                { quality: 3, label: 'Hard',   sub: 'Days',    icon: <AlertTriangle className="w-5 h-5 mb-2" />, border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', hover: 'hover:bg-orange-500/20' },
                { quality: 4, label: 'Good',   sub: 'Weeks',   icon: <ThumbsUp    className="w-5 h-5 mb-2" />, border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20' },
                { quality: 5, label: 'Easy',   sub: 'Months',  icon: <CheckCircle className="w-5 h-5 mb-2" />, border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   hover: 'hover:bg-blue-500/20'   },
              ].map(opt => (
                <button
                  key={opt.quality}
                  onClick={() => handleReview(opt.quality)}
                  disabled={reviewMutation.isPending}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border ${opt.border} ${opt.bg} ${opt.text} ${opt.hover} transition-colors disabled:opacity-50`}
                >
                  {opt.icon}
                  <span className="font-bold text-sm">{opt.label}</span>
                  <span className="text-[10px] mt-1 opacity-70">{opt.sub}</span>
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
