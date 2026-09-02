import api from './api';

/**
 * QA & Diagnostic Test Suite API Client
 */
export const testService = {
  /**
   * Run full QA integration test suite
   */
  runTestSuite: async () => {
    const response = await api.post('/tests/run');
    return response;
  },
};

export default testService;
