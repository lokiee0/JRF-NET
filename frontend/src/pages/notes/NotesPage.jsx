import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { noteApi } from '../../api/notes';
import { Card, Button, Input, Spinner, EmptyState } from '../../components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['notes', searchQuery],
    queryFn: () => noteApi.getAll(searchQuery),
  });

  const notes = response?.data || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">Knowledge Base</h1>
          </div>
          <p className="text-gray-500">Your personal notes and AI-generated summaries.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3">
          <Input 
            placeholder="Search notes..." 
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/notes/new')}>
            New Note
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : notes.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={FileText} 
            title={searchQuery ? 'No matching notes found' : 'No notes yet'} 
            description="Start capturing your knowledge and get AI summaries."
            action={{ label: 'Create Note', onClick: () => navigate('/notes/new') }}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Link key={note.id} to={`/notes/${note.id}`}>
              <Card hover className="h-full flex flex-col cursor-pointer group">
                <div className="text-xs font-medium text-accent-400 mb-2 truncate">
                  {note.subjectName || 'General'} {note.topicName ? `> ${note.topicName}` : ''}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-accent-300 transition-colors">
                  {note.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                  {note.content.replace(/[#*`]/g, '')}
                </p>
                <div className="text-xs text-gray-600 mt-auto pt-4 border-t border-surface-border/50">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
