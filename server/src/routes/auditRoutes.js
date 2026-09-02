const express = require('express');
const {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  exportAuditLogs,
} = require('../controllers/auditController');
const { revertAuditAction } = require('../controllers/recoveryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Admin-Only Security Access
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getAuditStats);
router.get('/export', exportAuditLogs);

router.route('/')
  .get(getAuditLogs);

router.route('/:id')
  .get(getAuditLogById);

router.post('/:id/undo', revertAuditAction);

module.exports = router;
