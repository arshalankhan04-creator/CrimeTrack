const auditService = require('../services/auditService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Get Paginated Audit Logs
 * @route GET /api/audit-logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return successResponse(res, result, 'Audit logs retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Single Audit Record
 * @route GET /api/audit-logs/:id
 */
const getAuditLogById = async (req, res) => {
  try {
    const log = await auditService.getAuditLogById(req.params.id);
    return successResponse(res, { auditLog: log }, 'Audit log retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Audit Statistics
 * @route GET /api/audit-logs/stats
 */
const getAuditStats = async (req, res) => {
  try {
    const stats = await auditService.getAuditStats();
    return successResponse(res, { stats }, 'Audit statistics retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Export Audit Logs (CSV / JSON)
 * @route GET /api/audit-logs/export
 */
const exportAuditLogs = async (req, res) => {
  try {
    const format = req.query.format === 'json' ? 'json' : 'csv';

    if (format === 'csv') {
      const csvData = await auditService.generateAuditCSV(req.query);
      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_Audit_Trail_${timestamp}.csv"`);
      return res.status(200).send(csvData);
    }

    const result = await auditService.getAuditLogs({ ...req.query, limit: 1000 });
    return successResponse(res, { logs: result.items }, 'Audit logs exported.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  exportAuditLogs,
};
