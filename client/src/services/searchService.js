import api from './api';

/**
 * Global Search & Multi-Filter Query API Client
 */
export const searchService = {
  /**
   * Execute global cross-entity search
   * @param {Object} params - { q, entity, status, crimeType, priority, stage, dateFrom, dateTo, limit }
   */
  searchGlobal: async (params = {}) => {
    const response = await api.get('/search/global', { params });
    return response;
  },
};

export default searchService;
