import api from './api';

/**
 * Clean and build URL query string safely without stringified 'undefined' or 'null'
 */
const buildCleanQuery = (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      cleanParams[key] = val;
    }
  });
  return new URLSearchParams(cleanParams).toString();
};

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
   * Download PDF Export directly
   */
  downloadPDF: async (type, params = {}) => {
    const endpoint = `/reports/${type}/export`;
    const token = localStorage.getItem('token');
    const query = buildCleanQuery({ ...params, format: 'pdf' });
    const url = `/api${endpoint}${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || 'Failed to generate PDF export.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `CrimeTrack_${type.toUpperCase()}_Report_${timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Download Excel (.xlsx) Export directly
   */
  downloadExcel: async (type, params = {}) => {
    const endpoint = `/reports/${type}/export`;
    const token = localStorage.getItem('token');
    const query = buildCleanQuery({ ...params, format: 'excel' });
    const url = `/api${endpoint}${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || 'Failed to generate Excel export.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `CrimeTrack_${type.toUpperCase()}_Report_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Download CSV Export directly
   */
  downloadCSV: async (type, params = {}) => {
    const endpoint = `/reports/${type}/export`;
    const token = localStorage.getItem('token');
    const query = buildCleanQuery({ ...params, format: 'csv' });
    const url = `/api${endpoint}${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || 'Failed to generate CSV export.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
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

