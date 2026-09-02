import api from './api';

/**
 * Reports & Data Export API Client
 */
export const reportService = {
  /**
   * Get preview JSON dataset for reports
   */
  getReportData: async (type, params = {}) => {
    const endpoint = `/reports/${type}/export`;
    const response = await api.get(endpoint, {
      params: { ...params, format: 'json' },
    });
    return response;
  },

  /**
   * Download CSV Export directly
   */
  downloadCSV: async (type, params = {}) => {
    const endpoint = `/reports/${type}/export`;
    const token = localStorage.getItem('token');
    
    // Construct query string
    const query = new URLSearchParams({ ...params, format: 'csv' }).toString();
    const url = `http://localhost:5000/api${endpoint}?${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate CSV export.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Extract filename from header or fallback
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `CrimeTrack_${type.toUpperCase()}_Report_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Download JSON Export directly
   */
  downloadJSON: async (type, data) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `CrimeTrack_${type.toUpperCase()}_Report_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Get Report Summary KPIs
   */
  getSummary: async (params = {}) => {
    const response = await api.get('/reports/summary', { params });
    return response;
  },
};

export default reportService;
