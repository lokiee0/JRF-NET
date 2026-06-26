import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import ActiveTimer from '../../components/sessions/ActiveTimer';
import SessionHistory from '../../components/sessions/SessionHistory';
import StudyStats from '../../components/sessions/StudyStats';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SessionsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Study Sessions</h1>
        </div>
        <p className="text-gray-500">Track your focused study time and build consistency.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <ActiveTimer />
          {/* Note: Topic selection dropdown can be added to ActiveTimer later */}
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <StudyStats />
          <SessionHistory />
        </motion.div>
      </div>
    </motion.div>
  );
}
