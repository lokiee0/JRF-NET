import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Layers } from 'lucide-react';
import { subjectApi } from '../../api/subjects';
import SubjectCard from '../../components/subjects/SubjectCard';
import { Spinner, EmptyState } from '../../components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SubjectsPage() {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Failed to load subjects"
        description={error?.message || 'Something went wrong while fetching the syllabus.'}
      />
    );
  }

  const subjects = response?.data || [];
  const paper1Subjects = subjects.filter((s) => s.paperType === 'PAPER_I');
  const paper2Subjects = subjects.filter((s) => s.paperType === 'PAPER_II');

  const renderSubjectGrid = (title, items, icon) => (
    <motion.div variants={itemVariants} className="space-y-4 mb-10">
      <div className="flex items-center gap-2 mb-4 border-b border-surface-border/50 pb-2">
        {icon}
        <h2 className="text-xl font-bold text-gray-200">{title}</h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-dark-800 text-xs text-gray-400 font-medium">
          {items.length} Subjects
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center glass rounded-xl border-dashed">
          No subjects found for this paper.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((subject) => (
            <motion.div key={subject.id} variants={itemVariants}>
              <SubjectCard subject={subject} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">UGC NET Syllabus</h1>
        <p className="text-gray-500">Track your progress across all subjects and topics.</p>
      </motion.div>

      {renderSubjectGrid(
        'Paper I: General Aptitude', 
        paper1Subjects, 
        <Layers className="w-5 h-5 text-accent-400" />
      )}
      
      {renderSubjectGrid(
        'Paper II: Computer Science', 
        paper2Subjects, 
        <BookOpen className="w-5 h-5 text-emerald-400" />
      )}
    </motion.div>
  );
}
