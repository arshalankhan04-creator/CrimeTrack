import api from './api';

/**
 * Undo & Audit Recovery API Client
 */
export const recoveryService = {
  /**
   * Revert a mutation using its audit log ID
   */
  undoMutation: async (auditLogId) => {
    const response = await api.post(`/audit-logs/${auditLogId}/undo`);
    return response;
  },

  /**
   * Get chronological recovery rollback history
   */
  getRecoveryHistory: async (params = {}) => {
    const response = await api.get('/recovery/history', { params });
    return response;
  },
};

export default recoveryService;
