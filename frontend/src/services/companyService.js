import api from './api';

export const companyService = {
  async getCompanies() {
    const response = await api.get('/companies');
    return response.data;
  },

  async getAdminCompanies() {
    const response = await api.get('/companies?scope=admin');
    return response.data;
  },

  async createCompany(payload) {
    const response = await api.post('/companies', payload);
    return response.data;
  },

  async updateCompany(companyId, payload) {
    const response = await api.put(`/companies/${companyId}`, payload);
    return response.data;
  },

  async deleteCompany(companyId) {
    const response = await api.delete(`/companies/${companyId}`);
    return response.data;
  },

  async togglePublishCompany(companyId, status) {
    const response = await api.patch(
      `/companies/${companyId}/publish`,
      status ? { status } : {}
    );
    return response.data;
  },

  async getEligibility() {
    const response = await api.get('/companies/eligibility');
    return response.data;
  },

  async getCompanyDetail(companyId) {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },

  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markNotificationRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
