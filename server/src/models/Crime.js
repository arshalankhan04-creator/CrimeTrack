const mongoose = require('mongoose');

const crimeCategories = [
  'THEFT',
  'ROBBERY',
  'ASSAULT',
  'MURDER',
  'CYBERCRIME',
  'FRAUD',
  'HOMICIDE',
  'BURGLARY',
  'EXTORTION',
  'OTHER',
];

const severityLevels = ['MINOR', 'MODERATE', 'SEVERE', 'CRITICAL'];

const crimeSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Associated Case reference is required'],
    },
    crimeType: {
      type: String,
      required: [true, 'Crime category type is required'],
      enum: {
        values: crimeCategories,
        message: '{VALUE} is not a valid crime category.',
      },
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Crime event description is required'],
      trim: true,
    },
    crimeDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      required: [true, 'Crime location / scene address is required'],
      trim: true,
    },
    severity: {
      type: String,
      required: [true, 'Crime severity level is required'],
      enum: {
        values: severityLevels,
        message: '{VALUE} is not a valid severity level.',
      },
      default: 'MODERATE',
      uppercase: true,
      trim: true,
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

// Query optimization indexes
crimeSchema.index({ caseId: 1, isDeleted: 1 });
crimeSchema.index({ crimeType: 1, isDeleted: 1 });
crimeSchema.index({ severity: 1 });
crimeSchema.index({ crimeDate: -1 });

const Crime = mongoose.model('Crime', crimeSchema);

module.exports = Crime;
