const investigationService = require('../services/investigationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Record Investigation Entry
 * @route POST /api/investigations
 */
const createInvestigation = async (req, res) => {
  try {
    const entry = await investigationService.createInvestigation(req.body, req.user);
    return successResponse(res, { investigation: entry }, 'Investigation journal entry recorded.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: List Investigations
 * @route GET /api/investigations
 */
const getInvestigations = async (req, res) => {
  try {
    const result = await investigationService.getInvestigations(req.query, req.user);
    return successResponse(res, result, 'Investigations retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Case Chronological Timeline
 * @route GET /api/investigations/case/:caseId/timeline
 */
const getCaseTimeline = async (req, res) => {
  try {
    const result = await investigationService.getCaseTimeline(req.params.caseId, req.user);
    return successResponse(res, result, 'Case investigation timeline retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Single Investigation Entry
 * @route GET /api/investigations/:id
 */
const getInvestigationById = async (req, res) => {
  try {
    const entry = await investigationService.getInvestigationById(req.params.id, req.user);
    return successResponse(res, { investigation: entry }, 'Investigation entry retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Add Evidence Item
 * @route POST /api/investigations/:id/evidence
 */
const addEvidenceItem = async (req, res) => {
  try {
    const entry = await investigationService.addEvidenceItem(req.params.id, req.body, req.user);
    return successResponse(res, { investigation: entry }, 'Evidence attached to investigation record.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update Investigation Entry
 * @route PUT /api/investigations/:id
 */
const updateInvestigation = async (req, res) => {
  try {
    const entry = await investigationService.updateInvestigation(req.params.id, req.body, req.user);
    return successResponse(res, { investigation: entry }, 'Investigation record updated.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Delete Investigation Entry
 * @route DELETE /api/investigations/:id
 */
const deleteInvestigation = async (req, res) => {
  try {
    const result = await investigationService.deleteInvestigation(req.params.id, req.user);
    return successResponse(res, result, 'Investigation record deleted.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createInvestigation,
  getInvestigations,
  getCaseTimeline,
  getInvestigationById,
  addEvidenceItem,
  updateInvestigation,
  deleteInvestigation,
};
