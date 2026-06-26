import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Download, Link as LinkIcon, Image as ImageIcon, Trash2, Plus, Filter } from 'lucide-react';
import { resourceApi } from '../../api/resources';
import { Card, Button, Spinner, EmptyState, Badge } from '../../components/ui';
import UploadResourceModal from '../../components/resources/UploadResourceModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const getIconForType = (type) => {
  switch (type) {
    case 'PDF': return <FileText className="w-5 h-5 text-blue-400" />;
    case 'PYQ': return <FileText className="w-5 h-5 text-purple-400" />;
    case 'LINK': return <LinkIcon className="w-5 h-5 text-emerald-400" />;
    case 'IMAGE': return <ImageIcon className="w-5 h-5 text-orange-400" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export default function ResourcesPage() {
  const [filterType, setFilterType] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['resources', filterType],
    queryFn: () => resourceApi.getAll(filterType),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => resourceApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  });

  const resources = response?.data || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">Resource Library</h1>
          </div>
          <p className="text-gray-500">PDFs, Previous Year Questions, and External Links.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-dark-900/60 border border-surface-border rounded-xl px-2">
            <Filter className="w-4 h-4 text-gray-500 ml-2" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent py-2 text-sm text-gray-300 outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="PDF">PDFs</option>
              <option value="PYQ">PYQs</option>
              <option value="LINK">Links</option>
            </select>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsUploadOpen(true)}>
            Upload
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : resources.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={FileText} 
            title={filterType ? `No ${filterType} resources found` : 'No resources yet'} 
            description="Upload your first study material to get started."
            action={{ label: 'Upload Resource', onClick: () => setIsUploadOpen(true) }}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map(resource => (
            <Card key={resource.id} hover className="flex flex-col relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteMutation.mutate(resource.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-dark-800/80">
                  {getIconForType(resource.resourceType)}
                </div>
                <div>
                  <Badge variant="secondary" className="text-[10px]">
                    {resource.resourceType} {resource.year ? `(${resource.year})` : ''}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-200 mb-1 line-clamp-2" title={resource.title}>
                {resource.title}
              </h3>
              
              <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                {resource.topicName ? `Topic: ${resource.topicName}` : 'General'}
              </p>

              <div className="mt-auto pt-4 border-t border-surface-border/50">
                {resource.resourceType === 'LINK' ? (
                  <a href={resource.filePathOrUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-dark-800 hover:bg-accent-500/20 text-sm font-medium text-gray-300 hover:text-accent-300 transition-colors">
                    Visit Link
                  </a>
                ) : (
                  <a href={`http://localhost:8080/api/resources/download/${resource.filePathOrUrl}`} download={resource.originalFileName} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-dark-800 hover:bg-accent-500/20 text-sm font-medium text-gray-300 hover:text-accent-300 transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </a>
                )}
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <UploadResourceModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </motion.div>
  );
}
