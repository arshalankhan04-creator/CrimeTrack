import api from './api';

/**
 * Feedback, Issue Reporting & Satisfaction API Client
 */
export const feedbackService = {
  /**
   * Submit new feedback / bug report
   */
  createFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response;
  },

  /**
   * Get paginated feedback list
   */
  getFeedbackList: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response;
  },

  /**
   * Admin triage / resolve feedback
   */
  triageFeedback: async (id, triageData) => {
    const response = await api.patch(`/feedback/${id}/triage`, triageData);
    return response;
  },

  /**
   * Get feedback statistics
   */
  getStats: async () => {
    const response = await api.get('/feedback/stats');
    return response;
  },
};

export default feedbackService;
