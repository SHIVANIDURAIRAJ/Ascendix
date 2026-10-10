import api from './api';

export const readinessService = {
  /**
   * Fetch the multi-factor Placement Readiness Score and diagnostic explanations
   */
  async getReadiness() {
    const response = await api.get('/readiness');
    return response.data;
  },
};
