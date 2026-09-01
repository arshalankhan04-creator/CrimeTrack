const express = require('express');
const {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);
router.get('/recent-activity', getRecentActivity);

module.exports = router;
