const mongoose = require('mongoose');

const investigationStages = [
  'INITIAL_EVALUATION',
  'EVIDENCE_COLLECTION',
  'INTERROGATION',
  'FORENSIC_ANALYSIS',
  'FINAL_REPORT',
];

const evidenceTypes = [
  'DOCUMENT',
  'IMAGE',
  'PHYSICAL',
  'DIGITAL',
  'WEAPON',
  'OTHER',
];

const evidenceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Evidence name/label is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Evidence category type is required'],
      enum: {
        values: evidenceTypes,
        message: '{VALUE} is not a valid evidence category.',
      },
      default: 'DOCUMENT',
      uppercase: true,
      trim: true,
    },
    collectedAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const investigationSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Associated Case reference is required'],
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recording Officer reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Investigation entry title is required'],
      trim: true,
    },
    notes: {
      type: String,
      required: [true, 'Detailed investigation notes are required'],
      trim: true,
    },
    stage: {
      type: String,
      required: [true, 'Investigation stage is required'],
      enum: {
        values: investigationStages,
        message: '{VALUE} is not a valid investigation stage.',
      },
      default: 'EVIDENCE_COLLECTION',
      uppercase: true,
      trim: true,
    },
    evidence: {
      type: [evidenceItemSchema],
      default: [],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
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

// Query optimization & chronological ordering indexes
investigationSchema.index({ caseId: 1, isDeleted: 1 });
investigationSchema.index({ officerId: 1 });
investigationSchema.index({ stage: 1 });
investigationSchema.index({ recordedAt: -1 });

const Investigation = mongoose.model('Investigation', investigationSchema);

module.exports = Investigation;
