import api from './api';

export const roadmapService = {
  async getRoadmap() {
    const response = await api.get('/roadmap');
    return response.data;
  },

  async toggleTask(taskId) {
    const response = await api.patch(`/roadmap/tasks/${taskId}/`);
    return response.data;
  },
};
