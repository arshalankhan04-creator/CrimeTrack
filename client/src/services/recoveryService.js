import api from './api';

/**
 * Undo & Audit Recovery API Client
 */
export const recoveryService = {
  /**
   * Revert a mutation using its audit log ID (Undo)
   */
  undoMutation: async (auditLogId) => {
    const response = await api.post(`/recovery/${auditLogId}/undo`);
    return response;
  },

  /**
   * Re-apply a reverted mutation or forward snapshot using its audit log ID (Redo)
   */
  redoMutation: async (auditLogId) => {
    const response = await api.post(`/recovery/${auditLogId}/redo`);
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
