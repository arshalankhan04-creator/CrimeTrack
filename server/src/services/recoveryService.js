const AuditLog = require('../models/AuditLog');
const Case = require('../models/Case');
const FIR = require('../models/FIR');
const Criminal = require('../models/Criminal');
const Crime = require('../models/Crime');
const Investigation = require('../models/Investigation');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const modelMap = {
  Case,
  FIR,
  Criminal,
  Crime,
  Investigation,
  User,
  Feedback,
};

/**
 * Revert a mutated entity state back to its historical snapshot (Undo)
 */
const revertAuditAction = async (auditLogId, user) => {
  const auditEntry = await AuditLog.findById(auditLogId).populate('userId', 'name email employeeId');
  if (!auditEntry) {
    const error = new Error('Audit log record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!auditEntry.oldValues || Object.keys(auditEntry.oldValues).length === 0) {
    const error = new Error('This audit event cannot be undone: No previous state snapshot (oldValues) recorded.');
    error.statusCode = 400;
    throw error;
  }

  if (auditEntry.action === 'UNDO_MUTATION') {
    const error = new Error('Cannot undo an existing undo recovery operation directly. Use redo instead.');
    error.statusCode = 400;
    throw error;
  }

  const Model = modelMap[auditEntry.entityType];
  if (!Model) {
    const error = new Error(`Unsupported entity model type: ${auditEntry.entityType}`);
    error.statusCode = 400;
    throw error;
  }

  // Find the target entity
  const targetDoc = await Model.findById(auditEntry.entityId);
  if (!targetDoc) {
    const error = new Error(`Target ${auditEntry.entityType} record with ID ${auditEntry.entityId} was not found in the database.`);
    error.statusCode = 404;
    throw error;
  }

  // Capture current state before rollback for the undo audit record
  const currentSnapshot = {};
  Object.keys(auditEntry.oldValues).forEach((key) => {
    currentSnapshot[key] = targetDoc[key];
  });

  // Apply historical oldValues back onto the document
  Object.keys(auditEntry.oldValues).forEach((key) => {
    targetDoc[key] = auditEntry.oldValues[key];
  });

  // If reverting a delete, ensure isDeleted is set to false
  if (auditEntry.action.includes('DELETE') || auditEntry.oldValues.isDeleted === false) {
    targetDoc.isDeleted = false;
  }

  // Save the restored document
  await targetDoc.save();

  // Log the UNDO action in AuditLog to maintain an unbroken forensic chain
  const undoLog = await AuditLog.create({
    userId: user.id,
    role: user.role,
    action: 'UNDO_MUTATION',
    entityType: auditEntry.entityType,
    entityId: targetDoc._id,
    oldValues: currentSnapshot,
    newValues: auditEntry.oldValues,
    metadata: {
      revertedAuditId: auditEntry._id.toString(),
      revertedAction: auditEntry.action,
      revertedBy: user.email,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    restoredDoc: targetDoc,
    undoLog,
    revertedAction: auditEntry.action,
  };
};

/**
 * Re-apply a reverted or forward state snapshot (Redo)
 */
const redoAuditAction = async (auditLogId, user) => {
  const auditEntry = await AuditLog.findById(auditLogId).populate('userId', 'name email employeeId');
  if (!auditEntry) {
    const error = new Error('Audit log record not found.');
    error.statusCode = 404;
    throw error;
  }

  let forwardState = null;
  let targetEntityId = auditEntry.entityId;
  let targetEntityType = auditEntry.entityType;
  let originalActionName = auditEntry.action;

  if (auditEntry.action === 'UNDO_MUTATION') {
    // If redoing an UNDO_MUTATION, the forward state is the state before the undo was performed
    forwardState = auditEntry.oldValues;
    originalActionName = auditEntry.metadata?.revertedAction || 'MUTATION';
  } else if (auditEntry.newValues && Object.keys(auditEntry.newValues).length > 0) {
    // Redoing a standard mutation
    forwardState = auditEntry.newValues;
  } else {
    const error = new Error('This audit event cannot be redone: No forward state snapshot (newValues) recorded.');
    error.statusCode = 400;
    throw error;
  }

  const Model = modelMap[targetEntityType];
  if (!Model) {
    const error = new Error(`Unsupported entity model type: ${targetEntityType}`);
    error.statusCode = 400;
    throw error;
  }

  // Find target document
  const targetDoc = await Model.findById(targetEntityId);
  if (!targetDoc) {
    const error = new Error(`Target ${targetEntityType} record with ID ${targetEntityId} was not found in database.`);
    error.statusCode = 404;
    throw error;
  }

  // State validation: check if document is already in the forward state
  let alreadyInForwardState = true;
  for (const key of Object.keys(forwardState)) {
    const currentVal = targetDoc[key];
    const forwardVal = forwardState[key];
    if (String(currentVal) !== String(forwardVal)) {
      alreadyInForwardState = false;
      break;
    }
  }

  if (alreadyInForwardState) {
    const error = new Error('Invalid redo operation: Target entity is already in the desired state or has conflicting modifications.');
    error.statusCode = 400;
    throw error;
  }

  // Capture current state before redo
  const currentSnapshot = {};
  Object.keys(forwardState).forEach((key) => {
    currentSnapshot[key] = targetDoc[key];
  });

  // Apply forwardState onto document
  Object.keys(forwardState).forEach((key) => {
    targetDoc[key] = forwardState[key];
  });

  // If forwardState specified isDeleted, apply it
  if (forwardState.isDeleted !== undefined) {
    targetDoc.isDeleted = forwardState.isDeleted;
  }

  // Save document
  await targetDoc.save();

  // Log REDO_MUTATION in AuditLog
  const redoLog = await AuditLog.create({
    userId: user.id,
    role: user.role,
    action: 'REDO_MUTATION',
    entityType: targetEntityType,
    entityId: targetDoc._id,
    oldValues: currentSnapshot,
    newValues: forwardState,
    metadata: {
      redoneAuditId: auditEntry._id.toString(),
      redoneAction: originalActionName,
      redoneBy: user.email,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    restoredDoc: targetDoc,
    redoLog,
    redoneAction: originalActionName,
  };
};

/**
 * Get Recovery / Rollback History
 */
const getRecoveryHistory = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { action: { $in: ['UNDO_MUTATION', 'REDO_MUTATION'] } };

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(query),
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

module.exports = {
  revertAuditAction,
  redoAuditAction,
  getRecoveryHistory,
};
