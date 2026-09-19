const express = require('express');
const {
  revertAuditAction,
  redoAuditAction,
  getRecoveryHistory,
} = require('../controllers/recoveryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/recent', getRecoveryHistory);
router.post('/:id/undo', revertAuditAction);
router.post('/:id/redo', redoAuditAction);

module.exports = router;
