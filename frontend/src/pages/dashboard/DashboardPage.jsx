import { motion } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Trophy,
  Sparkles,
  Play,
  HelpCircle,
  Layers,
  MessageSquare,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  CalendarClock,
  Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from '../../components/ui';
import { getGreeting, getDaysUntilExam } from '../../lib/utils';
import { USER_NAME, EXAM_LABEL } from '../../lib/constants';
import { analyticsApi } from '../../api/analytics';
import { sessionApi } from '../../api/sessions';
import { flashcardApi } from '../../api/flashcards';

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const quickActions = [
  {
    label:       'Start Study Session',
    description: 'Begin a focused study sprint',
    icon:        Play,
    path:        '/sessions',
    gradient:    'from-accent-500 to-accent-400',
  },
  {
    label:       'Take Quiz',
    description: 'Test your knowledge',
    icon:        HelpCircle,
    path:        '/quizzes',
    gradient:    'from-emerald-500 to-teal-400',
  },
  {
    label:       'Review Flashcards',
    description: 'Spaced repetition practice',
    icon:        Layers,
    path:        '/flashcards',
    gradient:    'from-amber-500 to-orange-400',
  },
  {
    label:       'Chat with AI',
    description: 'Get instant explanations',
    icon:        MessageSquare,
    path:        '/chat',
    gradient:    'from-blue-500 to-cyan-400',
  },
];

export default function DashboardPage() {
  const navigate   = useNavigate();
  const greeting   = getGreeting();
  const daysLeft   = getDaysUntilExam();

  const { data: response, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn:  () => analyticsApi.getDashboard(),
  });

  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => sessionApi.getAll(),
  });

  const { data: dueCountResponse } = useQuery({
    queryKey: ['dueFlashcardsCount'],
    queryFn: () => flashcardApi.getGlobalDueCount(),
  });

  const analyticsData  = response?.data;
  const recentSessions = sessionsResponse?.data?.slice(0, 3) || [];
  const dueCount = dueCountResponse?.data || 0;

  const stats = [
    {
      label:       'Study Hours',
      value:       analyticsData?.totalStudyHours ?? 0,
      icon:        Clock,
      gradient:    'from-blue-500/20 to-cyan-500/10',
      iconColor:   'text-blue-400',
      borderColor: 'border-blue-500/20',
      change:      `${analyticsData?.currentStreakDays ?? 0} day streak`,
    },
    {
      label:       'Paper I Progress',
      value:       `${analyticsData?.paper1ProgressPct ?? 0}%`,
      icon:        BookOpen,
      gradient:    'from-emerald-500/20 to-teal-500/10',
      iconColor:   'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      change:      'Topics mastered',
    },
    {
      label:       'Paper II Progress',
      value:       `${analyticsData?.paper2ProgressPct ?? 0}%`,
      icon:        Trophy,
      gradient:    'from-amber-500/20 to-orange-500/10',
      iconColor:   'text-amber-400',
      borderColor: 'border-amber-500/20',
      change:      'Topics mastered',
    },
    {
      label:       'JRF Readiness',
      value:       `${analyticsData?.jrfReadinessScore ?? 0}%`,
      icon:        Target,
      gradient:    'from-accent-500/20 to-purple-500/10',
      iconColor:   'text-accent-400',
      borderColor: 'border-accent-500/20',
      change:      (analyticsData?.jrfReadinessScore ?? 0) >= 80 ? '🎯 You are ready!' : 'Keep pushing!',
    },
    {
      label:       'Due Flashcards',
      value:       dueCount,
      icon:        Layers,
      gradient:    'from-pink-500/20 to-rose-500/10',
      iconColor:   'text-pink-400',
      borderColor: 'border-pink-500/20',
      change:      dueCount > 0 ? 'Needs review today' : 'All caught up!',
    },
  ];

  // Urgency colour for the countdown pill
  const urgencyClass =
    daysLeft <= 30
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : daysLeft <= 90
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-accent-500/20 text-accent-300 border-accent-500/30';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-accent-400" />
            <span className="text-sm text-accent-300 font-medium">{greeting}, {USER_NAME}!</span>
          </div>
          <h1 className="text-4xl font-bold">
            Welcome to{' '}
            <span className="gradient-text">JRF OS</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Your AI-Powered UGC NET JRF Preparation System
          </p>
        </div>

        {/* Exam Countdown Pill */}
        <motion.div
          variants={itemVariants}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${urgencyClass} shrink-0`}
        >
          <CalendarClock className="w-6 h-6 shrink-0" />
          <div className="text-right">
            <p className="text-2xl font-bold leading-none">{daysLeft}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5">days to</p>
            <p className="text-xs font-semibold">{EXAM_LABEL}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {isAnalyticsLoading ? (
          <div className="col-span-4 flex justify-center py-8"><Spinner /></div>
        ) : (
          stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div
                className={`p-5 rounded-2xl glass border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} transition-all duration-300 group-hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-dark-900/60 ${stat.iconColor}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
                <p className="text-[11px] text-gray-600 mt-2">{stat.change}</p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-gray-200">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="group relative p-5 rounded-2xl glass glass-hover text-left overflow-hidden"
            >
              <div
                className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${action.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
              />
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} mb-3 shadow-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-gray-500">{action.description}</p>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-accent-400 mt-3 transition-all group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Activity + Upcoming Tasks ───────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          variant="default"
          className="lg:col-span-2"
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200">Recent Activity</h3>
              <span className="text-xs text-gray-500">Latest sessions</span>
            </div>
          }
          animate={false}
        >
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          ) : recentSessions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs text-gray-700 mt-1">Start a study session to see your progress</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-dark-800">
              {recentSessions.map((session, idx) => (
                <div
                  key={session.id ?? idx}
                  className="py-4 flex justify-between items-center group hover:bg-dark-900/30 px-3 rounded-xl transition-colors"
                >
                  <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-lg bg-dark-900 text-accent-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200 flex gap-2 items-center">
                        {session.topicName || 'General Study'}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-gray-400">
                          {session.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex gap-1 items-center">
                        <BookOpen className="w-3 h-3" />
                        {session.subjectName || 'Uncategorized'} •{' '}
                        {new Date(session.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          variant="default"
          header={<h3 className="text-sm font-semibold text-gray-200">Daily Planner</h3>}
          animate={false}
        >
          <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-3">
            <Target className="w-8 h-8 opacity-50" />
            <div className="text-center">
              <p className="text-sm">Plan your day with AI</p>
              <p className="text-xs text-gray-700 mt-1">
                Get a personalized study plan based on your weak areas
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/planner')}
              className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/15 border border-accent-500/30 text-accent-300 text-xs font-medium hover:bg-accent-500/25 transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              Open Planner
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
