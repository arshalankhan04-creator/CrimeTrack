const mongoose = require('mongoose');

const caseStatuses = ['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'];
const casePriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: [true, 'Case Number is required'],
      uppercase: true,
      trim: true,
    },
    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FIR',
      required: [true, 'Associated FIR reference is required'],
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned Investigating Officer is required'],
    },
    status: {
      type: String,
      required: [true, 'Case status is required'],
      enum: {
        values: caseStatuses,
        message: '{VALUE} is not a valid case status.',
      },
      default: 'OPEN',
      uppercase: true,
      trim: true,
    },
    priority: {
      type: String,
      required: [true, 'Priority level is required'],
      enum: {
        values: casePriorities,
        message: '{VALUE} is not a valid priority level.',
      },
      default: 'MEDIUM',
      uppercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Case summary is required'],
      trim: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique partial index on caseNumber where isDeleted: false
caseSchema.index(
  { caseNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Query optimization indexes
caseSchema.index({ assignedOfficerId: 1, isDeleted: 1 });
caseSchema.index({ status: 1, isDeleted: 1 });
caseSchema.index({ priority: 1 });
caseSchema.index({ firId: 1 });
caseSchema.index({ openedAt: -1 });

/**
 * Static method: Generate next official Case Number format: CASE-YYYY-XXXX
 */
caseSchema.statics.generateNextCaseNumber = async function () {
  const currentYear = new Date().getFullYear();
  const prefix = `CASE-${currentYear}-`;

  const latestCase = await this.findOne({
    caseNumber: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select('caseNumber');

  let nextSequence = 1;
  if (latestCase && latestCase.caseNumber) {
    const parts = latestCase.caseNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
};

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
