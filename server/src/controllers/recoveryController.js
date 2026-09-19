const recoveryService = require('../services/recoveryService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Revert / Undo Mutation by Audit Log ID
 * @route POST /api/audit-logs/:id/undo
 * @route POST /api/recovery/rollback/:id
 * @route POST /api/recovery/:id/undo
 * @route POST /api/actions/:id/undo
 */
const revertAuditAction = async (req, res) => {
  try {
    const result = await recoveryService.revertAuditAction(req.params.id, req.user);
    return successResponse(
      res,
      result,
      `Successfully reverted action '${result.revertedAction}'. Historical state restored.`,
      200
    );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Re-apply / Redo Mutation by Audit Log ID
 * @route POST /api/audit-logs/:id/redo
 * @route POST /api/recovery/redo/:id
 * @route POST /api/recovery/:id/redo
 * @route POST /api/actions/:id/redo
 */
const redoAuditAction = async (req, res) => {
  try {
    const result = await recoveryService.redoAuditAction(req.params.id, req.user);
    return successResponse(
      res,
      result,
      `Successfully re-applied action '${result.redoneAction}'. Forward state restored.`,
      200
    );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Recovery / Undo History
 * @route GET /api/recovery/history
 */
const getRecoveryHistory = async (req, res) => {
  try {
    const result = await recoveryService.getRecoveryHistory(req.query);
    return successResponse(res, result, 'Recovery history retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  revertAuditAction,
  redoAuditAction,
  getRecoveryHistory,
};
