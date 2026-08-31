const FIR = require('../models/FIR');
const User = require('../models/User');
const auditService = require('./auditService');

/**
 * Register a new FIR
 */
const createFIR = async (firData, user) => {
  // Viewers cannot create FIRs
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot register FIRs.');
    error.statusCode = 403;
    throw error;
  }

  const {
    firNumber,
    complainantName,
    complainantPhone,
    complainantAddress,
    incidentDate,
    incidentPlace,
    description,
    crimeType,
    assignedOfficerId,
  } = firData;

  if (!complainantName || !complainantPhone || !incidentDate || !incidentPlace || !description || !crimeType) {
    const error = new Error('Complainant name, phone, incident date, place, description, and crime type are required.');
    error.statusCode = 400;
    throw error;
  }

  // Determine assigned officer
  let targetOfficerId = user.id;
  if (user.role === 'ADMIN' && assignedOfficerId) {
    const officer = await User.findOne({ _id: assignedOfficerId, isDeleted: false });
    if (!officer || (officer.role !== 'OFFICER' && officer.role !== 'ADMIN')) {
      const error = new Error('Assigned officer must be an existing Officer or Admin.');
      error.statusCode = 400;
      throw error;
    }
    targetOfficerId = officer._id;
  }

  // Auto-generate or validate FIR Number
  let finalFIRNumber = firNumber ? firNumber.trim().toUpperCase() : null;
  if (!finalFIRNumber) {
    finalFIRNumber = await FIR.generateNextFIRNumber();
  } else {
    const existing = await FIR.findOne({ firNumber: finalFIRNumber, isDeleted: false });
    if (existing) {
      const error = new Error(`FIR Number ${finalFIRNumber} already exists in registry.`);
      error.statusCode = 409;
      throw error;
    }
  }

  const newFIR = await FIR.create({
    firNumber: finalFIRNumber,
    complainantName: complainantName.trim(),
    complainantPhone: complainantPhone.trim(),
    complainantAddress: complainantAddress ? complainantAddress.trim() : '',
    incidentDate: new Date(incidentDate),
    incidentPlace: incidentPlace.trim(),
    description: description.trim(),
    crimeType: crimeType.trim().toUpperCase(),
    assignedOfficerId: targetOfficerId,
    isDeleted: false,
  });

  const populatedFIR = await FIR.findById(newFIR._id).populate(
    'assignedOfficerId',
    'name email employeeId role'
  );

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_FIR',
    entityType: 'FIR',
    entityId: newFIR._id,
    newValues: {
      firNumber: newFIR.firNumber,
      crimeType: newFIR.crimeType,
      complainantName: newFIR.complainantName,
      assignedOfficerId: targetOfficerId,
    },
    metadata: {
      registeredBy: user.email,
    },
  });

  return populatedFIR;
};

/**
 * Get List of FIRs with Role Scoping, Search, Filters, and Pagination
 */
const getFIRs = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role-Based Data Isolation
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

  // Filter: Crime Type
  if (queryParams.crimeType && queryParams.crimeType.trim() !== '') {
    query.crimeType = queryParams.crimeType.trim().toUpperCase();
  }

  // Filter: Date Range
  if (queryParams.startDate || queryParams.endDate) {
    query.incidentDate = {};
    if (queryParams.startDate) {
      query.incidentDate.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.incidentDate.$lte = endDate;
    }
  }

  // Filter: Search Text (firNumber, complainantName, incidentPlace, description)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [
      { firNumber: searchRegex },
      { complainantName: searchRegex },
      { incidentPlace: searchRegex },
      { description: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    FIR.find(query)
      .populate('assignedOfficerId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FIR.countDocuments(query),
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
 * Get FIR Details by ID with Authorization Check
 */
const getFIRById = async (id, user) => {
  const fir = await FIR.findOne({ _id: id, isDeleted: false }).populate(
    'assignedOfficerId',
    'name email employeeId role'
  );

  if (!fir) {
    const error = new Error('FIR record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Access control validation
  if (user.role === 'OFFICER' && fir.assignedOfficerId._id.toString() !== user.id) {
    const error = new Error('Access denied. You can only access FIRs assigned to your station.');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'VIEWER') {
    const supervisorId = user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null;
    if (fir.assignedOfficerId._id.toString() !== supervisorId) {
      const error = new Error("Access denied. You can only view FIRs assigned to your supervising Officer.");
      error.statusCode = 403;
      throw error;
    }
  }

  return fir;
};

/**
 * Update FIR Record
 */
const updateFIR = async (id, updateData, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers have read-only permissions and cannot modify FIRs.');
    error.statusCode = 403;
    throw error;
  }

  const fir = await FIR.findOne({ _id: id, isDeleted: false });

  if (!fir) {
    const error = new Error('FIR record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification for Officers
  if (user.role === 'OFFICER' && fir.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only modify FIRs assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  const oldValues = {
    complainantName: fir.complainantName,
    complainantPhone: fir.complainantPhone,
    complainantAddress: fir.complainantAddress,
    incidentDate: fir.incidentDate,
    incidentPlace: fir.incidentPlace,
    description: fir.description,
    crimeType: fir.crimeType,
  };

  const {
    complainantName,
    complainantPhone,
    complainantAddress,
    incidentDate,
    incidentPlace,
    description,
    crimeType,
  } = updateData;

  if (complainantName) fir.complainantName = complainantName.trim();
  if (complainantPhone) fir.complainantPhone = complainantPhone.trim();
  if (complainantAddress !== undefined) fir.complainantAddress = complainantAddress.trim();
  if (incidentDate) fir.incidentDate = new Date(incidentDate);
  if (incidentPlace) fir.incidentPlace = incidentPlace.trim();
  if (description) fir.description = description.trim();
  if (crimeType) fir.crimeType = crimeType.trim().toUpperCase();

  await fir.save();

  const updated = await FIR.findById(fir._id).populate(
    'assignedOfficerId',
    'name email employeeId role'
  );

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'UPDATE_FIR',
    entityType: 'FIR',
    entityId: fir._id,
    oldValues,
    newValues: {
      complainantName: fir.complainantName,
      complainantPhone: fir.complainantPhone,
      incidentPlace: fir.incidentPlace,
      description: fir.description,
      crimeType: fir.crimeType,
    },
    metadata: {
      updatedBy: user.email,
    },
  });

  return updated;
};

/**
 * Soft Delete FIR Record
 */
const deleteFIR = async (id, user) => {
  if (user.role === 'VIEWER') {
    const error = new Error('Viewers cannot delete FIRs.');
    error.statusCode = 403;
    throw error;
  }

  const fir = await FIR.findOne({ _id: id, isDeleted: false });

  if (!fir) {
    const error = new Error('FIR record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification for Officers
  if (user.role === 'OFFICER' && fir.assignedOfficerId.toString() !== user.id) {
    const error = new Error('Access denied. You can only delete FIRs assigned to yourself.');
    error.statusCode = 403;
    throw error;
  }

  fir.isDeleted = true;
  await fir.save();

  // Audit Log
  await auditService.logAction({
    userId: user.id,
    role: user.role,
    action: 'DELETE_FIR',
    entityType: 'FIR',
    entityId: fir._id,
    oldValues: { isDeleted: false },
    newValues: { isDeleted: true },
    metadata: {
      firNumber: fir.firNumber,
      deletedBy: user.email,
    },
  });

  return { id: fir._id, firNumber: fir.firNumber, deleted: true };
};

module.exports = {
  createFIR,
  getFIRs,
  getFIRById,
  updateFIR,
  deleteFIR,
};
