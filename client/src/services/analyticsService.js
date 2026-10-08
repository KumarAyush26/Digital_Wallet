import api from './api';

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },

  getMonthlyTrends: async () => {
    const res = await api.get('/analytics/monthly-trends');
    return res.data;
  },

  getCategoryBreakdown: async () => {
    const res = await api.get('/analytics/category-breakdown');
    return res.data;
  },

  getAiInsights: async () => {
    const res = await api.get('/analytics/ai-insights');
    return res.data;
  }
};
