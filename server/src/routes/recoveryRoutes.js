const express = require('express');
const {
  revertAuditAction,
  getRecoveryHistory,
} = require('../controllers/recoveryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/history', getRecoveryHistory);
router.post('/rollback/:id', revertAuditAction);

module.exports = router;
