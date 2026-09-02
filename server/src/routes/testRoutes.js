const express = require('express');
const { runTestSuite } = require('../controllers/testController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-Only Diagnostic Tooling
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/run', runTestSuite);

module.exports = router;
