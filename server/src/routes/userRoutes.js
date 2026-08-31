const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  setUserStatus,
  assignSupervisor,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Strict Admin-only middleware pipeline
router.use(authenticate);
router.use(requireRole('ADMIN'));

// User Management Routes
router.route('/')
  .post(createUser)
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser);

router.patch('/:id/status', setUserStatus);
router.patch('/:id/supervisor', assignSupervisor);

module.exports = router;
