const FIR = require('../models/FIR');
const Case = require('../models/Case');
const Crime = require('../models/Crime');
const Criminal = require('../models/Criminal');

/**
 * CSV String Escaper
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

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
 * Helper for Date Range Query
 */
const buildDateRangeQuery = (field, dateFrom, dateTo) => {
  const range = {};
  if (dateFrom) range.$gte = new Date(dateFrom);
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    range.$lte = toDate;
  }
  return Object.keys(range).length > 0 ? { [field]: range } : {};
};

/**
 * Generate FIR Report (CSV / JSON)
 */
const generateFIRReport = async (filters, user, format = 'csv') => {
  const { dateFrom, dateTo, crimeType, assignedOfficerId } = filters;
  const query = { isDeleted: false, ...buildDateRangeQuery('incidentDate', dateFrom, dateTo) };

  // Scoping
  if (user.role === 'OFFICER') {
    query.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (!user.supervisorOfficerId) query.assignedOfficerId = null;
    else query.assignedOfficerId = user.supervisorOfficerId;
  } else if (user.role === 'ADMIN' && assignedOfficerId) {
    query.assignedOfficerId = assignedOfficerId;
  }

  if (crimeType && crimeType.trim() !== '') {
    query.crimeType = crimeType.trim().toUpperCase();
  }

  const firs = await FIR.find(query)
    .populate('assignedOfficerId', 'name email employeeId role')
    .sort({ incidentDate: -1 });

  if (format === 'json') {
    return firs;
  }

  // Generate CSV
  const headers = [
    'FIR Number',
    'Crime Classification',
    'Complainant Name',
    'Complainant Contact',
    'Incident Date',
    'Incident Location',
    'Assigned Officer Name',
    'Assigned Officer Employee ID',
    'Registered Date',
    'Brief Description',
  ];

  const rows = firs.map((f) => [
    escapeCSV(f.firNumber),
    escapeCSV(f.crimeType),
    escapeCSV(f.complainantName),
    escapeCSV(f.complainantPhone),
    escapeCSV(new Date(f.incidentDate).toLocaleDateString()),
    escapeCSV(f.incidentLocation),
    escapeCSV(f.assignedOfficerId?.name || 'Unassigned'),
    escapeCSV(f.assignedOfficerId?.employeeId || 'N/A'),
    escapeCSV(new Date(f.createdAt).toLocaleString()),
    escapeCSV(f.description),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
};

/**
 * Generate Case Clearance & Investigation Report (CSV / JSON)
 */
const generateCaseReport = async (filters, user, format = 'csv') => {
  const { dateFrom, dateTo, status, priority, assignedOfficerId } = filters;
  const query = { isDeleted: false, ...buildDateRangeQuery('createdAt', dateFrom, dateTo) };

  // Scoping
  if (user.role === 'OFFICER') {
    query.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (!user.supervisorOfficerId) query.assignedOfficerId = null;
    else query.assignedOfficerId = user.supervisorOfficerId;
  } else if (user.role === 'ADMIN' && assignedOfficerId) {
    query.assignedOfficerId = assignedOfficerId;
  }

  if (status && status.trim() !== '') {
    query.status = status.trim().toUpperCase();
  }

  if (priority && priority.trim() !== '') {
    query.priority = priority.trim().toUpperCase();
  }

  const cases = await Case.find(query)
    .populate('firId', 'firNumber crimeType incidentLocation')
    .populate('assignedOfficerId', 'name email employeeId role')
    .sort({ createdAt: -1 });

  if (format === 'json') {
    return cases;
  }

  // Generate CSV
  const headers = [
    'Case Number',
    'Investigation Status',
    'Priority Level',
    'Linked FIR Number',
    'Crime Type',
    'Incident Location',
    'Assigned Investigating Officer',
    'Officer Employee ID',
    'Case Opened Date',
    'Case Closed Date',
    'Summary / Notes',
  ];

  const rows = cases.map((c) => [
    escapeCSV(c.caseNumber),
    escapeCSV(c.status),
    escapeCSV(c.priority),
    escapeCSV(c.firId?.firNumber || 'N/A'),
    escapeCSV(c.firId?.crimeType || 'N/A'),
    escapeCSV(c.firId?.incidentLocation || 'N/A'),
    escapeCSV(c.assignedOfficerId?.name || 'Unassigned'),
    escapeCSV(c.assignedOfficerId?.employeeId || 'N/A'),
    escapeCSV(new Date(c.createdAt).toLocaleDateString()),
    escapeCSV(c.closedAt ? new Date(c.closedAt).toLocaleDateString() : 'N/A'),
    escapeCSV(c.summary),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
};

/**
 * Generate Crime Classification Report (CSV / JSON)
 */
const generateCrimeReport = async (filters, user, format = 'csv') => {
  const { dateFrom, dateTo, category, severity } = filters;
  const query = { isDeleted: false, ...buildDateRangeQuery('dateTime', dateFrom, dateTo) };

  const accessibleCaseIds = await getAccessibleCaseIds(user);
  if (accessibleCaseIds !== null) {
    query.caseId = { $in: accessibleCaseIds };
  }

  if (category && category.trim() !== '') {
    query.category = category.trim().toUpperCase();
  }

  if (severity && severity.trim() !== '') {
    query.severity = severity.trim().toUpperCase();
  }

  const crimes = await Crime.find(query)
    .populate({
      path: 'caseId',
      select: 'caseNumber status assignedOfficerId',
      populate: { path: 'assignedOfficerId', select: 'name employeeId' },
    })
    .sort({ dateTime: -1 });

  if (format === 'json') {
    return crimes;
  }

  // Generate CSV
  const headers = [
    'Crime ID',
    'Category',
    'Severity Level',
    'Location',
    'Incident Date & Time',
    'Associated Case Number',
    'Case Status',
    'Investigating Officer',
    'Description',
  ];

  const rows = crimes.map((cr) => [
    escapeCSV(cr._id.toString()),
    escapeCSV(cr.category),
    escapeCSV(cr.severity),
    escapeCSV(cr.location),
    escapeCSV(new Date(cr.dateTime).toLocaleString()),
    escapeCSV(cr.caseId?.caseNumber || 'N/A'),
    escapeCSV(cr.caseId?.status || 'N/A'),
    escapeCSV(cr.caseId?.assignedOfficerId?.name || 'N/A'),
    escapeCSV(cr.description),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
};

/**
 * Get Filtered Report Summary Metrics
 */
const getReportSummary = async (filters, user) => {
  const { dateFrom, dateTo } = filters;
  const firDateQuery = buildDateRangeQuery('incidentDate', dateFrom, dateTo);
  const caseDateQuery = buildDateRangeQuery('createdAt', dateFrom, dateTo);

  const firQuery = { isDeleted: false, ...firDateQuery };
  const caseQuery = { isDeleted: false, ...caseDateQuery };

  if (user.role === 'OFFICER') {
    firQuery.assignedOfficerId = user.id;
    caseQuery.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (user.supervisorOfficerId) {
      firQuery.assignedOfficerId = user.supervisorOfficerId;
      caseQuery.assignedOfficerId = user.supervisorOfficerId;
    }
  }

  const [totalFIRs, totalCases, solvedCases, closedCases] = await Promise.all([
    FIR.countDocuments(firQuery),
    Case.countDocuments(caseQuery),
    Case.countDocuments({ ...caseQuery, status: 'SOLVED' }),
    Case.countDocuments({ ...caseQuery, status: 'CLOSED' }),
  ]);

  const resolved = solvedCases + closedCases;
  const resolutionRate = totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0;

  return {
    totalFIRs,
    totalCases,
    solvedCases,
    closedCases,
    resolved,
    resolutionRate,
    period: {
      from: dateFrom || 'All time',
      to: dateTo || 'Present',
    },
  };
};

module.exports = {
  generateFIRReport,
  generateCaseReport,
  generateCrimeReport,
  getReportSummary,
};
