import api from './api';

/**
 * Dashboard & Analytics API Client
 */
export const dashboardService = {
  /**
   * Get role-scoped summary KPIs
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response;
  },

  /**
   * Get chart aggregations (crime categories, status distribution, priority, monthly trends)
   */
  getCharts: async () => {
    const response = await api.get('/dashboard/charts');
    return response;
  },

  /**
   * Get recent audit activities and updates in scope
   */
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response;
  },
};

export default dashboardService;
