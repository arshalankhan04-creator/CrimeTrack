const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

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
    console.error('[AuditService] Failed to record audit log:', error.message);
    return null;
  }
};

/**
 * Query Paginated Audit Logs (Admin Only)
 */
const getAuditLogs = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter: Action
  if (queryParams.action && queryParams.action.trim() !== '') {
    query.action = queryParams.action.trim().toUpperCase();
  }

  // Filter: Entity Type
  if (queryParams.entityType && queryParams.entityType.trim() !== '') {
    query.entityType = queryParams.entityType.trim();
  }

  // Filter: User ID
  if (queryParams.userId && queryParams.userId.trim() !== '') {
    query.userId = queryParams.userId.trim();
  }

  // Filter: Date Range
  if (queryParams.dateFrom || queryParams.dateTo) {
    query.createdAt = {};
    if (queryParams.dateFrom) query.createdAt.$gte = new Date(queryParams.dateFrom);
    if (queryParams.dateTo) {
      const toDate = new Date(queryParams.dateTo);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  // Search keyword in action, entityType, or metadata
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { action: searchRegex },
      { entityType: searchRegex },
    ];
  }

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

/**
 * Get Detailed Audit Record by ID
 */
const getAuditLogById = async (id) => {
  const logDoc = await AuditLog.findById(id).populate('userId', 'name email employeeId role');
  if (!logDoc) {
    const error = new Error('Audit log record not found.');
    error.statusCode = 404;
    throw error;
  }
  return logDoc;
};

/**
 * Get Audit Statistics & Activity Counters
 */
const getAuditStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalCount, todayCount, actionStats, uniqueUsers] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: todayStart } }),
    AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    AuditLog.distinct('userId'),
  ]);

  return {
    totalCount,
    todayCount,
    topActions: actionStats.map((a) => ({ action: a._id, count: a.count })),
    activeOfficersCount: uniqueUsers.length,
  };
};

/**
 * Export Audit Logs as CSV
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

const generateAuditCSV = async (queryParams) => {
  const query = {};

  if (queryParams.action) query.action = queryParams.action.toUpperCase();
  if (queryParams.entityType) query.entityType = queryParams.entityType;

  if (queryParams.dateFrom || queryParams.dateTo) {
    query.createdAt = {};
    if (queryParams.dateFrom) query.createdAt.$gte = new Date(queryParams.dateFrom);
    if (queryParams.dateTo) {
      const toDate = new Date(queryParams.dateTo);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email employeeId role')
    .sort({ createdAt: -1 })
    .limit(1000);

  const headers = [
    'Audit ID',
    'Timestamp',
    'Acting User Name',
    'Acting User Email',
    'Employee ID',
    'User Role',
    'Action Type',
    'Target Entity Type',
    'Target Entity ID',
    'Old Values (Diff)',
    'New Values (Diff)',
    'Metadata',
  ];

  const rows = logs.map((l) => [
    escapeCSV(l._id.toString()),
    escapeCSV(new Date(l.createdAt).toLocaleString()),
    escapeCSV(l.userId?.name || 'System'),
    escapeCSV(l.userId?.email || 'N/A'),
    escapeCSV(l.userId?.employeeId || 'N/A'),
    escapeCSV(l.role || l.userId?.role || 'UNKNOWN'),
    escapeCSV(l.action),
    escapeCSV(l.entityType),
    escapeCSV(l.entityId ? l.entityId.toString() : 'N/A'),
    escapeCSV(l.oldValues ? JSON.stringify(l.oldValues) : ''),
    escapeCSV(l.newValues ? JSON.stringify(l.newValues) : ''),
    escapeCSV(l.metadata ? JSON.stringify(l.metadata) : ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

module.exports = {
  logAction,
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  generateAuditCSV,
};
