import apiClient from './client';

export const quizApi = {
  getAll: () => apiClient.get('/quizzes'),
  getByTopic: (topicId) => apiClient.get(`/quizzes/topic/${topicId}`),
  getById: (id) => apiClient.get(`/quizzes/${id}`),
  create: (data) => apiClient.post('/quizzes', data),
  submit: (data) => apiClient.post('/quizzes/submit', data),
  delete: (id) => apiClient.delete(`/quizzes/${id}`),
};
