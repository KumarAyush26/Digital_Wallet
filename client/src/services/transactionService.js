import api from './api';

export const transactionService = {
  getTransactions: async (params = {}) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },

  getTransactionById: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },

  requestMoney: async (payload) => {
    const res = await api.post('/transactions/request-money', payload);
    return res.data;
  }
};
