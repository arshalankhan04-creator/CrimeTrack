const express = require('express');
const {
  createInvestigation,
  getInvestigations,
  getCaseTimeline,
  getInvestigationById,
  addEvidenceItem,
  updateInvestigation,
  deleteInvestigation,
} = require('../controllers/investigationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Case Chronological Timeline
router.get('/case/:caseId/timeline', getCaseTimeline);

router.route('/')
  .post(createInvestigation)
  .get(getInvestigations);

router.route('/:id')
  .get(getInvestigationById)
  .put(updateInvestigation)
  .delete(deleteInvestigation);

router.post('/:id/evidence', addEvidenceItem);

module.exports = router;
