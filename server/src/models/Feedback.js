const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
      index: true,
    },
    feedbackType: {
      type: String,
      enum: ['BUG_REPORT', 'FEATURE_REQUEST', 'CASE_FEEDBACK', 'SYSTEM_FEEDBACK'],
      default: 'SYSTEM_FEEDBACK',
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Feedback subject is required.'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters.'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required.'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters.'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1 star.'],
      max: [5, 'Rating cannot exceed 5 stars.'],
      default: 5,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    relatedCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
    },
    adminResponse: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Admin response cannot exceed 2000 characters.'],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
