const firService = require('../services/firService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Register FIR
 * @route POST /api/firs
 */
const createFIR = async (req, res) => {
  try {
    const fir = await firService.createFIR(req.body, req.user);
    return successResponse(res, { fir }, 'FIR registered successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: List FIRs with Filters & Scoping
 * @route GET /api/firs
 */
const getFIRs = async (req, res) => {
  try {
    const result = await firService.getFIRs(req.query, req.user);
    return successResponse(res, result, 'FIRs retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get FIR Details by ID
 * @route GET /api/firs/:id
 */
const getFIRById = async (req, res) => {
  try {
    const fir = await firService.getFIRById(req.params.id, req.user);
    return successResponse(res, { fir }, 'FIR details retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update FIR Record
 * @route PUT /api/firs/:id
 */
const updateFIR = async (req, res) => {
  try {
    const fir = await firService.updateFIR(req.params.id, req.body, req.user);
    return successResponse(res, { fir }, 'FIR updated successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Soft Delete FIR Record
 * @route DELETE /api/firs/:id
 */
const deleteFIR = async (req, res) => {
  try {
    const result = await firService.deleteFIR(req.params.id, req.user);
    return successResponse(res, result, 'FIR record deleted successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createFIR,
  getFIRs,
  getFIRById,
  updateFIR,
  deleteFIR,
};
