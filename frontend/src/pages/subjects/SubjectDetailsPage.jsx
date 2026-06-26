import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { subjectApi } from '../../api/subjects';
import { Spinner, EmptyState, ProgressBar } from '../../components/ui';
import TopicItem from '../../components/subjects/TopicItem';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SubjectDetailsPage() {
  const { id } = useParams();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['subject', id],
    queryFn: () => subjectApi.getById(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Subject not found"
        description="We couldn't find the subject you're looking for."
        action={{ label: 'Back to Subjects', onClick: () => window.history.back() }}
      />
    );
  }

  const subject = response.data;
  const topics = subject.topics || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      {/* Back Link */}
      <motion.div variants={itemVariants}>
        <Link 
          to="/subjects" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Syllabus
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl glass border-t border-accent-500/30 bg-gradient-to-br from-surface to-dark-900 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {subject.paperType === 'PAPER_I' ? 'Paper I' : 'Paper II'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{subject.name}</h1>
            <p className="text-gray-400 max-w-2xl">{subject.description}</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text">{subject.progressPercentage}%</div>
            <div className="text-sm text-gray-500">Overall Progress</div>
          </div>
        </div>

        <div className="mt-8 space-y-2 relative z-10">
          <div className="flex justify-between text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-success" />
              {subject.completedTopics} / {subject.topicCount} Topics Mastered
            </span>
          </div>
          <ProgressBar value={subject.progressPercentage} size="md" color={subject.progressPercentage === 100 ? 'success' : 'accent'} />
        </div>
      </motion.div>

      {/* Topics List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
          Topics 
          <span className="px-2 py-0.5 rounded-full bg-dark-800 text-xs text-gray-400 font-medium border border-surface-border">
            {topics.length}
          </span>
        </h2>
        
        {topics.length === 0 ? (
          <div className="text-center py-12 text-gray-500 glass rounded-2xl border-dashed">
            No topics defined for this subject yet.
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map(topic => (
              <TopicItem key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
