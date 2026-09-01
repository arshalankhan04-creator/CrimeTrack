import api from './api';

/**
 * Criminal Registry & Minimal Search API Client
 */
export const criminalService = {
  /**
   * Minimal identification search (privacy-safe: returns only name, aliases, age, gender, marks, photoUrl)
   */
  searchMinimal: async (query) => {
    const response = await api.get('/criminals/search', { params: { q: query } });
    return response;
  },

  /**
   * List criminal profiles in user scope
   */
  getCriminals: async (params = {}) => {
    const response = await api.get('/criminals', { params });
    return response;
  },

  /**
   * Get single criminal profile with scoped associated cases
   */
  getCriminalById: async (id) => {
    const response = await api.get(`/criminals/${id}`);
    return response;
  },

  /**
   * Register a new criminal master record
   */
  createCriminal: async (criminalData) => {
    const response = await api.post('/criminals', criminalData);
    return response;
  },

  /**
   * Link an existing criminal to an active case
   */
  linkCase: async (criminalId, caseId) => {
    const response = await api.post(`/criminals/${criminalId}/link-case`, { caseId });
    return response;
  },

  /**
   * Unlink a criminal from a case
   */
  unlinkCase: async (criminalId, caseId) => {
    const response = await api.post(`/criminals/${criminalId}/unlink-case`, { caseId });
    return response;
  },

  /**
   * Update criminal identification details
   */
  updateCriminal: async (id, updateData) => {
    const response = await api.put(`/criminals/${id}`, updateData);
    return response;
  },

  /**
   * Soft delete criminal record
   */
  deleteCriminal: async (id) => {
    const response = await api.delete(`/criminals/${id}`);
    return response;
  },
};

export default criminalService;
