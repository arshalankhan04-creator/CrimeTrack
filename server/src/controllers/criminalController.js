const criminalService = require('../services/criminalService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Minimal Privacy-Preserving Global Criminal Search
 * @route GET /api/criminals/search
 */
const searchCriminalsMinimal = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || '';
    const criminals = await criminalService.searchCriminalsMinimal(query);
    return successResponse(res, { criminals }, 'Minimal criminal records retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: List Criminals in user scope
 * @route GET /api/criminals
 */
const getCriminals = async (req, res) => {
  try {
    const result = await criminalService.getCriminals(req.query, req.user);
    return successResponse(res, result, 'Criminal profiles retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Criminal Details
 * @route GET /api/criminals/:id
 */
const getCriminalById = async (req, res) => {
  try {
    const criminal = await criminalService.getCriminalById(req.params.id, req.user);
    return successResponse(res, { criminal }, 'Criminal profile retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Register Criminal
 * @route POST /api/criminals
 */
const createCriminal = async (req, res) => {
  try {
    const criminal = await criminalService.createCriminal(req.body, req.user);
    return successResponse(res, { criminal }, 'Criminal record created successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Link Criminal to Case
 * @route POST /api/criminals/:id/link-case
 */
const linkCriminalToCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) {
      return errorResponse(res, 'caseId is required to link criminal to a case.', 400);
    }
    const criminal = await criminalService.linkCriminalToCase(req.params.id, caseId, req.user);
    return successResponse(res, { criminal }, 'Criminal linked to case successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Unlink Criminal from Case
 * @route POST /api/criminals/:id/unlink-case
 */
const unlinkCriminalFromCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) {
      return errorResponse(res, 'caseId is required to unlink criminal from a case.', 400);
    }
    const criminal = await criminalService.unlinkCriminalFromCase(req.params.id, caseId, req.user);
    return successResponse(res, { criminal }, 'Criminal unlinked from case successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update Criminal
 * @route PUT /api/criminals/:id
 */
const updateCriminal = async (req, res) => {
  try {
    const criminal = await criminalService.updateCriminal(req.params.id, req.body, req.user);
    return successResponse(res, { criminal }, 'Criminal profile updated successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Delete Criminal
 * @route DELETE /api/criminals/:id
 */
const deleteCriminal = async (req, res) => {
  try {
    const result = await criminalService.deleteCriminal(req.params.id, req.user);
    return successResponse(res, result, 'Criminal profile deleted successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  searchCriminalsMinimal,
  getCriminals,
  getCriminalById,
  createCriminal,
  linkCriminalToCase,
  unlinkCriminalFromCase,
  updateCriminal,
  deleteCriminal,
};
