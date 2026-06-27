import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Upload, X, File, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourceApi } from '../../api/resources';
import { subjectApi } from '../../api/subjects';
import { Button, Input } from '../ui';

export default function UploadResourceModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PDF');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [topicId, setTopicId] = useState('');

  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll() });
  const subjects = subjectsRes?.data || [];

  const uploadMutation = useMutation({
    mutationFn: (formData) => resourceApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      resetAndClose();
    },
  });

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setType('PDF');
    setYear('');
    setFile(null);
    setUrl('');
    setTopicId('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || (!file && !url)) return;

    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('type', type);
    if (topicId) formData.append('topicId', topicId);
    if (year && type === 'PYQ') formData.append('year', year);
    
    if (type === 'LINK') {
      formData.append('url', url);
    } else if (file) {
      formData.append('file', file);
    }

    uploadMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass rounded-2xl overflow-hidden border border-surface-border shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-border/50 bg-dark-900/50">
          <h2 className="text-lg font-bold text-gray-200">Upload Resource</h2>
          <button onClick={resetAndClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Resource Type</label>
              <select 
                value={type} 
                onChange={(e) => { setType(e.target.value); setFile(null); setUrl(''); }}
                className="w-full bg-dark-900/60 border border-surface-border rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50"
              >
                <option value="PDF">PDF Document</option>
                <option value="PYQ">Previous Year Question (PYQ)</option>
                <option value="LINK">External Link</option>
                <option value="IMAGE">Image</option>
              </select>
            </div>
            {type === 'PYQ' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Year</label>
                <Input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
            <Input placeholder="Resource Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Linked Topic (Optional)</label>
            <select 
              value={topicId} 
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full bg-dark-900/60 border border-surface-border rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50"
            >
              <option value="">General</option>
              {subjects.map(s => (
                <optgroup key={s.id} label={s.name}>
                  {s.topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {type === 'LINK' ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">URL Link *</label>
              <Input type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">File *</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-surface-border bg-dark-900/30 hover:bg-dark-800/50 hover:border-accent-500/50 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-accent-400">Click to upload</span> or drag and drop
                    </p>
                    {file && <p className="text-xs text-emerald-400 font-medium">{file.name}</p>}
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept={type === 'PDF' || type === 'PYQ' ? '.pdf' : 'image/*'} />
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={resetAndClose}>Cancel</Button>
            <Button type="submit" loading={uploadMutation.isPending} disabled={!title || (!file && !url)}>
              Upload Resource
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
