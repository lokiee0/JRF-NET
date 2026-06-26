import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Plus, Trash2, Trophy, Target, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import { mockTestApi } from '../../api/mockTests';
import { Card, Button, Spinner, EmptyState, Badge } from '../../components/ui';
import MockTestEntryModal from '../../components/mock-tests/MockTestEntryModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MockTestsPage() {
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['mockTests'],
    queryFn: () => mockTestApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mockTestApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mockTests'] }),
  });

  const mockTests = response?.data || [];
  
  // Prepare data for the Overall Trend Chart
  const reversedTests = [...mockTests].reverse();
  const lineChartData = {
    labels: reversedTests.map(t => new Date(t.testDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Total Score (out of 300)',
        data: reversedTests.map(t => t.totalScore),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'JRF Cutoff Target (180)',
        data: reversedTests.map(() => 180),
        borderColor: 'rgba(239, 68, 68, 0.5)', // red-500
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      y: { min: 0, max: 300, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">Mock Test Analyzer</h1>
          </div>
          <p className="text-gray-500">Track your full-length mock scores and identify weak areas.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsEntryOpen(true)}>
            Log Mock Test
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : mockTests.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={Trophy} 
            title="No mock tests logged" 
            description="Take a full-length mock test on platforms like Testbook or Gradeup, then log your score here."
            action={{ label: 'Log Score', onClick: () => setIsEntryOpen(true) }}
          />
        </motion.div>
      ) : (
        <>
          {/* Trend Chart */}
          <motion.div variants={itemVariants}>
            <Card header={<h3 className="font-semibold text-gray-200">Overall Score Trend</h3>}>
              <div className="h-64 w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Tests */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-400" /> Recent Tests
              </h3>
              
              <div className="grid gap-4">
                {mockTests.map(test => (
                  <Card key={test.id} className="relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteMutation.mutate(test.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(test.testDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          {test.platform && <Badge variant="outline">{test.platform}</Badge>}
                        </div>
                        <h4 className="text-lg font-bold text-gray-100 mb-1">{test.title}</h4>
                        
                        <div className="flex gap-2 mt-3">
                          {test.isJrfLevel ? (
                            <Badge variant="success" className="bg-success/20 text-success border-success/30">
                              <Award className="w-3 h-3 mr-1" /> JRF Level
                            </Badge>
                          ) : test.isNetLevel ? (
                            <Badge variant="warning" className="bg-warning/20 text-warning border-warning/30">
                              <CheckCircle className="w-3 h-3 mr-1" /> NET Level
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 md:border-l md:border-surface-border md:pl-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${test.isJrfLevel ? 'text-success' : test.isNetLevel ? 'text-warning' : 'text-gray-300'}`}>
                            {test.totalScore}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Score</div>
                        </div>
                        {test.percentile && (
                          <div className="text-center">
                            <div className="text-xl font-bold text-accent-400">{test.percentile}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">%ile</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Radar Chart (Latest Test Weaknesses) */}
            <motion.div variants={itemVariants}>
              <Card header={<h3 className="font-semibold text-gray-200">Latest Subject Accuracy</h3>} className="h-full">
                {mockTests[0].performances && mockTests[0].performances.length > 2 ? (
                  <div className="h-64 w-full flex items-center justify-center">
                    <Radar 
                      data={{
                        labels: mockTests[0].performances.map(p => p.subjectName.substring(0, 15) + '...'),
                        datasets: [{
                          label: 'Accuracy %',
                          data: mockTests[0].performances.map(p => p.accuracy),
                          backgroundColor: 'rgba(99, 102, 241, 0.2)', // accent-500
                          borderColor: 'rgba(99, 102, 241, 1)',
                          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#9ca3af', font: { size: 10 } },
                            ticks: { display: false, min: 0, max: 100 }
                          }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center text-gray-500">
                    <Target className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm px-4">Log topic-wise performance in your next test to see radar charts of your strengths and weaknesses.</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}

      <MockTestEntryModal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} />
    </motion.div>
  );
}
