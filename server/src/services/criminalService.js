const Criminal = require('../models/Criminal');
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
 * PRIVACY-PRESERVING: Minimal identification global search
 * Returns ONLY basic identification attributes without case data or cross-officer details.
 */
const searchCriminalsMinimal = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return [];
  }

  const queryText = searchQuery.trim();
  const searchRegex = new RegExp(queryText, 'i');

  const criminals = await Criminal.find({
    isDeleted: false,
    $or: [
      { name: searchRegex },
      { aliases: searchRegex },
      { identifyingMarks: searchRegex },
    ],
  })
    .select('_id name aliases age gender identifyingMarks photoUrl')
    .limit(20);

  return criminals;
};

/**
 * List Criminals in user's operational scope
 */
const getCriminals = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role Scoping: Filter by criminals linked to cases in user's scope
  const accessibleCaseIds = await getAccessibleCaseIds(user);
  if (accessibleCaseIds !== null) {
    query.$or = [
      { associatedCaseIds: { $in: accessibleCaseIds } },
      { associatedCaseIds: { $size: 0 } }, // Also allow viewing newly registered records before case linking
    ];
  }

  // Filter: Direct Case ID
  if (queryParams.caseId) {
    query.associatedCaseIds = queryParams.caseId;
  }

  // Filter: Search (name, alias, identifyingMarks)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { aliases: searchRegex },
      { identifyingMarks: searchRegex },
    ];
  }

  // Filter: Gender
  if (queryParams.gender && queryParams.gender.trim() !== '') {
    query.gender = queryParams.gender.trim().toUpperCase();
  }

  const [items, total] = await Promise.all([
    Criminal.find(query)
      .populate({
        path: 'associatedCaseIds',
        select: 'caseNumber status priority assignedOfficerId',
        match: { isDeleted: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Criminal.countDocuments(query),
  ]);

  // Privacy sanitize associatedCaseIds based on user scope
  const sanitizedItems = items.map((criminal) => {
    const doc = criminal.toObject();
    if (user.role !== 'ADMIN') {
      const allowedCaseIdStrs = accessibleCaseIds ? accessibleCaseIds.map((id) => id.toString()) : [];
      doc.associatedCaseIds = doc.associatedCaseIds.filter((c) =>
        allowedCaseIdStrs.includes(c._id.toString())
      );
    }
    return doc;
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: sanitizedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get Criminal Profile Details by ID (Scoped Case Privacy)
 */
const getCriminalById = async (id, user) => {
  const criminal = await Criminal.findOne({ _id: id, isDeleted: false }).populate({
    path: 'associatedCaseIds',
    select: 'caseNumber status priority assignedOfficerId',
    match: { isDeleted: false },
    populate: { path: 'assignedOfficerId', select: 'name email employeeId' },
  });

  if (!criminal) {
    const error = new Error('Criminal profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const doc = criminal.toObject();

  // Privacy Rule: Filter associatedCaseIds to only those accessible to user
  if (user.role !== 'ADMIN') {
    const accessibleCaseIds = await getAccessibleCaseIds(user);
    const allowedCaseIdStrs = accessibleCaseIds ? accessibleCaseIds.map((cId) => cId.toString()) : [];
    doc.associatedCaseIds = doc.associatedCaseIds.filter((c) =>
      allowedCaseIdStrs.includes(c._id.toString())
    );
  }

  return doc;
};

/**
 * Register a new Criminal Profile
 */
const createCriminal = async (criminalData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot register criminal profiles.');
    error.statusCode = 403;
    throw error;
  }

  const { name, aliases, age, gender, identifyingMarks, photoUrl, address, caseId } = criminalData;

  if (!name || name.trim() === '') {
    const error = new Error('Criminal full name is required.');
    error.statusCode = 400;
    throw error;
  }

  const associatedCaseIds = [];
  if (caseId) {
    const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false });
    if (!caseDoc) {
      const error = new Error('Referenced Case file does not exist.');
      error.statusCode = 404;
      throw error;
    }
    if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
      const error = new Error('Access denied. You can only associate criminals with your assigned cases.');
      error.statusCode = 403;
      throw error;
    }
    associatedCaseIds.push(caseDoc._id);
  }

  const parsedAliases = Array.isArray(aliases)
    ? aliases.map((a) => a.trim()).filter(Boolean)
    : typeof aliases === 'string'
    ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const newCriminal = await Criminal.create({
    name: name.trim(),
    aliases: parsedAliases,
    age: age ? parseInt(age, 10) : undefined,
    gender: gender ? gender.trim().toUpperCase() : 'MALE',
    identifyingMarks: identifyingMarks ? identifyingMarks.trim() : '',
    photoUrl: photoUrl ? photoUrl.trim() : '',
    address: address ? address.trim() : '',
    associatedCaseIds,
    isDeleted: false,
  });

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_CRIMINAL',
    entityType: 'Criminal',
    entityId: newCriminal._id,
    newValues: {
      name: newCriminal.name,
      gender: newCriminal.gender,
      associatedCaseIds: newCriminal.associatedCaseIds,
    },
    metadata: {
      registeredBy: user.email,
    },
  });

  return newCriminal;
};

/**
 * Link an existing Criminal to an active Case
 */
const linkCriminalToCase = async (criminalId, caseId, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const criminal = await Criminal.findOne({ _id: criminalId, isDeleted: false });
  if (!criminal) {
    const error = new Error('Criminal profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only link criminals to cases assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  const alreadyLinked = criminal.associatedCaseIds.some((id) => id.toString() === caseDoc._id.toString());
  if (!alreadyLinked) {
    criminal.associatedCaseIds.push(caseDoc._id);
    await criminal.save();

    // Audit Log
    await auditService.logAction({
      userId: user.id,
      role: user.role,
      action: 'LINK_CRIMINAL_CASE',
      entityType: 'Criminal',
      entityId: criminal._id,
      newValues: { linkedCaseId: caseDoc._id },
      metadata: {
        caseNumber: caseDoc.caseNumber,
        linkedBy: user.email,
      },
    });
  }

  return getCriminalById(criminal._id, user);
};

/**
 * Unlink a Criminal from a Case
 */
const unlinkCriminalFromCase = async (criminalId, caseId, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const criminal = await Criminal.findOne({ _id: criminalId, isDeleted: false });
  if (!criminal) {
    const error = new Error('Criminal profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const caseDoc = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseDoc) {
    const error = new Error('Case file not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'OFFICER' && caseDoc.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only unlink criminals from your own assigned cases.');
    error.statusCode = 403;
    throw error;
  }

  criminal.associatedCaseIds = criminal.associatedCaseIds.filter(
    (id) => id.toString() !== caseDoc._id.toString()
  );
  await criminal.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UNLINK_CRIMINAL_CASE',
    entityType: 'Criminal',
    entityId: criminal._id,
    oldValues: { unlinkedCaseId: caseDoc._id },
    metadata: {
      caseNumber: caseDoc.caseNumber,
      unlinkedBy: user.email,
    },
  });

  return getCriminalById(criminal._id, user);
};

/**
 * Update Criminal Identification Details
 */
const updateCriminal = async (id, updateData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions.');
    error.statusCode = 403;
    throw error;
  }

  const criminal = await Criminal.findOne({ _id: id, isDeleted: false });
  if (!criminal) {
    const error = new Error('Criminal profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const oldValues = {
    name: criminal.name,
    aliases: criminal.aliases,
    age: criminal.age,
    gender: criminal.gender,
    identifyingMarks: criminal.identifyingMarks,
    address: criminal.address,
  };

  const { name, aliases, age, gender, identifyingMarks, photoUrl, address } = updateData;

  if (name) criminal.name = name.trim();
  if (aliases) {
    criminal.aliases = Array.isArray(aliases)
      ? aliases.map((a) => a.trim()).filter(Boolean)
      : typeof aliases === 'string'
      ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
      : criminal.aliases;
  }
  if (age !== undefined) criminal.age = parseInt(age, 10);
  if (gender) criminal.gender = gender.trim().toUpperCase();
  if (identifyingMarks !== undefined) criminal.identifyingMarks = identifyingMarks.trim();
  if (photoUrl !== undefined) criminal.photoUrl = photoUrl.trim();
  if (address !== undefined) criminal.address = address.trim();

  await criminal.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_CRIMINAL',
    entityType: 'Criminal',
    entityId: criminal._id,
    oldValues,
    newValues: {
      name: criminal.name,
      aliases: criminal.aliases,
      age: criminal.age,
      gender: criminal.gender,
      identifyingMarks: criminal.identifyingMarks,
    },
    metadata: {
      updatedBy: user.email,
    },
  });

  return getCriminalById(criminal._id, user);
};

/**
 * Soft Delete Criminal
 */
const deleteCriminal = async (id, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers cannot delete criminal records.');
    error.statusCode = 403;
    throw error;
  }

  const criminal = await Criminal.findOne({ _id: id, isDeleted: false });
  if (!criminal) {
    const error = new Error('Criminal profile not found.');
    error.statusCode = 404;
    throw error;
  }

  criminal.isDeleted = true;
  await criminal.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'DELETE_CRIMINAL',
    entityType: 'Criminal',
    entityId: criminal._id,
    oldValues: { isDeleted: false },
    newValues: { isDeleted: true },
    metadata: {
      name: criminal.name,
      deletedBy: user.email,
    },
  });

  return { id: criminal._id, name: criminal.name, deleted: true };
};

module.exports = {
  searchCriminalsMinimal,
  getCriminals,
  getCriminalById,
  createCriminal,
  linkCriminalToCase,
  unlinkCriminalFromCase,
  updateCriminal,
  deleteCriminal,
};
