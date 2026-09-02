const FIR = require('../models/FIR');
const Case = require('../models/Case');
const Crime = require('../models/Crime');
const Criminal = require('../models/Criminal');
const Investigation = require('../models/Investigation');

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
 * Global Search & Multi-Filter Query Engine
 */
const searchGlobal = async (queryParams, user) => {
  const {
    q = '',
    entity = 'ALL',
    status,
    crimeType,
    priority,
    stage,
    dateFrom,
    dateTo,
    limit = 50,
  } = queryParams;

  const maxLimit = parseInt(limit, 10) || 50;
  const trimmedQ = q.trim();
  const searchRegex = trimmedQ ? new RegExp(trimmedQ, 'i') : null;

  const results = {
    query: trimmedQ,
    totalCount: 0,
    firs: [],
    cases: [],
    crimes: [],
    criminals: [],
    investigations: [],
  };

  const shouldSearchAll = entity === 'ALL';
  const accessibleCaseIds = await getAccessibleCaseIds(user);

  // Date Range Filter Helper
  const buildDateQuery = (field) => {
    const range = {};
    if (dateFrom) range.$gte = new Date(dateFrom);
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      range.$lte = toDate;
    }
    return Object.keys(range).length > 0 ? { [field]: range } : {};
  };

  // ==========================================
  // 1. Search FIRs
  // ==========================================
  if (shouldSearchAll || entity === 'FIR') {
    const firFilter = { isDeleted: false, ...buildDateQuery('incidentDate') };

    // Scoping
    if (user.role === 'OFFICER') {
      firFilter.assignedOfficerId = user.id;
    } else if (user.role === 'VIEWER') {
      if (!user.supervisorOfficerId) firFilter.assignedOfficerId = null;
      else firFilter.assignedOfficerId = user.supervisorOfficerId;
    }

    if (crimeType && crimeType.trim() !== '') {
      firFilter.crimeType = crimeType.trim().toUpperCase();
    }

    if (searchRegex) {
      firFilter.$or = [
        { firNumber: searchRegex },
        { complainantName: searchRegex },
        { complainantPhone: searchRegex },
        { description: searchRegex },
        { incidentLocation: searchRegex },
        { crimeType: searchRegex },
      ];
    }

    const firMatches = await FIR.find(firFilter)
      .populate('assignedOfficerId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .limit(maxLimit);

    results.firs = firMatches.map((f) => ({
      _id: f._id,
      entityType: 'FIR',
      referenceNumber: f.firNumber,
      title: `${f.crimeType} — ${f.complainantName}`,
      description: f.description,
      location: f.incidentLocation,
      date: f.incidentDate,
      crimeType: f.crimeType,
      assignedOfficer: f.assignedOfficerId?.name,
      status: 'REGISTERED',
      linkUrl: `/firs`,
    }));
  }

  // ==========================================
  // 2. Search Cases
  // ==========================================
  if (shouldSearchAll || entity === 'CASE') {
    const caseFilter = { isDeleted: false, ...buildDateQuery('createdAt') };

    // Scoping
    if (user.role === 'OFFICER') {
      caseFilter.assignedOfficerId = user.id;
    } else if (user.role === 'VIEWER') {
      if (!user.supervisorOfficerId) caseFilter.assignedOfficerId = null;
      else caseFilter.assignedOfficerId = user.supervisorOfficerId;
    }

    if (status && status.trim() !== '') {
      caseFilter.status = status.trim().toUpperCase();
    }

    if (priority && priority.trim() !== '') {
      caseFilter.priority = priority.trim().toUpperCase();
    }

    if (searchRegex) {
      caseFilter.$or = [
        { caseNumber: searchRegex },
        { summary: searchRegex },
        { status: searchRegex },
        { priority: searchRegex },
      ];
    }

    const caseMatches = await Case.find(caseFilter)
      .populate('firId', 'firNumber crimeType incidentLocation')
      .populate('assignedOfficerId', 'name email employeeId role')
      .sort({ createdAt: -1 })
      .limit(maxLimit);

    results.cases = caseMatches.map((c) => ({
      _id: c._id,
      entityType: 'CASE',
      referenceNumber: c.caseNumber,
      title: `Case ${c.caseNumber} (${c.status})`,
      description: c.summary,
      priority: c.priority,
      status: c.status,
      linkedFIR: c.firId?.firNumber,
      assignedOfficer: c.assignedOfficerId?.name,
      date: c.createdAt,
      linkUrl: `/cases`,
    }));
  }

  // ==========================================
  // 3. Search Crimes
  // ==========================================
  if (shouldSearchAll || entity === 'CRIME') {
    const crimeFilter = { isDeleted: false, ...buildDateQuery('dateTime') };

    if (accessibleCaseIds !== null) {
      crimeFilter.caseId = { $in: accessibleCaseIds };
    }

    if (crimeType && crimeType.trim() !== '') {
      crimeFilter.category = crimeType.trim().toUpperCase();
    }

    if (priority && priority.trim() !== '') {
      crimeFilter.severity = priority.trim().toUpperCase();
    }

    if (searchRegex) {
      crimeFilter.$or = [
        { category: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { severity: searchRegex },
      ];
    }

    const crimeMatches = await Crime.find(crimeFilter)
      .populate('caseId', 'caseNumber status')
      .sort({ dateTime: -1 })
      .limit(maxLimit);

    results.crimes = crimeMatches.map((cr) => ({
      _id: cr._id,
      entityType: 'CRIME',
      referenceNumber: cr.caseId?.caseNumber || 'CRIME',
      title: `${cr.category} (${cr.severity})`,
      description: cr.description,
      location: cr.location,
      severity: cr.severity,
      category: cr.category,
      date: cr.dateTime,
      linkUrl: `/cases`,
    }));
  }

  // ==========================================
  // 4. Search Criminals (Privacy Preserving)
  // ==========================================
  if (shouldSearchAll || entity === 'CRIMINAL') {
    const criminalFilter = { isDeleted: false };

    if (searchRegex) {
      criminalFilter.$or = [
        { name: searchRegex },
        { aliases: searchRegex },
        { identifyingMarks: searchRegex },
      ];
    }

    // Return MINIMAL identity data only (Privacy Directive)
    const criminalMatches = await Criminal.find(criminalFilter)
      .select('name aliases age gender identifyingMarks photoUrl associatedCaseIds')
      .limit(maxLimit);

    results.criminals = criminalMatches.map((crm) => {
      // Calculate accessible linked cases count
      const accessibleLinkedCount = accessibleCaseIds === null
        ? crm.associatedCaseIds.length
        : crm.associatedCaseIds.filter((cid) =>
            accessibleCaseIds.some((aid) => aid.toString() === cid.toString())
          ).length;

      return {
        _id: crm._id,
        entityType: 'CRIMINAL',
        referenceNumber: `CRIMINAL-${crm._id.toString().substring(18).toUpperCase()}`,
        title: crm.name,
        aliases: crm.aliases,
        age: crm.age,
        gender: crm.gender,
        description: crm.identifyingMarks || 'No identifying marks registered',
        photoUrl: crm.photoUrl,
        linkedCasesCount: accessibleLinkedCount,
        linkUrl: `/criminals`,
      };
    });
  }

  // ==========================================
  // 5. Search Investigations
  // ==========================================
  if (shouldSearchAll || entity === 'INVESTIGATION') {
    const invFilter = { isDeleted: false, ...buildDateQuery('recordedAt') };

    if (accessibleCaseIds !== null) {
      invFilter.caseId = { $in: accessibleCaseIds };
    }

    if (stage && stage.trim() !== '') {
      invFilter.stage = stage.trim().toUpperCase();
    }

    if (searchRegex) {
      invFilter.$or = [
        { title: searchRegex },
        { notes: searchRegex },
        { stage: searchRegex },
        { 'evidence.name': searchRegex },
        { 'evidence.description': searchRegex },
      ];
    }

    const invMatches = await Investigation.find(invFilter)
      .populate('caseId', 'caseNumber status')
      .populate('officerId', 'name email employeeId')
      .sort({ recordedAt: -1 })
      .limit(maxLimit);

    results.investigations = invMatches.map((inv) => ({
      _id: inv._id,
      entityType: 'INVESTIGATION',
      referenceNumber: inv.caseId?.caseNumber || 'INVESTIGATION',
      title: inv.title,
      description: inv.notes,
      stage: inv.stage,
      evidenceCount: inv.evidence ? inv.evidence.length : 0,
      recordingOfficer: inv.officerId?.name,
      date: inv.recordedAt,
      linkUrl: `/investigations`,
    }));
  }

  results.totalCount =
    results.firs.length +
    results.cases.length +
    results.crimes.length +
    results.criminals.length +
    results.investigations.length;

  return results;
};

module.exports = {
  searchGlobal,
};
