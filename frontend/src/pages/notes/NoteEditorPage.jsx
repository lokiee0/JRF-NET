import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Trash2, CheckCircle, Clock } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { noteApi } from '../../api/notes';
import { subjectApi } from '../../api/subjects';
import { Button, Input, Spinner, Card } from '../../components/ui';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds

export default function NoteEditorPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const isNew        = id === 'new';

  const [title,       setTitle]       = useState('');
  const [content,     setContent]     = useState('');
  const [topicId,     setTopicId]     = useState('');
  const [savedAt,     setSavedAt]     = useState(null);   // timestamp of last save
  const [isDirty,     setIsDirty]     = useState(false);  // unsaved changes flag
  const noteIdRef     = useRef(isNew ? null : id);        // track real id after first create

  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects'],
    queryFn:  () => subjectApi.getAll(),
  });

  const { data: noteRes, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn:  () => noteApi.getById(id),
    enabled:  !isNew,
  });

  // Populate form when note loads
  useEffect(() => {
    if (noteRes?.data) {
      setTitle(noteRes.data.title   || '');
      setContent(noteRes.data.content || '');
      setTopicId(noteRes.data.topicId ? String(noteRes.data.topicId) : '');
      setIsDirty(false);
    }
  }, [noteRes]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const currentId = noteIdRef.current;
      return currentId && currentId !== 'new'
        ? noteApi.update(currentId, data)
        : noteApi.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (!noteIdRef.current || noteIdRef.current === 'new') {
        // First-time save — update ref so auto-save PUTs from now on
        const newId = String(res.data.id);
        noteIdRef.current = newId;
        // Bug fix: this used to set the cache under ['note', id] where `id` was
        // still the stale closure value 'new', so the cache write never matched
        // the key the page reads from after navigating — causing an unnecessary
        // refetch every first save. Now it's set under the real new id.
        queryClient.setQueryData(['note', newId], res);
        // Replace URL so the editor keeps working after first create
        navigate(`/notes/${res.data.id}`, { replace: true });
      }
      setSavedAt(new Date());
      setIsDirty(false);
    },
  });

  const aiMutation = useMutation({
    mutationFn: () => noteApi.generateSummary(noteIdRef.current),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['note', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => noteApi.delete(noteIdRef.current),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/notes');
    },
  });

  // Mark dirty whenever content or title changes
  const handleTitleChange   = (e)   => { setTitle(e.target.value);  setIsDirty(true); };
  const handleContentChange = (val) => { setContent(val || '');     setIsDirty(true); };
  const handleTopicChange   = (e)   => { setTopicId(e.target.value); setIsDirty(true); };

  // Save function (shared between manual and auto-save)
  const doSave = useCallback(() => {
    if (!title.trim() || !content.trim()) return;
    saveMutation.mutate({
      title,
      content,
      topicId: topicId || null,
    });
  }, [title, content, topicId]);

  // Auto-save every 30s when dirty
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(doSave, AUTO_SAVE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [isDirty, doSave]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const warn = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  if (!isNew && isLoading) {
    return <div className="flex justify-center p-20"><Spinner size="lg" /></div>;
  }

  const note     = noteRes?.data;
  const subjects = subjectsRes?.data || [];

  const saveStatus = saveMutation.isPending
    ? 'Saving…'
    : isDirty
    ? 'Unsaved changes'
    : savedAt
    ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notes
        </button>

        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          {saveStatus && (
            <span className={`flex items-center gap-1.5 text-xs ${isDirty ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isDirty ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {saveStatus}
            </span>
          )}

          {!isNew && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          )}

          <Button
            icon={<Save className="w-4 h-4" />}
            onClick={doSave}
            loading={saveMutation.isPending}
            disabled={!isDirty && !isNew}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Editor grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Main editor */}
        <div className="lg:col-span-3 space-y-4">
          <Input
            placeholder="Note title…"
            value={title}
            onChange={handleTitleChange}
            className="text-2xl font-bold py-4 border-none bg-dark-900/50 shadow-none focus:ring-0 px-4"
          />

          <div data-color-mode="dark" className="rounded-xl overflow-hidden border border-surface-border shadow-xl">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              height={500}
              className="!bg-dark-950"
              previewOptions={{ className: 'prose prose-invert max-w-none' }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card header={<h3 className="font-semibold text-gray-200">Metadata</h3>} animate={false}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Linked Topic</label>
                <select
                  value={topicId}
                  onChange={handleTopicChange}
                  className="w-full bg-dark-900 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-500/50"
                >
                  <option value="">General (No Topic)</option>
                  {subjects.map(s => (
                    <optgroup key={s.id} label={s.name}>
                      {(s.topics || []).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {note?.updatedAt && (
                <p className="text-[10px] text-gray-600">
                  Last saved: {new Date(note.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </Card>

          {/* AI Summary — only available after first save */}
          {!isNew && (
            <Card
              header={
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Sparkles className="w-4 h-4" /> AI Summary
                </div>
              }
              animate={false}
            >
              {note?.aiSummary ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm leading-relaxed">{note.aiSummary}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => aiMutation.mutate()}
                    loading={aiMutation.isPending}
                  >
                    Regenerate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-gray-500">
                    No summary yet. Save your note first, then generate a summary.
                  </p>
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => aiMutation.mutate()}
                    loading={aiMutation.isPending}
                    disabled={isNew || isDirty}
                  >
                    Generate Summary
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
