const { runAllTests } = require('../../tests/e2eTestSuite');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Run Live QA Automated Test Suite
 * @route POST /api/tests/run
 */
const runTestSuite = async (req, res) => {
  try {
    const summary = await runAllTests();
    return successResponse(res, summary, 'QA Automated Test Suite completed.', 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  runTestSuite,
};
