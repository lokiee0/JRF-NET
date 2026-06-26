import apiClient from './client';

export const chatApi = {
  getHistory: (topicId) => {
    const params = topicId ? { topicId } : {};
    return apiClient.get('/chat', { params });
  },
  
  sendMessage: (content, topicId) => apiClient.post('/chat', { content, topicId }),
  
  clearHistory: () => apiClient.delete('/chat'),
};
