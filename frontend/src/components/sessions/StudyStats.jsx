import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { sessionApi } from '../../api/sessions';
import { Card } from '../ui';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

export default function StudyStats() {
  const { data: response } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => sessionApi.getAll(),
  });

  const sessions = response?.data || [];

  // Build last-7-days buckets using Date objects so timezone-offset startTimes work correctly
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // Format a Date to YYYY-MM-DD in local timezone
  const toLocalKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const dataMap = {};
  last7.forEach(d => { dataMap[toLocalKey(d)] = 0; });

  sessions.forEach(s => {
    if (!s.startTime) return;
    const key = toLocalKey(new Date(s.startTime));
    if (dataMap[key] !== undefined) {
      dataMap[key] += s.durationMinutes || 0;
    }
  });

  const labels = last7.map(d =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  );

  const values = last7.map(d => dataMap[toLocalKey(d)]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Study Minutes',
        data: values,
        backgroundColor: values.map(v =>
          v === 0
            ? 'rgba(131, 71, 255, 0.2)'
            : 'rgba(131, 71, 255, 0.85)'
        ),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', maxRotation: 0 },
      },
    },
  };

  const totalMinutes = values.reduce((a, b) => a + b, 0);
  const activeDays   = values.filter(v => v > 0).length;

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-200">Study Time (Last 7 Days)</h3>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{Math.round(totalMinutes / 60 * 10) / 10}h total</span>
            <span>{activeDays}/7 days active</span>
          </div>
        </div>
      }
    >
      <div className="h-52">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
