const AuditLog = require('../models/AuditLog');

/**
 * Centralized Non-Blocking Audit Logging Service
 */
const logAction = async ({
  userId,
  role,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  metadata = {},
}) => {
  try {
    if (!userId || !action || !entityType) {
      console.warn('[AuditService] Missing required audit fields:', { userId, action, entityType });
      return null;
    }

    const logEntry = await AuditLog.create({
      userId,
      role: role || 'UNKNOWN',
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      metadata,
    });

    return logEntry;
  } catch (error) {
    // Non-blocking: Logging errors should never interrupt primary operations
    console.error('[AuditService] Failed to record audit log:', error.message);
    return null;
  }
};

module.exports = {
  logAction,
};
