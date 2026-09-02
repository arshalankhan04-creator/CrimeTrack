const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Export FIR Report
 * @route GET /api/reports/firs/export
 */
const exportFIRReport = async (req, res) => {
  try {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const result = await reportService.generateFIRReport(req.query, req.user, format);

    if (format === 'csv') {
      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_FIR_Report_${timestamp}.csv"`);
      return res.status(200).send(result);
    }

    return successResponse(res, { report: result }, 'FIR Report generated.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Export Case Report
 * @route GET /api/reports/cases/export
 */
const exportCaseReport = async (req, res) => {
  try {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const result = await reportService.generateCaseReport(req.query, req.user, format);

    if (format === 'csv') {
      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_Case_Report_${timestamp}.csv"`);
      return res.status(200).send(result);
    }

    return successResponse(res, { report: result }, 'Case Report generated.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Export Crime Report
 * @route GET /api/reports/crimes/export
 */
const exportCrimeReport = async (req, res) => {
  try {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const result = await reportService.generateCrimeReport(req.query, req.user, format);

    if (format === 'csv') {
      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_Crime_Report_${timestamp}.csv"`);
      return res.status(200).send(result);
    }

    return successResponse(res, { report: result }, 'Crime Report generated.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Filtered Report Summary
 * @route GET /api/reports/summary
 */
const getReportSummary = async (req, res) => {
  try {
    const summary = await reportService.getReportSummary(req.query, req.user);
    return successResponse(res, { summary }, 'Report summary generated.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  exportFIRReport,
  exportCaseReport,
  exportCrimeReport,
  getReportSummary,
};
