import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTestApi } from '../../api/mockTests';
import { subjectApi } from '../../api/subjects';
import { Button, Input } from '../ui';

export default function MockTestEntryModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState('');
  const [paper1Score, setPaper1Score] = useState('');
  const [paper2Score, setPaper2Score] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [percentile, setPercentile] = useState('');
  
  const [performances, setPerformances] = useState([]);

  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll() });
  const subjects = subjectsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => mockTestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
      resetAndClose();
    },
  });

  const resetAndClose = () => {
    setTitle('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setPlatform('');
    setPaper1Score('');
    setPaper2Score('');
    setTotalScore('');
    setPercentile('');
    setPerformances([]);
    onClose();
  };

  const handleAddPerformance = () => {
    setPerformances([...performances, { subjectId: '', correctQuestions: '', incorrectQuestions: '', unattemptedQuestions: '' }]);
  };

  const updatePerformance = (index, field, value) => {
    const newPerfs = [...performances];
    newPerfs[index][field] = value;
    setPerformances(newPerfs);
  };

  const handleRemovePerformance = (index) => {
    const newPerfs = [...performances];
    newPerfs.splice(index, 1);
    setPerformances(newPerfs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !testDate || !totalScore) return;

    const formattedPerformances = performances
      .filter(p => p.subjectId && p.correctQuestions !== '')
      .map(p => ({
        subjectId: parseInt(p.subjectId, 10),
        correctQuestions: parseInt(p.correctQuestions, 10) || 0,
        incorrectQuestions: parseInt(p.incorrectQuestions, 10) || 0,
        unattemptedQuestions: parseInt(p.unattemptedQuestions, 10) || 0,
      }));

    createMutation.mutate({
      title,
      testDate,
      platform,
      paper1Score: paper1Score ? parseInt(paper1Score, 10) : null,
      paper2Score: paper2Score ? parseInt(paper2Score, 10) : null,
      totalScore: parseInt(totalScore, 10),
      percentile: percentile ? parseFloat(percentile) : null,
      performances: formattedPerformances
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass rounded-2xl overflow-hidden border border-surface-border shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-border/50 bg-dark-900/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-200">Log Mock Test Score</h2>
          <button onClick={resetAndClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="mockTestForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Test Title/Name *</label>
                <Input placeholder="E.g., Testbook Full Mock 1" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Platform</label>
                <Input placeholder="E.g., Testbook, Gradeup" value={platform} onChange={(e) => setPlatform(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date Taken *</label>
                <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Percentile (Optional)</label>
                <Input type="number" step="0.01" placeholder="99.5" value={percentile} onChange={(e) => setPercentile(e.target.value)} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-surface-border bg-dark-900/30">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Overall Scores</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Paper 1 Score (out of 100)</label>
                  <Input type="number" value={paper1Score} onChange={(e) => setPaper1Score(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Paper 2 Score (out of 200)</label>
                  <Input type="number" value={paper2Score} onChange={(e) => setPaper2Score(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-accent-400 mb-1">Total Score (out of 300) *</label>
                  <Input type="number" value={totalScore} onChange={(e) => setTotalScore(e.target.value)} required className="border-accent-500/50" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300">Topic-wise Performance (Optional)</h3>
                  <p className="text-xs text-gray-500">Log accuracy for specific subjects to track weaknesses.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddPerformance}>+ Add Topic</Button>
              </div>

              <div className="space-y-3">
                {performances.map((perf, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 rounded-lg border border-surface-border/50 bg-dark-900/50">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <select 
                        value={perf.subjectId} 
                        onChange={(e) => updatePerformance(index, 'subjectId', e.target.value)}
                        className="col-span-1 bg-dark-900 border border-surface-border rounded-lg px-2 py-1.5 text-xs text-gray-200 outline-none focus:border-accent-500/50"
                      >
                        <option value="">Select Subject...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <Input type="number" placeholder="Correct" value={perf.correctQuestions} onChange={(e) => updatePerformance(index, 'correctQuestions', e.target.value)} className="h-8 text-xs" />
                      <Input type="number" placeholder="Incorrect" value={perf.incorrectQuestions} onChange={(e) => updatePerformance(index, 'incorrectQuestions', e.target.value)} className="h-8 text-xs" />
                      <Input type="number" placeholder="Unattempted" value={perf.unattemptedQuestions} onChange={(e) => updatePerformance(index, 'unattemptedQuestions', e.target.value)} className="h-8 text-xs" />
                    </div>
                    <button type="button" onClick={() => handleRemovePerformance(index)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-4 border-t border-surface-border bg-dark-900/50 flex justify-end gap-3 flex-shrink-0">
          <Button variant="ghost" type="button" onClick={resetAndClose}>Cancel</Button>
          <Button type="submit" form="mockTestForm" loading={createMutation.isPending} disabled={!title || !testDate || !totalScore}>
            Save Mock Test
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
