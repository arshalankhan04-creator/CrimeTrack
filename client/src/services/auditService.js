import api from './api';

/**
 * Audit Logs & Security Trails API Client
 */
export const auditService = {
  /**
   * Get paginated audit logs with filters
   */
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response;
  },

  /**
   * Get single audit record with full metadata and diff
   */
  getAuditLogById: async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response;
  },

  /**
   * Get audit statistics
   */
  getStats: async () => {
    const response = await api.get('/audit-logs/stats');
    return response;
  },

  /**
   * Download Audit CSV Trail
   */
  downloadCSV: async (params = {}) => {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams({ ...params, format: 'csv' }).toString();
    const url = `http://localhost:5000/api/audit-logs/export?${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export audit log trail.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `CrimeTrack_Audit_Trail_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default auditService;
