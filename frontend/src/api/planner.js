import apiClient from './client';

export const plannerApi = {
  getTodayPlan: () => apiClient.get('/planner/today'),
  generateTodayPlan: () => apiClient.post('/planner/generate'),
  deleteTodayPlan: () => apiClient.delete('/planner/today'),
  toggleTask: (planId, itemId, completed) => apiClient.patch(`/planner/plans/${planId}/items/${itemId}/toggle`, null, { params: { completed } }),
};
