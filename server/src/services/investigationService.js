const Investigation = require('../models/Investigation');
const Case = require('../models/Case');
const auditService = require('./auditService');

/**
 * Helper to fetch accessible Case IDs for user role
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
 * Create a new Investigation entry under a Case
 */
const createInvestigation = async (data, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot record investigation entries.');
    error.statusCode = 403;
    throw error;
  }

  const { caseId, title, notes, stage, evidence, recordedAt } = data;

  if (!caseId || !title || !notes) {
    const error = new Error('Case reference, title, and detailed notes are required.');
    error.statusCode = 400;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseDoc) {
    const error = new Error('Referenced Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only record investigations for your assigned cases.');
    error.statusCode = 403;
    throw error;
  }

  const formattedEvidence = Array.isArray(evidence)
    ? evidence.map((e) => ({
        name: e.name ? e.name.trim() : 'Evidence Item',
        type: e.type ? e.type.trim().toUpperCase() : 'DOCUMENT',
        collectedAt: e.collectedAt ? new Date(e.collectedAt) : new Date(),
        description: e.description ? e.description.trim() : '',
        fileUrl: e.fileUrl ? e.fileUrl.trim() : '',
      }))
    : [];

  const newEntry = await Investigation.create({
    caseId: caseDoc._id,
    officerId: user.id,
    title: title.trim(),
    notes: notes.trim(),
    stage: stage ? stage.trim().toUpperCase() : 'EVIDENCE_COLLECTION',
    evidence: formattedEvidence,
    recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    isDeleted: false,
  });

  const populated = await Investigation.findById(newEntry._id)
    .populate('caseId', 'caseNumber status priority assignedOfficerId')
    .populate('officerId', 'name email employeeId role');

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_INVESTIGATION',
    entityType: 'Investigation',
    entityId: newEntry._id,
    newValues: {
      caseId: caseDoc._id,
      title: newEntry.title,
      stage: newEntry.stage,
      evidenceCount: newEntry.evidence.length,
    },
    metadata: {
      caseNumber: caseDoc.caseNumber,
      recordedBy: user.email,
    },
  });

  return populated;
};

/**
 * Get Investigation Entries with Scoping & Filtering
 */
const getInvestigations = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Scoping
  const accessibleCaseIds = await getAccessibleCaseIds(user);
  if (accessibleCaseIds !== null) {
    query.caseId = { $in: accessibleCaseIds };
  }

  // Filter: Direct Case ID
  if (queryParams.caseId) {
    if (accessibleCaseIds !== null) {
      const isAllowed = accessibleCaseIds.some((id) => id.toString() === queryParams.caseId);
      if (!isAllowed) {
        const error = new Error('Access denied to specified case investigation records.');
        error.statusCode = 403;
        throw error;
      }
    }
    query.caseId = queryParams.caseId;
  }

  // Filter: Stage
  if (queryParams.stage && queryParams.stage.trim() !== '') {
    query.stage = queryParams.stage.trim().toUpperCase();
  }

  // Filter: Search (title, notes)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { notes: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    Investigation.find(query)
      .populate('caseId', 'caseNumber status priority assignedOfficerId')
      .populate('officerId', 'name email employeeId role')
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit),
    Investigation.countDocuments(query),
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
 * Get Complete Chronological Case Timeline & Evidence Journal
 */
const getCaseTimeline = async (caseId, user) => {
  const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false })
    .populate('firId')
    .populate('assignedOfficerId', 'name email employeeId role');

  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  // Scoping check
  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId._id.toString() !== user.id) {
    const error = new Error('Access denied. You can only view investigation timelines for your assigned cases.');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'VIEWER') {
    const supervisorId = user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null;
    if (caseDoc.assignedOfficerId._id.toString() !== supervisorId) {
      const error = new Error('Access denied. You can only view investigations under your supervisor.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Fetch chronological entries
  const timeline = await Investigation.find({
    caseId: caseDoc._id,
    isDeleted: false,
  })
    .populate('officerId', 'name email employeeId role')
    .sort({ recordedAt: 1 });

  return {
    case: caseDoc,
    timeline,
  };
};

/**
 * Get Single Investigation Entry by ID
 */
const getInvestigationById = async (id, user) => {
  const entry = await Investigation.findOne({ _id: id, isDeleted: false })
    .populate('caseId', 'caseNumber status priority assignedOfficerId')
    .populate('officerId', 'name email employeeId role');

  if (!entry) {
    const error = new Error('Investigation entry not found.');
    error.statusCode = 404;
    throw error;
  }

  // Scoping check
  if (user.role === 'OFFICER' && entry.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied to this investigation record.');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'VIEWER') {
    const supervisorId = user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null;
    if (entry.caseId.assignedOfficerId.toString() !== supervisorId) {
      const error = new Error('Access denied to this investigation record.');
      error.statusCode = 403;
      throw error;
    }
  }

  return entry;
};

/**
 * Add Evidence Item to an existing Investigation Entry
 */
const addEvidenceItem = async (id, evidenceData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const entry = await Investigation.findOne({ _id: id, isDeleted: false }).populate('caseId');
  if (!entry) {
    const error = new Error('Investigation record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && entry.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only add evidence to your assigned cases.');
    error.statusCode = 403;
    throw error;
  }

  const { name, type, collectedAt, description, fileUrl } = evidenceData;
  if (!name) {
    const error = new Error('Evidence item name is required.');
    error.statusCode = 400;
    throw error;
  }

  const newEvidence = {
    name: name.trim(),
    type: type ? type.trim().toUpperCase() : 'DOCUMENT',
    collectedAt: collectedAt ? new Date(collectedAt) : new Date(),
    description: description ? description.trim() : '',
    fileUrl: fileUrl ? fileUrl.trim() : '',
  };

  entry.evidence.push(newEvidence);
  await entry.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'ADD_EVIDENCE',
    entityType: 'Investigation',
    entityId: entry._id,
    newValues: { evidenceName: newEvidence.name, evidenceType: newEvidence.type },
    metadata: {
      caseNumber: entry.caseId.caseNumber,
      addedBy: user.email,
    },
  });

  return entry;
};

/**
 * Update Investigation Entry
 */
const updateInvestigation = async (id, updateData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const entry = await Investigation.findOne({ _id: id, isDeleted: false }).populate('caseId');
  if (!entry) {
    const error = new Error('Investigation record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && entry.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied to update this investigation record.');
    error.statusCode = 403;
    throw error;
  }

  const oldValues = {
    title: entry.title,
    notes: entry.notes,
    stage: entry.stage,
  };

  const { title, notes, stage } = updateData;
  if (title) entry.title = title.trim();
  if (notes) entry.notes = notes.trim();
  if (stage) entry.stage = stage.trim().toUpperCase();

  await entry.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_INVESTIGATION',
    entityType: 'Investigation',
    entityId: entry._id,
    oldValues,
    newValues: {
      title: entry.title,
      notes: entry.notes,
      stage: entry.stage,
    },
    metadata: {
      updatedBy: user.email,
    },
  });

  return entry;
};

/**
 * Soft Delete Investigation Entry
 */
const deleteInvestigation = async (id, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const entry = await Investigation.findOne({ _id: id, isDeleted: false }).populate('caseId');
  if (!entry) {
    const error = new Error('Investigation record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && entry.caseId.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied to delete this record.');
    error.statusCode = 403;
    throw error;
  }

  entry.isDeleted = true;
  await entry.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'DELETE_INVESTIGATION',
    entityType: 'Investigation',
    entityId: entry._id,
    oldValues: { isDeleted: false },
    newValues: { isDeleted: true },
    metadata: {
      title: entry.title,
      deletedBy: user.email,
    },
  });

  return { id: entry._id, deleted: true };
};

module.exports = {
  createInvestigation,
  getInvestigations,
  getCaseTimeline,
  getInvestigationById,
  addEvidenceItem,
  updateInvestigation,
  deleteInvestigation,
};
