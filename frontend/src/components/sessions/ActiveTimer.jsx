import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, BookOpen } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '../../api/sessions';
import { subjectApi } from '../../api/subjects';
import { Card, Button } from '../ui';

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS = {
  get:    (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set:    (k, v)   => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)      => localStorage.removeItem(k),
};

const KEYS = {
  active:    'timer_isActive',
  paused:    'timer_isPaused',
  seconds:   'timer_seconds',
  startTime: 'timer_startTime',
  topicId:   'timer_topicId',
  quality:   'timer_quality',
};

export default function ActiveTimer() {
  const [isActive,   setIsActive]   = useState(() => LS.get(KEYS.active,    false));
  const [isPaused,   setIsPaused]   = useState(() => LS.get(KEYS.paused,    false));
  const [seconds,    setSeconds]    = useState(() => LS.get(KEYS.seconds,   0));
  const [startTime,  setStartTime]  = useState(() => LS.get(KEYS.startTime, null));
  const [topicId,    setTopicId]    = useState(() => LS.get(KEYS.topicId,   ''));
  const [quality,    setQuality]    = useState(() => LS.get(KEYS.quality,   'MEDIUM'));

  const queryClient = useQueryClient();
  const intervalRef = useRef(null);

  // Fetch subjects for topic picker
  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects'],
    queryFn:  () => subjectApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const subjects = subjectsRes?.data || [];

  // Persist all timer state to localStorage on every change
  useEffect(() => { LS.set(KEYS.active,    isActive);    }, [isActive]);
  useEffect(() => { LS.set(KEYS.paused,    isPaused);    }, [isPaused]);
  useEffect(() => { LS.set(KEYS.seconds,   seconds);     }, [seconds]);
  useEffect(() => { LS.set(KEYS.topicId,   topicId);     }, [topicId]);
  useEffect(() => { LS.set(KEYS.quality,   quality);     }, [quality]);
  useEffect(() => {
    if (startTime) LS.set(KEYS.startTime, startTime);
    else           LS.remove(KEYS.startTime);
  }, [startTime]);

  // Tick
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  // Auto-save guard: if user closes the window while a session is active,
  // we use the beforeunload event to warn them (can't force-save without a server).
  useEffect(() => {
    const warn = (e) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = 'You have an active study session. Stop & Save first!';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isActive]);

  const saveSessionMutation = useMutation({
    mutationFn: (data) => sessionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });

  const handleStart = () => {
    const now = new Date().toISOString();
    setIsActive(true);
    setIsPaused(false);
    if (!startTime) setStartTime(now);
  };

  const handlePause = () => setIsPaused(p => !p);

  const handleStop = () => {
    if (seconds >= 60 && startTime) {
      saveSessionMutation.mutate({
        topicId:   topicId ? parseInt(topicId, 10) : null,
        startTime: startTime,
        endTime:   new Date().toISOString(),
        quality:   quality,
      });
    }

    // Reset all state
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    setStartTime(null);

    // Clear localStorage
    Object.values(KEYS).forEach(k => LS.remove(k));
  };

  const formatTime = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const qualityOptions = [
    { value: 'POOR',   label: '😞 Rough',   color: 'text-red-400'    },
    { value: 'LOW',    label: '😐 Okay',    color: 'text-orange-400' },
    { value: 'MEDIUM', label: '🙂 Good',    color: 'text-yellow-400' },
    { value: 'HIGH',   label: '😊 Great',   color: 'text-emerald-400'},
    { value: 'PEAK',   label: '🚀 Peak',    color: 'text-blue-400'   },
  ];

  const minRequired = 1; // at least 1 minute to save

  return (
    <Card className="flex flex-col items-center p-6 relative overflow-hidden gap-5" animate>
      {isActive && !isPaused && (
        <div className="absolute inset-0 bg-accent-500/5 animate-pulse pointer-events-none rounded-2xl" />
      )}

      {/* Clock display */}
      <Clock className="w-7 h-7 text-accent-400" />
      <div className="text-5xl font-bold font-mono tracking-wider gradient-text">
        {formatTime(seconds)}
      </div>

      {/* Topic picker — only editable before session starts */}
      <div className="w-full space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <BookOpen className="w-3.5 h-3.5" /> Topic
        </label>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          disabled={isActive}
          className="w-full bg-dark-900 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">General Study (no topic)</option>
          {subjects.map(s => (
            <optgroup key={s.id} label={s.name}>
              {(s.topics || []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Quality selector */}
      <div className="w-full space-y-2">
        <label className="text-xs font-medium text-gray-400">Session Quality</label>
        <div className="grid grid-cols-5 gap-1">
          {qualityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setQuality(opt.value)}
              className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                quality === opt.value
                  ? 'bg-accent-500/20 border-accent-500/50 text-white'
                  : 'bg-dark-900 border-surface-border text-gray-500 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {!isActive ? (
          <Button size="md" className="flex-1" icon={<Play className="w-4 h-4" />} onClick={handleStart}>
            Start Session
          </Button>
        ) : (
          <>
            <Button
              size="md"
              variant="secondary"
              className="flex-1"
              icon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              onClick={handlePause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              size="md"
              variant="danger"
              className="flex-1"
              icon={<Square className="w-4 h-4" />}
              onClick={handleStop}
              loading={saveSessionMutation.isPending}
            >
              Stop & Save
            </Button>
          </>
        )}
      </div>

      {/* Minimum duration hint */}
      {isActive && seconds < minRequired * 60 && (
        <p className="text-[10px] text-gray-600 text-center">
          Session will be saved after {minRequired} minute{minRequired > 1 ? 's' : ''}.
        </p>
      )}
    </Card>
  );
}
