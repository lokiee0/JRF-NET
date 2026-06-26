import apiClient from './client';

export const noteApi = {
  getAll: (query) => {
    const params = query ? { query } : {};
    return apiClient.get('/notes', { params });
  },
  
  getByTopic: (topicId) => apiClient.get(`/notes/topic/${topicId}`),
  
  getById: (id) => apiClient.get(`/notes/${id}`),
  
  create: (data) => apiClient.post('/notes', data),
  
  update: (id, data) => apiClient.put(`/notes/${id}`, data),
  
  generateSummary: (id) => apiClient.post(`/notes/${id}/summarize`),
  
  delete: (id) => apiClient.delete(`/notes/${id}`),
};
