import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data.profile;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data.profile;
  },
};
