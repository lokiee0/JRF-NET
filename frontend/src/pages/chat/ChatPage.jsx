import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, User } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { chatApi } from '../../api/chat';
import { subjectApi } from '../../api/subjects';
import { Button, Spinner } from '../../components/ui';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [topicId, setTopicId] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll() });
  const subjects = subjectsRes?.data || [];

  const { data: response, isLoading } = useQuery({
    queryKey: ['chatHistory', topicId],
    queryFn: () => chatApi.getHistory(topicId),
  });

  const sendMutation = useMutation({
    mutationFn: ({ content, topicId }) => chatApi.sendMessage(content, topicId),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory', topicId] });
      const previousMessages = queryClient.getQueryData(['chatHistory', topicId]);
      
      const optimisticMessage = {
        id: Date.now(),
        role: 'user',
        content: newMessage.content,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(['chatHistory', topicId], old => {
        if (!old) return { data: [optimisticMessage] };
        return { ...old, data: [...old.data, optimisticMessage] };
      });
      
      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', topicId] });
    },
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['chatHistory', topicId], context.previousMessages);
    }
  });

  const clearMutation = useMutation({
    mutationFn: () => chatApi.clearHistory(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatHistory', topicId] }),
  });

  const messages = response?.data || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendMutation.isPending]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;
    
    sendMutation.mutate({ content: input, topicId: topicId ? parseInt(topicId, 10) : null });
    setInput('');
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col glass rounded-2xl overflow-hidden border border-surface-border">
      {/* Header */}
      <div className="p-4 border-b border-surface-border bg-dark-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">AI Mentor</h1>
            <p className="text-xs text-emerald-400 font-medium">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={topicId} 
            onChange={(e) => setTopicId(e.target.value)}
            className="bg-dark-900 border border-surface-border rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-accent-500/50"
          >
            <option value="">General Chat</option>
            {subjects.map(s => (
              <optgroup key={s.id} label={s.name}>
                {s.topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            ))}
          </select>

          <button
            onClick={() => {
              if (messages.length === 0) return;
              if (window.confirm('Delete all chat history? This cannot be undone.')) {
                clearMutation.mutate();
              }
            }}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-16 h-16 text-gray-500" />
            <p className="text-lg text-gray-400 max-w-sm">I'm your AI Mentor for JRF Computer Science. Ask me anything about your syllabus or preparation strategy!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-dark-700 text-gray-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-accent-600/90 text-white rounded-tr-sm' : 'bg-dark-800/80 border border-surface-border text-gray-200 rounded-tl-sm'}`}>
                  {msg.role === 'model' ? (
                    <div data-color-mode="dark" className="prose prose-invert prose-sm max-w-none bg-transparent">
                      <MDEditor.Markdown source={msg.content} className="!bg-transparent" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            
            {sendMutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-dark-800/80 border border-surface-border text-gray-400 rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-surface-border bg-dark-900/50">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sendMutation.isPending ? "AI is thinking..." : "Ask your mentor..."}
            disabled={sendMutation.isPending}
            className="w-full bg-dark-950 border border-surface-border rounded-xl pl-4 pr-14 py-4 text-sm text-gray-200 outline-none focus:border-accent-500/50 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || sendMutation.isPending}
            className="absolute right-2 p-2 bg-accent-600 hover:bg-accent-500 disabled:bg-dark-800 text-white disabled:text-gray-500 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
