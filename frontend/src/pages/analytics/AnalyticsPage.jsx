import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Flame, Target, BookOpen, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { analyticsApi } from '../../api/analytics';
import { Card, Spinner, Badge } from '../../components/ui';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyticsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: () => analyticsApi.getDashboard(),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const data = response?.data;
  if (!data) return <div className="text-center text-gray-500 py-20">Failed to load analytics.</div>;

  // Study Hours Bar Chart Data
  const studyHoursData = {
    labels: data.last14DaysStudyHours?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Study Hours',
        data: data.last14DaysStudyHours?.map(d => d.hours) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // accent-500
        borderRadius: 4,
      }
    ]
  };

  const studyHoursOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  // Mastery Distribution Doughnut Data
  const masteryLabels = ['Not Started', 'Learning', 'Revision', 'Mastered'];
  const masteryValues = [
    data.masteryDistribution?.NOT_STARTED || 0,
    data.masteryDistribution?.LEARNING || 0,
    data.masteryDistribution?.REVISION || 0,
    data.masteryDistribution?.MASTERED || 0,
  ];
  const masteryColors = ['#4b5563', '#eab308', '#3b82f6', '#10b981'];

  const masteryData = {
    labels: masteryLabels,
    datasets: [
      {
        data: masteryValues,
        backgroundColor: masteryColors,
        borderWidth: 0,
      }
    ]
  };

  const masteryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { position: 'right', labels: { color: '#9ca3af', padding: 20 } }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-500">Your overall progress and JRF readiness at a glance.</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Readiness Score Card */}
        <Card className="relative overflow-hidden group border-accent-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">JRF Readiness</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-4xl font-bold tracking-tight ${data.jrfReadinessScore >= 80 ? 'text-success' : data.jrfReadinessScore >= 50 ? 'text-warning' : 'text-red-400'}`}>
                  {data.jrfReadinessScore}
                </span>
                <span className="text-sm font-medium text-gray-500">/ 100</span>
              </div>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg text-accent-400"><Target className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 w-full bg-dark-800 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${data.jrfReadinessScore >= 80 ? 'bg-success' : data.jrfReadinessScore >= 50 ? 'bg-warning' : 'bg-red-400'}`} style={{ width: `${data.jrfReadinessScore}%` }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Study Hours</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-100">{data.totalStudyHours}</span>
                <span className="text-sm font-medium text-gray-500">hrs</span>
              </div>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg text-blue-400"><Clock className="w-5 h-5" /></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Current Streak</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-orange-400">{data.currentStreakDays}</span>
                <span className="text-sm font-medium text-gray-500">days</span>
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400"><Flame className="w-5 h-5" /></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Study Consistency</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-100">{data.studyConsistencyScore}</span>
                <span className="text-sm font-medium text-gray-500">/ 100</span>
              </div>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg text-purple-400"><TrendingUp className="w-5 h-5" /></div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Study Hours Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card header={<h3 className="font-semibold text-gray-200">Study Hours (Last 14 Days)</h3>} className="h-full">
            <div className="h-[300px] w-full">
              <Bar data={studyHoursData} options={studyHoursOptions} />
            </div>
          </Card>
        </motion.div>

        {/* Paper Progress & Mastery */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <Card header={<h3 className="font-semibold text-gray-200">Syllabus Completion</h3>}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Paper I (General)</span>
                  <span className="font-medium text-gray-200">{data.paper1ProgressPct}%</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.paper1ProgressPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Paper II (Computer Science)</span>
                  <span className="font-medium text-gray-200">{data.paper2ProgressPct}%</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.paper2ProgressPct}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="font-semibold text-gray-200">Topic Mastery</h3>} className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
              <Doughnut data={masteryData} options={masteryOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Weak Topics */}
      <motion.div variants={itemVariants}>
        <Card header={<h3 className="font-semibold text-gray-200 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" /> Weak Areas to Focus On</h3>}>
          {data.weakTopics && data.weakTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.weakTopics.map(topic => (
                <div key={topic.topicId} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-200 line-clamp-1" title={topic.topicName}>{topic.topicName}</h4>
                    <Badge variant="error" className="bg-red-500/20 text-red-400">{Math.round(topic.accuracy)}% Acc</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{topic.subjectName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No weak areas detected yet. Take more mock tests to generate insights.
            </div>
          )}
        </Card>
      </motion.div>

    </motion.div>
  );
}
