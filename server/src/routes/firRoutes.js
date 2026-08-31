const express = require('express');
const {
  createFIR,
  getFIRs,
  getFIRById,
  updateFIR,
  deleteFIR,
} = require('../controllers/firController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Authenticated session required for all FIR actions
router.use(authenticate);

router.route('/')
  .post(createFIR)
  .get(getFIRs);

router.route('/:id')
  .get(getFIRById)
  .put(updateFIR)
  .delete(deleteFIR);

module.exports = router;
