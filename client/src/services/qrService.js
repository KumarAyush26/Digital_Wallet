import api from './api';

export const qrService = {
  getPayload: async (amount) => {
    const res = await api.get('/qr/payload', { params: { amount } });
    return res.data;
  },

  verifyQrCode: async (qrData) => {
    const res = await api.post('/qr/verify', { qrData });
    return res.data;
  },

  payViaQr: async (payload) => {
    const res = await api.post('/qr/pay', payload);
    return res.data;
  }
};
