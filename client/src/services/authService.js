import api from './api';

/**
 * Authentication API Service
 */
export const authService = {
  /**
   * User login with email & password
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async () => {
    const response = await api.post ? await api.get('/auth/me') : null;
    return response;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    }
  },
};

export default authService;
