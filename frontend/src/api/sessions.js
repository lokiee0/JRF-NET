import apiClient from './client';

export const sessionApi = {
  getAll: () => apiClient.get('/sessions'),
  getByTopic: (topicId) => apiClient.get(`/sessions/topic/${topicId}`),
  create: (data) => apiClient.post('/sessions', data),
  delete: (id) => apiClient.delete(`/sessions/${id}`),
};
