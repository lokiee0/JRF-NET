import apiClient from './client';

export const subjectApi = {
  getAll: (paperType) => {
    const params = paperType ? { paperType } : {};
    return apiClient.get('/subjects', { params });
  },
  
  getById: (id) => apiClient.get(`/subjects/${id}`),
  
  create: (data) => apiClient.post('/subjects', data),
  
  update: (id, data) => apiClient.put(`/subjects/${id}`, data),
  
  delete: (id) => apiClient.delete(`/subjects/${id}`),
};
