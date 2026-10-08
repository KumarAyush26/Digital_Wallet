import api from './api';

export const scheduledTransferService = {
  getScheduledTransfers: async () => {
    const res = await api.get('/scheduled-transfers');
    return res.data;
  },

  createScheduledTransfer: async (payload) => {
    const res = await api.post('/scheduled-transfers', payload);
    return res.data;
  },

  cancelScheduledTransfer: async (id) => {
    const res = await api.delete(`/scheduled-transfers/${id}`);
    return res.data;
  }
};
