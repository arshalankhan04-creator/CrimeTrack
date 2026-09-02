const feedbackService = require('../services/feedbackService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Submit New Feedback
 * @route POST /api/feedback
 */
const createFeedback = async (req, res) => {
  try {
    const newFeedback = await feedbackService.createFeedback(req.body, req.user);
    return successResponse(res, { feedback: newFeedback }, 'Feedback submitted successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Paginated Feedback List
 * @route GET /api/feedback
 */
const getFeedbackList = async (req, res) => {
  try {
    const result = await feedbackService.getFeedbackList(req.query, req.user);
    return successResponse(res, result, 'Feedback list retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Triage / Resolve Feedback (Admin Only)
 * @route PATCH /api/feedback/:id/triage
 */
const triageFeedback = async (req, res) => {
  try {
    const updatedFeedback = await feedbackService.triageFeedback(req.params.id, req.body, req.user);
    return successResponse(res, { feedback: updatedFeedback }, 'Feedback triaged successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Feedback Statistics
 * @route GET /api/feedback/stats
 */
const getFeedbackStats = async (req, res) => {
  try {
    const stats = await feedbackService.getFeedbackStats(req.user);
    return successResponse(res, { stats }, 'Feedback statistics retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createFeedback,
  getFeedbackList,
  triageFeedback,
  getFeedbackStats,
};
