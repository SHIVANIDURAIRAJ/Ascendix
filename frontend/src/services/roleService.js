import api from './api';

export const roleService = {
  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  async selectRole(roleId) {
    const response = await api.post('/roles/select', { role_id: roleId });
    return response.data;
  },
};
