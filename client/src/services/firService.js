import api from './api';

/**
 * FIR API Service
 */
export const firService = {
  /**
   * Get FIRs list with search, filters, pagination, and role-scoping
   */
  getFIRs: async (params = {}) => {
    const response = await api.get('/firs', { params });
    return response;
  },

  /**
   * Get single FIR details by ID
   */
  getFIRById: async (id) => {
    const response = await api.get(`/firs/${id}`);
    return response;
  },

  /**
   * Register new FIR
   */
  createFIR: async (firData) => {
    const response = await api.post('/firs', firData);
    return response;
  },

  /**
   * Update FIR record
   */
  updateFIR: async (id, updateData) => {
    const response = await api.put(`/firs/${id}`, updateData);
    return response;
  },

  /**
   * Soft delete FIR record
   */
  deleteFIR: async (id) => {
    const response = await api.delete(`/firs/${id}`);
    return response;
  },
};

export default firService;
