const Case = require('../models/Case');
const FIR = require('../models/FIR');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auditService = require('./auditService');

/**
 * Open a new Case from an existing FIR
 */
const createCase = async (caseData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot open cases.');
    error.statusCode = 403;
    throw error;
  }

  const { firId, summary, priority, caseNumber, assignedOfficerId, openedAt } = caseData;

  if (!firId || !summary) {
    const error = new Error('FIR reference and initial summary are required to open a case.');
    error.statusCode = 400;
    throw error;
  }

  // Validate FIR exists
  const fir = await FIR.findOne({ _id: firId, isDeleted: false });
  if (!fir) {
    const error = new Error('Referenced FIR record does not exist or has been deleted.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership / Assignment verification
  let targetOfficerId = user.id;
  if (user.role === 'OFFICER') {
    if (fir.assignedOfficerId.toString() !== user.id) {
      const error = new Error('Access denied. You can only open cases for FIRs assigned to yourself.');
      error.statusCode = 403;
      throw error;
    }
  } else if (user.role === 'ADMIN') {
    if (assignedOfficerId) {
      const officer = await User.findOne({ _id: assignedOfficerId, isDeleted: false });
      if (!officer || !officer.isActive) {
        const error = new Error('Assigned officer does not exist or is deactivated.');
        error.statusCode = 400;
        throw error;
      }
      targetOfficerId = officer._id;
    } else {
      targetOfficerId = fir.assignedOfficerId;
    }
  }

  // Auto-generate or validate Case Number
  let finalCaseNumber = caseNumber ? caseNumber.trim().toUpperCase() : null;
  if (!finalCaseNumber) {
    finalCaseNumber = await Case.generateNextCaseNumber();
  } else {
    const existing = await Case.findOne({ caseNumber: finalCaseNumber, isDeleted: false });
    if (existing) {
      const error = new Error(`Case Number ${finalCaseNumber} already exists in registry.`);
      error.statusCode = 409;
      throw error;
    }
  }

  const newCase = await Case.create({
    caseNumber: finalCaseNumber,
    firId: fir._id,
    assignedOfficerId: targetOfficerId,
    status: 'OPEN',
    priority: priority ? priority.trim().toUpperCase() : 'MEDIUM',
    summary: summary.trim(),
    openedAt: openedAt ? new Date(openedAt) : new Date(),
    closedAt: null,
    isDeleted: false,
  });

  const populatedCase = await Case.findById(newCase._id)
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_CASE',
    entityType: 'Case',
    entityId: newCase._id,
    newValues: {
      caseNumber: newCase.caseNumber,
      firId: newCase.firId,
      status: newCase.status,
      priority: newCase.priority,
      assignedOfficerId: targetOfficerId,
    },
    metadata: {
      firNumber: fir.firNumber,
      openedBy: user.email,
    },
  });

  return populatedCase;
};

/**
 * Get Paginated List of Cases with Role Scoping & Filters
 */
const getCases = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role-Based Scoping
  if (user.role === 'OFFICER') {
    query.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (!user.supervisorOfficerId) {
      const error = new Error('No supervisor assigned to this Viewer account.');
      error.statusCode = 403;
      throw error;
    }
    query.assignedOfficerId = user.supervisorOfficerId;
  } else if (user.role === 'ADMIN' && queryParams.assignedOfficerId) {
    query.assignedOfficerId = queryParams.assignedOfficerId;
  }

  // Filter: Status
  if (queryParams.status && queryParams.status.trim() !== '') {
    query.status = queryParams.status.trim().toUpperCase();
  }

  // Filter: Priority
  if (queryParams.priority && queryParams.priority.trim() !== '') {
    query.priority = queryParams.priority.trim().toUpperCase();
  }

  // Filter: Date Range (openedAt)
  if (queryParams.startDate || queryParams.endDate) {
    query.openedAt = {};
    if (queryParams.startDate) {
      query.openedAt.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.openedAt.$lte = endDate;
    }
  }

  // Filter: Text Search (caseNumber, summary)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { caseNumber: searchRegex },
      { summary: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    Case.find(query)
      .populate('firId')
      .populate('assignedOfficerId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Case.countDocuments(query),
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
 * Get Case Details by ID
 */
const getCaseById = async (id, user) => {
  const caseDoc = await Case.findOne({ _id: id, isDeleted: false })
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  // Role Access Verification
  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId._id.toString() !== user.id) {
    const error = new Error('Access denied. You can only access cases assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'VIEWER') {
    const supervisorId = user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null;
    if (caseDoc.assignedOfficerId._id.toString() !== supervisorId) {
      const error = new Error("Access denied. You can only view cases assigned to your supervisor.");
      error.statusCode = 403;
      throw error;
    }
  }

  return caseDoc;
};

/**
 * Get Case History Timeline (Audit Log trail)
 */
const getCaseHistory = async (id, user) => {
  // Validate user has permission to view this case
  await getCaseById(id, user);

  const history = await AuditLog.find({
    entityType: 'Case',
    entityId: id,
  })
    .populate('userId', 'name email employeeId role')
    .sort({ createdAt: -1 });

  return history;
};

/**
 * Update Case Summary & Priority
 */
const updateCase = async (id, updateData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: id, isDeleted: false });

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only modify cases assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  const oldValues = {
    summary: caseDoc.summary,
    priority: caseDoc.priority,
  };

  const { summary, priority } = updateData;

  if (summary) caseDoc.summary = summary.trim();
  if (priority) caseDoc.priority = priority.trim().toUpperCase();

  await caseDoc.save();

  const updated = await Case.findById(caseDoc._id)
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_CASE',
    entityType: 'Case',
    entityId: caseDoc._id,
    oldValues,
    newValues: {
      summary: caseDoc.summary,
      priority: caseDoc.priority,
    },
    metadata: {
      updatedBy: user.email,
    },
  });

  return updated;
};

/**
 * Update Case Status Lifecycle Transition
 */
const updateCaseStatus = async (id, status, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: id, isDeleted: false });

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only update status for cases assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  const formattedStatus = status.trim().toUpperCase();
  if (!['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'].includes(formattedStatus)) {
    const error = new Error(`Invalid status '${status}'. Must be OPEN, UNDER_INVESTIGATION, SOLVED, or CLOSED.`);
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = caseDoc.status;
  caseDoc.status = formattedStatus;

  // Auto manage closedAt timestamp
  if (['SOLVED', 'CLOSED'].includes(formattedStatus)) {
    caseDoc.closedAt = new Date();
  } else {
    caseDoc.closedAt = null;
  }

  await caseDoc.save();

  const updated = await Case.findById(caseDoc._id)
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_CASE_STATUS',
    entityType: 'Case',
    entityId: caseDoc._id,
    oldValues: { status: oldStatus },
    newValues: { status: formattedStatus, closedAt: caseDoc.closedAt },
    metadata: {
      fromStatus: oldStatus,
      toStatus: formattedStatus,
      updatedBy: user.email,
    },
  });

  return updated;
};

/**
 * Reassign Case to Another Officer (Admin Only)
 */
const reassignCase = async (id, newOfficerId, adminUser) => {
  const caseDoc = await Case.findOne({ _id: id, isDeleted: false });

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  const officer = await User.findOne({ _id: newOfficerId, isDeleted: false });
  if (!officer || !officer.isActive) {
    const error = new Error('Target officer not found or is currently deactivated.');
    error.statusCode = 400;
    throw error;
  }

  const oldOfficerId = caseDoc.assignedOfficerId;
  caseDoc.assignedOfficerId = officer._id;
  await caseDoc.save();

  const updated = await Case.findById(caseDoc._id)
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  // Audit Log
  await auditService.logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action: 'REASSIGN_CASE',
    entityType: 'Case',
    entityId: caseDoc._id,
    oldValues: { assignedOfficerId: oldOfficerId },
    newValues: { assignedOfficerId: officer._id },
    metadata: {
      newOfficerName: officer.name,
      reassignedByAdmin: adminUser.email,
    },
  });

  return updated;
};

/**
 * Soft Delete Case
 */
const deleteCase = async (id, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers cannot delete case files.');
    error.statusCode = 403;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: id, isDeleted: false });

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only delete cases assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  caseDoc.isDeleted = true;
  await caseDoc.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'DELETE_CASE',
    entityType: 'Case',
    entityId: caseDoc._id,
    oldValues: { isDeleted: false },
    newValues: { isDeleted: true },
    metadata: {
      caseNumber: caseDoc.caseNumber,
      deletedBy: user.email,
    },
  });

  return { id: caseDoc._id, caseNumber: caseDoc.caseNumber, deleted: true };
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  getCaseHistory,
  updateCase,
  updateCaseStatus,
  reassignCase,
  deleteCase,
};
