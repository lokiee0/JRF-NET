import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, ProgressBar } from '../ui';

export default function SubjectCard({ subject }) {
  return (
    <Card 
      variant="default"
      className="flex flex-col h-full group"
      hover
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-dark-800/80 text-accent-400 group-hover:bg-accent-500/20 transition-colors">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="text-xs font-medium text-gray-500 bg-dark-800/50 px-2.5 py-1 rounded-full">
          {subject.paperType === 'PAPER_I' ? 'Paper I' : 'Paper II'}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-accent-300 transition-colors line-clamp-1">
          {subject.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6">
          {subject.description}
        </p>
      </div>

      <div className="space-y-3 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            <span>{subject.completedTopics} / {subject.topicCount} Mastered</span>
          </div>
          <span>{subject.progressPercentage}%</span>
        </div>
        
        <ProgressBar 
          value={subject.progressPercentage} 
          size="sm" 
          color={subject.progressPercentage === 100 ? 'success' : 'accent'} 
        />
        
        <Link 
          to={`/subjects/${subject.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-dark-800/50 text-sm font-medium text-gray-300 group-hover:bg-accent-500/20 group-hover:text-accent-300 transition-colors"
        >
          View Topics
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
