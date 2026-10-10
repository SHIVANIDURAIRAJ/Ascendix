import api from './api';

export const gapService = {
  async getSkillGap() {
    const response = await api.get('/skill-gap');
    return response.data;
  },
};
