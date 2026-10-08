import api from './api';

export const budgetService = {
  getBudgets: async (month, year) => {
    const res = await api.get('/budgets', { params: { month, year } });
    return res.data;
  },

  setBudget: async (payload) => {
    const res = await api.post('/budgets', payload);
    return res.data;
  },

  getSavingsGoals: async () => {
    const res = await api.get('/budgets/goals');
    return res.data;
  },

  createSavingsGoal: async (payload) => {
    const res = await api.post('/budgets/goals', payload);
    return res.data;
  },

  contributeGoal: async (id, amount) => {
    const res = await api.post(`/budgets/goals/${id}/contribute`, { amount });
    return res.data;
  },

  withdrawGoal: async (id, amount) => {
    const res = await api.post(`/budgets/goals/${id}/withdraw`, { amount });
    return res.data;
  }
};
