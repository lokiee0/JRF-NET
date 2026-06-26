import apiClient from './client';

export const subtopicApi = {
  getByTopic: (topicId) => apiClient.get(`/subtopics/topic/${topicId}`),
  
  create: (data) => apiClient.post('/subtopics', data),
  
  update: (id, data) => apiClient.put(`/subtopics/${id}`, data),
  
  toggleComplete: (id) => apiClient.patch(`/subtopics/${id}/toggle`),
  
  delete: (id) => apiClient.delete(`/subtopics/${id}`),
};
