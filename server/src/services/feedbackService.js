const Feedback = require('../models/Feedback');
const Case = require('../models/Case');
const { logAction } = require('./auditService');

/**
 * Submit New Feedback / Issue Report
 */
const createFeedback = async (data, user) => {
  const { feedbackType, category, subject, message, rating, relatedCaseId, priority } = data;

  if (!subject || !message) {
    const error = new Error('Subject and message are required fields.');
    error.statusCode = 400;
    throw error;
  }

  // If relatedCaseId is provided, verify case existence
  if (relatedCaseId) {
    const caseExists = await Case.findOne({ _id: relatedCaseId, isDeleted: false });
    if (!caseExists) {
      const error = new Error('The linked Case was not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  const newFeedback = await Feedback.create({
    userId: user.id,
    feedbackType: feedbackType || 'SYSTEM_FEEDBACK',
    category: category || 'General',
    subject: subject.trim(),
    message: message.trim(),
    rating: rating ? Number(rating) : 5,
    priority: priority || 'MEDIUM',
    relatedCaseId: relatedCaseId || null,
  });

  // Non-blocking audit log
  await logAction({
    userId: user.id,
    role: user.role,
    action: 'CREATE_FEEDBACK',
    entityType: 'Feedback',
    entityId: newFeedback._id,
    newValues: {
      feedbackType: newFeedback.feedbackType,
      subject: newFeedback.subject,
      rating: newFeedback.rating,
      priority: newFeedback.priority,
    },
    metadata: {
      submittedBy: user.name,
      email: user.email,
    },
  });

  return newFeedback;
};

/**
 * Query Paginated Feedback with Role Scoping
 */
const getFeedbackList = async (queryParams, user) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // Role Scoping: Admins see all feedback; Officers and Viewers see only their submissions
  if (user.role !== 'ADMIN') {
    query.userId = user.id;
  }

  // Filter by feedbackType
  if (queryParams.feedbackType && queryParams.feedbackType.trim() !== '') {
    query.feedbackType = queryParams.feedbackType.trim();
  }

  // Filter by status
  if (queryParams.status && queryParams.status.trim() !== '') {
    query.status = queryParams.status.trim().toUpperCase();
  }

  // Filter by priority
  if (queryParams.priority && queryParams.priority.trim() !== '') {
    query.priority = queryParams.priority.trim().toUpperCase();
  }

  // Search keyword in subject or message
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    query.$or = [{ subject: searchRegex }, { message: searchRegex }, { category: searchRegex }];
  }

  const [items, total] = await Promise.all([
    Feedback.find(query)
      .populate('userId', 'name email employeeId role')
      .populate('relatedCaseId', 'caseNumber priority status')
      .populate('resolvedBy', 'name email employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(query),
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
 * Admin Triage / Resolve Feedback
 */
const triageFeedback = async (id, data, adminUser) => {
  const { status, priority, adminResponse } = data;

  const feedbackDoc = await Feedback.findOne({ _id: id, isDeleted: false });
  if (!feedbackDoc) {
    const error = new Error('Feedback item not found.');
    error.statusCode = 404;
    throw error;
  }

  const oldValues = {
    status: feedbackDoc.status,
    priority: feedbackDoc.priority,
    adminResponse: feedbackDoc.adminResponse,
    resolvedBy: feedbackDoc.resolvedBy,
    resolvedAt: feedbackDoc.resolvedAt,
  };

  if (status) feedbackDoc.status = status;
  if (priority) feedbackDoc.priority = priority;
  if (adminResponse !== undefined) feedbackDoc.adminResponse = adminResponse.trim();

  if (status === 'RESOLVED' || status === 'REJECTED') {
    feedbackDoc.resolvedBy = adminUser.id;
    feedbackDoc.resolvedAt = new Date();
  }

  await feedbackDoc.save();

  // Audit log triage
  await logAction({
    userId: adminUser.id,
    role: adminUser.role,
    action: 'TRIAGE_FEEDBACK',
    entityType: 'Feedback',
    entityId: feedbackDoc._id,
    oldValues,
    newValues: {
      status: feedbackDoc.status,
      priority: feedbackDoc.priority,
      adminResponse: feedbackDoc.adminResponse,
      resolvedBy: feedbackDoc.resolvedBy,
      resolvedAt: feedbackDoc.resolvedAt,
    },
    metadata: {
      triagedBy: adminUser.name,
      adminEmail: adminUser.email,
    },
  });

  return feedbackDoc;
};

/**
 * Get Feedback Metrics & Satisfaction Averages
 */
const getFeedbackStats = async (user) => {
  const baseQuery = { isDeleted: false };
  if (user.role !== 'ADMIN') {
    baseQuery.userId = user.id;
  }

  const [totalCount, pendingCount, inReviewCount, resolvedCount, avgRatingResult] = await Promise.all([
    Feedback.countDocuments(baseQuery),
    Feedback.countDocuments({ ...baseQuery, status: 'PENDING' }),
    Feedback.countDocuments({ ...baseQuery, status: 'IN_REVIEW' }),
    Feedback.countDocuments({ ...baseQuery, status: 'RESOLVED' }),
    Feedback.aggregate([
      { $match: baseQuery },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]),
  ]);

  const avgRating = avgRatingResult.length > 0 && avgRatingResult[0].avgRating !== null
    ? Number(avgRatingResult[0].avgRating.toFixed(1))
    : 5.0;

  return {
    totalCount,
    pendingCount,
    inReviewCount,
    resolvedCount,
    avgRating,
  };
};

module.exports = {
  createFeedback,
  getFeedbackList,
  triageFeedback,
  getFeedbackStats,
};
