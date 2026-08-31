import api from './api';

/**
 * User Management Service (Admin Only)
 */
export const userService = {
  /**
   * Get users with pagination & filters
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response;
  },

  /**
   * Get user details by ID
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },

  /**
   * Create new Officer / Viewer user
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response;
  },

  /**
   * Update user details
   */
  updateUser: async (id, updateData) => {
    const response = await api.put(`/users/${id}`, updateData);
    return response;
  },

  /**
   * Toggle user active status
   */
  setUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response;
  },

  /**
   * Reassign Viewer to Supervising Officer
   */
  assignSupervisor: async (viewerId, supervisorOfficerId) => {
    const response = await api.patch(`/users/${viewerId}/supervisor`, { supervisorOfficerId });
    return response;
  },
};

export default userService;
