const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Create User (Admin Only)
 * @route POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body, req.user);
    return successResponse(res, { user }, 'User created successfully.', 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Users List (Admin Only)
 * @route GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);
    return successResponse(res, result, 'Users retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get User Details (Admin Only)
 * @route GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, { user }, 'User details retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Update User Profile (Admin Only)
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    return successResponse(res, { user }, 'User updated successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Toggle User Active Status (Admin Only)
 * @route PATCH /api/users/:id/status
 */
const setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return errorResponse(res, 'Field isActive is required.', 400);
    }
    const user = await userService.setUserStatus(req.params.id, isActive, req.user);
    const message = user.isActive ? 'User activated successfully.' : 'User deactivated successfully.';
    return successResponse(res, { user }, message, 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Assign Viewer Supervisor (Admin Only)
 * @route PATCH /api/users/:id/supervisor
 */
const assignSupervisor = async (req, res) => {
  try {
    const { supervisorOfficerId } = req.body;
    if (!supervisorOfficerId) {
      return errorResponse(res, 'Field supervisorOfficerId is required.', 400);
    }
    const user = await userService.assignSupervisor(req.params.id, supervisorOfficerId, req.user);
    return successResponse(res, { user }, 'Supervisor assigned successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  setUserStatus,
  assignSupervisor,
};
