const express = require('express');
const {
  createFeedback,
  getFeedbackList,
  triageFeedback,
  getFeedbackStats,
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getFeedbackStats);

router.route('/')
  .post(createFeedback)
  .get(getFeedbackList);

router.patch('/:id/triage', authorize('ADMIN'), triageFeedback);

module.exports = router;
