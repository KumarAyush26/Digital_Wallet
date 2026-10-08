import api from './api';

export const walletService = {
  getWallet: async () => {
    const res = await api.get('/wallet');
    return res.data;
  },

  validateRecipient: async (identifier) => {
    const res = await api.post('/wallet/validate-recipient', { identifier });
    return res.data;
  },

  addMoney: async (amount, paymentMethod) => {
    const res = await api.post('/wallet/add-money', { amount, paymentMethod });
    return res.data;
  },

  withdrawMoney: async (payload) => {
    const res = await api.post('/wallet/withdraw', payload);
    return res.data;
  },

  transferMoney: async (payload) => {
    const res = await api.post('/wallet/transfer', payload);
    return res.data;
  }
};
