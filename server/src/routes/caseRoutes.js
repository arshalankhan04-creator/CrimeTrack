const express = require('express');
const {
  createCase,
  getCases,
  getCaseById,
  getCaseHistory,
  updateCase,
  updateCaseStatus,
  reassignCase,
  deleteCase,
} = require('../controllers/caseController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Authenticated session required for all Case actions
router.use(authenticate);

router.route('/')
  .post(createCase)
  .get(getCases);

router.route('/:id')
  .get(getCaseById)
  .put(updateCase)
  .delete(deleteCase);

router.get('/:id/history', getCaseHistory);
router.patch('/:id/status', updateCaseStatus);
router.patch('/:id/assign', requireRole('ADMIN'), reassignCase);

module.exports = router;
