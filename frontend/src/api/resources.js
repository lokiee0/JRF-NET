import apiClient from './client';

export const resourceApi = {
  getAll: (type) => {
    const params = type ? { type } : {};
    return apiClient.get('/resources', { params });
  },
  
  getByTopic: (topicId) => apiClient.get(`/resources/topic/${topicId}`),
  
  upload: (formData) => {
    return apiClient.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (id) => apiClient.delete(`/resources/${id}`),
};
