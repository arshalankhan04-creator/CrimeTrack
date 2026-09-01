const FIR = require('../models/FIR');
const Case = require('../models/Case');
const Crime = require('../models/Crime');
const Criminal = require('../models/Criminal');
const Investigation = require('../models/Investigation');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * Helper to fetch accessible Case IDs for user role
 */
const getAccessibleCaseIds = async (user) => {
  if (user.role === 'ADMIN') {
    return null; // All accessible
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
 * Get Aggregated Summary Statistics
 */
const getDashboardStats = async (user) => {
  const firQuery = { isDeleted: false };
  const caseQuery = { isDeleted: false };
  const criminalQuery = { isDeleted: false };
  const invQuery = { isDeleted: false };

  if (user.role === 'OFFICER') {
    firQuery.assignedOfficerId = user.id;
    caseQuery.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (user.supervisorOfficerId) {
      firQuery.assignedOfficerId = user.supervisorOfficerId;
      caseQuery.assignedOfficerId = user.supervisorOfficerId;
    }
  }

  const accessibleCaseIds = await getAccessibleCaseIds(user);
  if (accessibleCaseIds !== null) {
    invQuery.caseId = { $in: accessibleCaseIds };
    criminalQuery.$or = [
      { associatedCaseIds: { $in: accessibleCaseIds } },
      { associatedCaseIds: { $size: 0 } },
    ];
  }

  const [
    totalFIRs,
    totalCases,
    openCases,
    underInvestigationCases,
    solvedCases,
    closedCases,
    totalCriminals,
    investigations,
    activeOfficersCount,
  ] = await Promise.all([
    FIR.countDocuments(firQuery),
    Case.countDocuments(caseQuery),
    Case.countDocuments({ ...caseQuery, status: 'OPEN' }),
    Case.countDocuments({ ...caseQuery, status: 'UNDER_INVESTIGATION' }),
    Case.countDocuments({ ...caseQuery, status: 'SOLVED' }),
    Case.countDocuments({ ...caseQuery, status: 'CLOSED' }),
    Criminal.countDocuments(criminalQuery),
    Investigation.find(invQuery).select('evidence'),
    user.role === 'ADMIN' ? User.countDocuments({ role: 'OFFICER', isActive: true, isDeleted: false }) : 0,
  ]);

  // Total Evidence Count
  const totalEvidenceCount = investigations.reduce(
    (acc, curr) => acc + (curr.evidence ? curr.evidence.length : 0),
    0
  );

  // Resolution Rate calculation
  const resolvedCases = solvedCases + closedCases;
  const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

  return {
    totalFIRs,
    totalCases,
    openCases,
    underInvestigationCases,
    solvedCases,
    closedCases,
    activeCaseload: openCases + underInvestigationCases,
    resolvedCases,
    resolutionRate,
    totalCriminals,
    totalEvidenceCount,
    totalInvestigations: investigations.length,
    activeOfficersCount: user.role === 'ADMIN' ? activeOfficersCount : undefined,
  };
};

/**
 * Get Visual Chart Aggregations
 */
const getDashboardCharts = async (user) => {
  const firQuery = { isDeleted: false };
  const caseQuery = { isDeleted: false };

  if (user.role === 'OFFICER') {
    firQuery.assignedOfficerId = user.id;
    caseQuery.assignedOfficerId = user.id;
  } else if (user.role === 'VIEWER') {
    if (user.supervisorOfficerId) {
      firQuery.assignedOfficerId = user.supervisorOfficerId;
      caseQuery.assignedOfficerId = user.supervisorOfficerId;
    }
  }

  // 1. Crime Category Distribution from FIRs
  const crimeTypeStats = await FIR.aggregate([
    { $match: firQuery },
    { $group: { _id: '$crimeType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 2. Case Status Lifecycle Distribution
  const caseStatusStats = await Case.aggregate([
    { $match: caseQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // 3. Case Priority Distribution
  const casePriorityStats = await Case.aggregate([
    { $match: caseQuery },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // 4. Monthly Incident Trend (Past 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyStats = await FIR.aggregate([
    {
      $match: {
        ...firQuery,
        incidentDate: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$incidentDate' },
          month: { $month: '$incidentDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format monthly stats into readable names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyTrends = monthlyStats.map((item) => ({
    period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    count: item.count,
  }));

  return {
    crimeTypes: crimeTypeStats.map((item) => ({ type: item._id, count: item.count })),
    statusDistribution: caseStatusStats.map((item) => ({ status: item._id, count: item.count })),
    priorityDistribution: casePriorityStats.map((item) => ({ priority: item._id, count: item.count })),
    monthlyTrends: formattedMonthlyTrends,
  };
};

/**
 * Get Recent Station Activity & Audits
 */
const getRecentActivity = async (user) => {
  const query = {};

  if (user.role === 'OFFICER') {
    query.userId = user.id;
  } else if (user.role === 'VIEWER') {
    if (user.supervisorOfficerId) {
      query.userId = user.supervisorOfficerId;
    }
  }

  const activities = await AuditLog.find(query)
    .populate('userId', 'name email employeeId role')
    .sort({ createdAt: -1 })
    .limit(10);

  return activities;
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
};
