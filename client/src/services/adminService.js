import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleFreezeUser: async (id) => {
    const res = await api.patch(`/admin/users/${id}/freeze`);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  getAllTransactions: async (params = {}) => {
    const res = await api.get('/admin/transactions', { params });
    return res.data;
  },

  reviewTransaction: async (id, action) => {
    const res = await api.patch(`/admin/transactions/${id}/review`, { action });
    return res.data;
  }
};
