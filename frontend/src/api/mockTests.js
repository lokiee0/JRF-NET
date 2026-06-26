import apiClient from './client';

export const mockTestApi = {
  getAll: () => apiClient.get('/mock-tests'),
  getById: (id) => apiClient.get(`/mock-tests/${id}`),
  create: (data) => apiClient.post('/mock-tests', data),
  delete: (id) => apiClient.delete(`/mock-tests/${id}`),
};
