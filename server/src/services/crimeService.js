const Crime = require('../models/Crime');
const Case = require('../models/Case');
const auditService = require('./auditService');

/**
 * Helper to fetch accessible Case IDs for the user's role
 */
const getAccessibleCaseIds = async (user) => {
  if (user.role === 'ADMIN') {
    return null; // All cases accessible
  }

  const query = { isDeleted: false };
  if (user.role === 'OFFICER') {
    query.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (!user.supervisorOfficerId) return [];
    query.assignedOfficerId = user.supervisorOfficerId;
  }

  const cases = await Case.find(query).select('_id');
  return cases.map((c) => c._id);
};

/**
 * Record a Crime linked to an active Case
 */
const createCrime = async (crimeData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot record crimes.');
    error.statusCode = 403;
    throw error;
  }

  const { caseId, crimeType, description, crimeDate, location, severity } = crimeData;

  if (!caseId || !crimeType || !description || !location) {
    const error = new Error('Case reference, crime category, description, and location are required.');
    error.statusCode = 400;
    throw error;
  }

  // Verify Case exists & check ownership
  const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseDoc) {
    const error = new Error('Referenced Case file does not exist.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only record crimes under your assigned cases.');
    error.statusCode = 403;
    throw error;
  }

  const newCrime = await Crime.create({
    caseId: caseDoc._id,
    crimeType: crimeType.trim().toUpperCase(),
    description: description.trim(),
    crimeDate: crimeDate ? new Date(crimeDate) : new Date(),
    location: location.trim(),
    severity: severity ? severity.trim().toUpperCase() : 'MODERATE',
    isDeleted: false,
  });

  const populatedCrime = await Crime.findById(newCrime._id).populate({
    path: 'caseId',
    select: 'caseNumber status priority assignedOfficerId',
    populate: { path: 'assignedOfficerId', select: 'name email employeeId' },
  });

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_CRIME',
    entityType: 'Crime',
    entityId: newCrime._id,
    newValues: {
      caseId: caseDoc._id,
      crimeType: newCrime.crimeType,
      severity: newCrime.severity,
      location: newCrime.location,
    },
    metadata: {
      caseNumber: caseDoc.caseNumber,
      recordedBy: user.email,
    },
  });

  return populatedCrime;
};

/**
 * List Crimes with Role Scoping & Filters
 */
const getCrimes = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role Scoping
  const accessibleCaseIds = await getAccessibleCaseIds(user);
  if (accessibleCaseIds !== null) {
    query.caseId = { $in: accessibleCaseIds };
  }

  // Filter: Direct Case ID
  if (queryParams.caseId) {
    if (accessibleCaseIds !== null) {
      const isAllowed = accessibleCaseIds.some((id) => id.toString() === queryParams.caseId);
      if (!isAllowed) {
        const error = new Error('Access denied to specified case crimes.');
        error.statusCode = 403;
        throw error;
      }
    }
    query.caseId = queryParams.caseId;
  }

  // Filter: Crime Type
  if (queryParams.crimeType && queryParams.crimeType.trim() !== '') {
    query.crimeType = queryParams.crimeType.trim().toUpperCase();
  }

  // Filter: Severity
  if (queryParams.severity && queryParams.severity.trim() !== '') {
    query.severity = queryParams.severity.trim().toUpperCase();
  }

  // Filter: Search (description, location)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { description: searchRegex },
      { location: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    Crime.find(query)
      .populate({
        path: 'caseId',
        select: 'caseNumber status priority assignedOfficerId',
        populate: { path: 'assignedOfficerId', select: 'name email employeeId' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Crime.countDocuments(query),
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
 * Get Crime by ID
 */
const getCrimeById = async (id, user) => {
  const crime = await Crime.findOne({ _id: id, isDeleted: false }).populate({
    path: 'caseId',
    select: 'caseNumber status priority assignedOfficerId',
    populate: { path: 'assignedOfficerId', select: 'name email employeeId' },
  });

  if (!crime) {
    const error = new Error('Crime record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Role scoping verification
  if (user.role === 'OFFICER') {
    if (crime.caseId.assignedOfficerId._id.toString() !== user.id) {
      const error = new Error('Access denied to this crime record.');
      error.statusCode = 403;
      throw error;
    }
  } else if (user.role === 'VIEWER') {
    const supervisorId = user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null;
    if (crime.caseId.assignedOfficerId._id.toString() !== supervisorId) {
      const error = new Error('Access denied to this crime record.');
      error.statusCode = 403;
      throw error;
    }
  }

  return crime;
};

/**
 * Update Crime Details
 */
const updateCrime = async (id, updateData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const crime = await Crime.findOne({ _id: id, isDeleted: false }).populate('caseId');
  if (!crime) {
    const error = new Error('Crime record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && crime.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied to modify this crime record.');
    error.statusCode = 403;
    throw error;
  }

  const oldValues = {
    crimeType: crime.crimeType,
    description: crime.description,
    location: crime.location,
    severity: crime.severity,
  };

  const { crimeType, description, location, severity, crimeDate } = updateData;
  if (crimeType) crime.crimeType = crimeType.trim().toUpperCase();
  if (description) crime.description = description.trim();
  if (location) crime.location = location.trim();
  if (severity) crime.severity = severity.trim().toUpperCase();
  if (crimeDate) crime.crimeDate = new Date(crimeDate);

  await crime.save();

  const updated = await Crime.findById(crime._id).populate({
    path: 'caseId',
    select: 'caseNumber status priority assignedOfficerId',
  });

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_CRIME',
    entityType: 'Crime',
    entityId: crime._id,
    oldValues,
    newValues: {
      crimeType: crime.crimeType,
      description: crime.description,
      location: crime.location,
      severity: crime.severity,
    },
    metadata: {
      updatedBy: user.email,
    },
  });

  return updated;
};

/**
 * Soft Delete Crime
 */
const deleteCrime = async (id, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers cannot delete crime records.');
    error.statusCode = 403;
    throw error;
  }

  const crime = await Crime.findOne({ _id: id, isDeleted: false }).populate('caseId');
  if (!crime) {
    const error = new Error('Crime record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && crime.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied to delete this crime record.');
    error.statusCode = 403;
    throw error;
  }

  crime.isDeleted = true;
  await crime.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'DELETE_CRIME',
    entityType: 'Crime',
    entityId: crime._id,
    oldValues: { isDeleted: false },
    newValues: { isDeleted: true },
    metadata: {
      deletedBy: user.email,
    },
  });

  return { id: crime._id, deleted: true };
};

module.exports = {
  createCrime,
  getCrimes,
  getCrimeById,
  updateCrime,
  deleteCrime,
};
