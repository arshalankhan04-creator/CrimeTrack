const express = require('express');
const { searchGlobal } = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/global', searchGlobal);

module.exports = router;
