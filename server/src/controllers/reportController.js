const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Helper to dispatch export formats
 */
const sendExportResult = (res, result, format, entityName) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const normalizedFormat = (format || 'csv').toLowerCase();

  if (normalizedFormat === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_${entityName}_Report_${timestamp}.pdf"`);
    return res.status(200).send(result);
  }

  if (normalizedFormat === 'excel' || normalizedFormat === 'xlsx') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_${entityName}_Report_${timestamp}.xlsx"`);
    return res.status(200).send(result);
  }

  if (normalizedFormat === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="CrimeTrack_${entityName}_Report_${timestamp}.csv"`);
    return res.status(200).send(result);
  }

  return successResponse(res, { report: result }, `${entityName} Report generated.`, 200);
};

/**
 * Controller: Export FIR Report
 * @route GET /api/reports/firs/export
 */
const exportFIRReport = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const result = await reportService.generateFIRReport(req.query, req.user, format);
    return sendExportResult(res, result, format, 'FIR');
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
    const format = req.query.format || 'csv';
    const result = await reportService.generateCaseReport(req.query, req.user, format);
    return sendExportResult(res, result, format, 'Case');
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
    const format = req.query.format || 'csv';
    const result = await reportService.generateCrimeReport(req.query, req.user, format);
    return sendExportResult(res, result, format, 'Crime');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Export Criminal Report
 * @route GET /api/reports/criminals/export
 */
const exportCriminalReport = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const result = await reportService.generateCriminalReport(req.query, req.user, format);
    return sendExportResult(res, result, format, 'Criminal');
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
  exportCriminalReport,
  getReportSummary,
};
