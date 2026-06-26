import apiClient from './client';

export const topicApi = {
  getBySubject: (subjectId) => apiClient.get(`/topics/subject/${subjectId}`),
  
  getById: (id) => apiClient.get(`/topics/${id}`),
  
  create: (data) => apiClient.post('/topics', data),
  
  update: (id, data) => apiClient.put(`/topics/${id}`, data),
  
  updateMastery: (id, level) => apiClient.patch(`/topics/${id}/mastery`, null, { params: { level } }),
  
  delete: (id) => apiClient.delete(`/topics/${id}`),
};
