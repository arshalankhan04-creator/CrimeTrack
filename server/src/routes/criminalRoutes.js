const express = require('express');
const {
  searchCriminalsMinimal,
  getCriminals,
  getCriminalById,
  createCriminal,
  linkCriminalToCase,
  unlinkCriminalFromCase,
  updateCriminal,
  deleteCriminal,
} = require('../controllers/criminalController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Minimal global search endpoint for privacy-safe offender checks
router.get('/search', searchCriminalsMinimal);

router.route('/')
  .post(createCriminal)
  .get(getCriminals);

router.route('/:id')
  .get(getCriminalById)
  .put(updateCriminal)
  .delete(deleteCriminal);

router.post('/:id/link-case', linkCriminalToCase);
router.post('/:id/unlink-case', unlinkCriminalFromCase);

module.exports = router;
