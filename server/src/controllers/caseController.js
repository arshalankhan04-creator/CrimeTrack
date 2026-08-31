const caseService = require('../services/caseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Open Case
 * @route POST /api/cases
 */
const createCase = async (req, res) => {
  try {
    const caseDoc = await caseService.createCase(req.body, req.user);
    return successResponse(res, { case: caseDoc }, 'Case opened successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: List Cases with Filters & Scoping
 * @route GET /api/cases
 */
const getCases = async (req, res) => {
  try {
    const result = await caseService.getCases(req.query, req.user);
    return successResponse(res, result, 'Cases retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Case Details
 * @route GET /api/cases/:id
 */
const getCaseById = async (req, res) => {
  try {
    const caseDoc = await caseService.getCaseById(req.params.id, req.user);
    return successResponse(res, { case: caseDoc }, 'Case details retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Case History Timeline
 * @route GET /api/cases/:id/history
 */
const getCaseHistory = async (req, res) => {
  try {
    const history = await caseService.getCaseHistory(req.params.id, req.user);
    return successResponse(res, { history }, 'Case audit history retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update Case
 * @route PUT /api/cases/:id
 */
const updateCase = async (req, res) => {
  try {
    const caseDoc = await caseService.updateCase(req.params.id, req.body, req.user);
    return successResponse(res, { case: caseDoc }, 'Case updated successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update Case Status Lifecycle
 * @route PATCH /api/cases/:id/status
 */
const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 'Field status is required.', 400);
    }
    const caseDoc = await caseService.updateCaseStatus(req.params.id, status, req.user);
    return successResponse(res, { case: caseDoc }, `Case status updated to ${caseDoc.status}.`, 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Reassign Case (Admin Only)
 * @route PATCH /api/cases/:id/assign
 */
const reassignCase = async (req, res) => {
  try {
    const { assignedOfficerId } = req.body;
    if (!assignedOfficerId) {
      return errorResponse(res, 'Field assignedOfficerId is required.', 400);
    }
    const caseDoc = await caseService.reassignCase(req.params.id, assignedOfficerId, req.user);
    return successResponse(res, { case: caseDoc }, 'Case reassigned successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Delete Case
 * @route DELETE /api/cases/:id
 */
const deleteCase = async (req, res) => {
  try {
    const result = await caseService.deleteCase(req.params.id, req.user);
    return successResponse(res, result, 'Case file deleted successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  getCaseHistory,
  updateCase,
  updateCaseStatus,
  reassignCase,
  deleteCase,
};
