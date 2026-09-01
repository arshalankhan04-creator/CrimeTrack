import api from './api';

/**
 * Case Investigation & Evidence API Client
 */
export const investigationService = {
  /**
   * Get list of investigation entries with filters
   */
  getInvestigations: async (params = {}) => {
    const response = await api.get('/investigations', { params });
    return response;
  },

  /**
   * Get chronological investigation timeline & evidence journal for a case
   */
  getCaseTimeline: async (caseId) => {
    const response = await api.get(`/investigations/case/${caseId}/timeline`);
    return response;
  },

  /**
   * Get single investigation entry
   */
  getInvestigationById: async (id) => {
    const response = await api.get(`/investigations/${id}`);
    return response;
  },

  /**
   * Record new investigation journal entry
   */
  createInvestigation: async (entryData) => {
    const response = await api.post('/investigations', entryData);
    return response;
  },

  /**
   * Attach evidence item to existing investigation entry
   */
  addEvidence: async (id, evidenceData) => {
    const response = await api.post(`/investigations/${id}/evidence`, evidenceData);
    return response;
  },

  /**
   * Update investigation entry
   */
  updateInvestigation: async (id, updateData) => {
    const response = await api.put(`/investigations/${id}`, updateData);
    return response;
  },

  /**
   * Soft delete investigation entry
   */
  deleteInvestigation: async (id) => {
    const response = await api.delete(`/investigations/${id}`);
    return response;
  },
};

export default investigationService;
