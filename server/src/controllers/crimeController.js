const crimeService = require('../services/crimeService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Record Crime
 * @route POST /api/crimes
 */
const createCrime = async (req, res) => {
  try {
    const crime = await crimeService.createCrime(req.body, req.user);
    return successResponse(res, { crime }, 'Crime record created successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: List Crimes
 * @route GET /api/crimes
 */
const getCrimes = async (req, res) => {
  try {
    const result = await crimeService.getCrimes(req.query, req.user);
    return successResponse(res, result, 'Crimes retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Crime by ID
 * @route GET /api/crimes/:id
 */
const getCrimeById = async (req, res) => {
  try {
    const crime = await crimeService.getCrimeById(req.params.id, req.user);
    return successResponse(res, { crime }, 'Crime details retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update Crime
 * @route PUT /api/crimes/:id
 */
const updateCrime = async (req, res) => {
  try {
    const crime = await crimeService.updateCrime(req.params.id, req.body, req.user);
    return successResponse(res, { crime }, 'Crime record updated successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Delete Crime
 * @route DELETE /api/crimes/:id
 */
const deleteCrime = async (req, res) => {
  try {
    const result = await crimeService.deleteCrime(req.params.id, req.user);
    return successResponse(res, result, 'Crime record deleted successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createCrime,
  getCrimes,
  getCrimeById,
  updateCrime,
  deleteCrime,
};
