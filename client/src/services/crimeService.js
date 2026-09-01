import api from './api';

/**
 * Crime Records API Client
 */
export const crimeService = {
  /**
   * Get crimes list with filters
   */
  getCrimes: async (params = {}) => {
    const response = await api.get('/crimes', { params });
    return response;
  },

  /**
   * Get single crime record by ID
   */
  getCrimeById: async (id) => {
    const response = await api.get(`/crimes/${id}`);
    return response;
  },

  /**
   * Record a new crime under an active case
   */
  createCrime: async (crimeData) => {
    const response = await api.post('/crimes', crimeData);
    return response;
  },

  /**
   * Update crime details
   */
  updateCrime: async (id, updateData) => {
    const response = await api.put(`/crimes/${id}`, updateData);
    return response;
  },

  /**
   * Soft delete crime record
   */
  deleteCrime: async (id) => {
    const response = await api.delete(`/crimes/${id}`);
    return response;
  },
};

export default crimeService;
