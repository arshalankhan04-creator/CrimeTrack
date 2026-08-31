import api from './api';

/**
 * Case Management API Service
 */
export const caseService = {
  /**
   * Get cases list with filters & pagination
   */
  getCases: async (params = {}) => {
    const response = await api.get('/cases', { params });
    return response;
  },

  /**
   * Get single case details by ID
   */
  getCaseById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response;
  },

  /**
   * Get chronological audit history for a case
   */
  getCaseHistory: async (id) => {
    const response = await api.get(`/cases/${id}/history`);
    return response;
  },

  /**
   * Open a new Case from an FIR
   */
  createCase: async (caseData) => {
    const response = await api.post('/cases', caseData);
    return response;
  },

  /**
   * Update case summary & priority
   */
  updateCase: async (id, updateData) => {
    const response = await api.put(`/cases/${id}`, updateData);
    return response;
  },

  /**
   * Update case investigation lifecycle status
   */
  updateCaseStatus: async (id, status) => {
    const response = await api.patch(`/cases/${id}/status`, { status });
    return response;
  },

  /**
   * Reassign case to another Officer (Admin only)
   */
  reassignCase: async (id, assignedOfficerId) => {
    const response = await api.patch(`/cases/${id}/assign`, { assignedOfficerId });
    return response;
  },

  /**
   * Soft delete case file
   */
  deleteCase: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response;
  },
};

export default caseService;
