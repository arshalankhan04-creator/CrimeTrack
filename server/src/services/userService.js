const User = require('../models/User');
const auditService = require('./auditService');

/**
 * Create a new Officer or Viewer (Admin Only)
 */
const createUser = async (userData, adminUser) => {
  const { name, email, password, role, phone, employeeId, supervisorOfficerId } = userData;

  if (!name || !email || !password || !role) {
    const error = new Error('Name, email, password, and role are required.');
    error.statusCode = 400;
    throw error;
  }

  // Validate allowed roles
  if (!['ADMIN', 'OFFICER', 'VIEWER'].includes(role)) {
    const error = new Error('Role must be ADMIN, OFFICER, or VIEWER.');
    error.statusCode = 400;
    throw error;
  }

  // Check email uniqueness
  const existingEmail = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
  if (existingEmail) {
    const error = new Error('A user with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Check employeeId uniqueness if provided
  if (employeeId) {
    const existingEmp = await User.findOne({ employeeId: employeeId.trim(), isDeleted: false });
    if (existingEmp) {
      const error = new Error('A user with this Employee ID already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  // If role is VIEWER, supervisorOfficerId is required and must be an active OFFICER
  let validatedSupervisorId = null;
  if (role === 'VIEWER') {
    if (!supervisorOfficerId) {
      const error = new Error('A supervising Officer is required for Viewer accounts.');
      error.statusCode = 400;
      throw error;
    }

    const supervisor = await User.findOne({ _id: supervisorOfficerId, isDeleted: false });
    if (!supervisor) {
      const error = new Error('Selected supervising Officer does not exist.');
      error.statusCode = 400;
      throw error;
    }

    if (supervisor.role !== 'OFFICER') {
      const error = new Error('Supervising user must have the role OFFICER.');
      error.statusCode = 400;
      throw error;
    }

    if (!supervisor.isActive) {
      const error = new Error('Selected supervising Officer is currently deactivated.');
      error.statusCode = 400;
      throw error;
    }

    validatedSupervisorId = supervisor._id;
  }

  // Hash password
  const passwordHash = await User.hashPassword(password);

  // Create user record
  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    phone: phone ? phone.trim() : '',
    employeeId: employeeId ? employeeId.trim() : null,
    supervisorOfficerId: validatedSupervisorId,
    isActive: true,
    isDeleted: false,
  });

  const createdProfile = newUser.toJSON();

  // Audit Logging
  await auditService.logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action: 'CREATE_USER',
    entityType: 'User',
    entityId: newUser._id,
    newValues: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      employeeId: newUser.employeeId,
      supervisorOfficerId: newUser.supervisorOfficerId,
    },
    metadata: {
      createdByAdmin: adminUser.email,
    },
  });

  return createdProfile;
};

/**
 * Get Paginated List of Users with Filters (Admin Only)
 */
const getUsers = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role filter
  if (queryParams.role && ['ADMIN', 'OFFICER', 'VIEWER'].includes(queryParams.role.toUpperCase())) {
    query.role = queryParams.role.toUpperCase();
  }

  // Active status filter
  if (queryParams.isActive !== undefined && queryParams.isActive !== '') {
    query.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
  }

  // Search filter (name, email, employeeId)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .populate('supervisorOfficerId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get User Details by ID (Admin Only)
 */
const getUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: false }).populate(
    'supervisorOfficerId',
    'name email employeeId role'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const userObj = user.toJSON();

  // If user is an Officer, include supervised Viewers
  if (user.role === 'OFFICER') {
    const supervisedViewers = await User.find(
      { supervisorOfficerId: user._id, isDeleted: false },
      'name email employeeId isActive createdAt'
    );
    userObj.supervisedViewers = supervisedViewers;
  }

  return userObj;
};

/**
 * Update User Profile (Admin Only)
 */
const updateUser = async (id, updateData, adminUser) => {
  const user = await User.findOne({ _id: id, isDeleted: false });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const oldValues = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    employeeId: user.employeeId,
  };

  const { name, email, phone, employeeId } = updateData;

  // Check email uniqueness if modified
  if (email && email.toLowerCase().trim() !== user.email) {
    const existingEmail = await User.findOne({
      _id: { $ne: user._id },
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });
    if (existingEmail) {
      const error = new Error('Another user with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }
    user.email = email.toLowerCase().trim();
  }

  // Check employeeId uniqueness if modified
  if (employeeId !== undefined && employeeId !== user.employeeId) {
    if (employeeId && employeeId.trim() !== '') {
      const existingEmp = await User.findOne({
        _id: { $ne: user._id },
        employeeId: employeeId.trim(),
        isDeleted: false,
      });
      if (existingEmp) {
        const error = new Error('Another user with this Employee ID already exists.');
        error.statusCode = 409;
        throw error;
      }
      user.employeeId = employeeId.trim();
    } else {
      user.employeeId = null;
    }
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  const updatedProfile = user.toJSON();

  // Audit Logging
  await auditService.logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action: 'UPDATE_USER',
    entityType: 'User',
    entityId: user._id,
    oldValues,
    newValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      employeeId: user.employeeId,
    },
    metadata: {
      updatedByAdmin: adminUser.email,
    },
  });

  return updatedProfile;
};

/**
 * Toggle User Active Status (Admin Only)
 */
const setUserStatus = async (id, isActive, adminUser) => {
  const user = await User.findOne({ _id: id, isDeleted: false });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === adminUser.id && !isActive) {
    const error = new Error('Administrators cannot deactivate their own account.');
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = user.isActive;
  user.isActive = Boolean(isActive);
  await user.save();

  const action = user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';

  // Audit Logging
  await auditService.logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action,
    entityType: 'User',
    entityId: user._id,
    oldValues: { isActive: oldStatus },
    newValues: { isActive: user.isActive },
    metadata: {
      actionByAdmin: adminUser.email,
    },
  });

  return user.toJSON();
};

/**
 * Assign / Reassign Supervisor to Viewer (Admin Only)
 */
const assignSupervisor = async (viewerId, supervisorOfficerId, adminUser) => {
  const viewer = await User.findOne({ _id: viewerId, isDeleted: false });

  if (!viewer) {
    const error = new Error('Viewer account not found.');
    error.statusCode = 404;
    throw error;
  }

  if (viewer.role !== 'VIEWER') {
    const error = new Error('Supervisor can only be assigned to accounts with role VIEWER.');
    error.statusCode = 400;
    throw error;
  }

  const supervisor = await User.findOne({ _id: supervisorOfficerId, isDeleted: false });

  if (!supervisor) {
    const error = new Error('Target supervising Officer not found.');
    error.statusCode = 404;
    throw error;
  }

  if (supervisor.role !== 'OFFICER') {
    const error = new Error('Supervisor must have the role OFFICER.');
    error.statusCode = 400;
    throw error;
  }

  if (!supervisor.isActive) {
    const error = new Error('Target supervising Officer is currently deactivated.');
    error.statusCode = 400;
    throw error;
  }

  const oldSupervisorId = viewer.supervisorOfficerId;
  viewer.supervisorOfficerId = supervisor._id;
  await viewer.save();

  // Audit Logging
  await auditService.logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action: 'ASSIGN_VIEWER',
    entityType: 'User',
    entityId: viewer._id,
    oldValues: { supervisorOfficerId: oldSupervisorId },
    newValues: { supervisorOfficerId: supervisor._id },
    metadata: {
      supervisorName: supervisor.name,
      assignedByAdmin: adminUser.email,
    },
  });

  return viewer.toJSON();
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  setUserStatus,
  assignSupervisor,
};
