const searchService = require('../services/searchService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Global Cross-Entity Search
 * @route GET /api/search/global
 */
const searchGlobal = async (req, res) => {
  try {
    const results = await searchService.searchGlobal(req.query, req.user);
    return successResponse(res, results, 'Global search results retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  searchGlobal,
};
