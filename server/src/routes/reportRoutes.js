const express = require('express');
const {
  exportFIRReport,
  exportCaseReport,
  exportCrimeReport,
  getReportSummary,
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/firs/export', exportFIRReport);
router.get('/cases/export', exportCaseReport);
router.get('/crimes/export', exportCrimeReport);
router.get('/summary', getReportSummary);

module.exports = router;
