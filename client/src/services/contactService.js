import api from './api';

export const contactService = {
  getContacts: async () => {
    const res = await api.get('/contacts');
    return res.data;
  },

  addContact: async (payload) => {
    const res = await api.post('/contacts', payload);
    return res.data;
  },

  toggleFavorite: async (id) => {
    const res = await api.patch(`/contacts/${id}/favorite`);
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
  }
};
