const express = require('express');
const {
  createCrime,
  getCrimes,
  getCrimeById,
  updateCrime,
  deleteCrime,
} = require('../controllers/crimeController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createCrime)
  .get(getCrimes);

router.route('/:id')
  .get(getCrimeById)
  .put(updateCrime)
  .delete(deleteCrime);

module.exports = router;
