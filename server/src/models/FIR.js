const mongoose = require('mongoose');

const crimeTypes = [
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

const firSchema = new mongoose.Schema(
  {
    firNumber: {
      type: String,
      required: [true, 'FIR Number is required'],
      uppercase: true,
      trim: true,
    },
    complainantName: {
      type: String,
      required: [true, 'Complainant name is required'],
      trim: true,
    },
    complainantPhone: {
      type: String,
      required: [true, 'Complainant phone number is required'],
      trim: true,
    },
    complainantAddress: {
      type: String,
      trim: true,
      default: '',
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date and time are required'],
    },
    incidentPlace: {
      type: String,
      required: [true, 'Incident location/place is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed incident description is required'],
      trim: true,
    },
    crimeType: {
      type: String,
      required: [true, 'Crime category is required'],
      enum: {
        values: crimeTypes,
        message: '{VALUE} is not a supported crime type.',
      },
      uppercase: true,
      trim: true,
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned officer is required'],
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

// Unique partial index on firNumber where isDeleted: false
firSchema.index(
  { firNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Query optimization indexes
firSchema.index({ assignedOfficerId: 1, isDeleted: 1 });
firSchema.index({ incidentDate: -1 });
firSchema.index({ crimeType: 1, isDeleted: 1 });

/**
 * Static method: Generate next official FIR Number format: FIR-YYYY-XXXX
 */
firSchema.statics.generateNextFIRNumber = async function () {
  const currentYear = new Date().getFullYear();
  const prefix = `FIR-${currentYear}-`;

  // Find latest FIR registered this year
  const latestFIR = await this.findOne({
    firNumber: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select('firNumber');

  let nextSequence = 1;
  if (latestFIR && latestFIR.firNumber) {
    const parts = latestFIR.firNumber.split('-');
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

const FIR = mongoose.model('FIR', firSchema);

module.exports = FIR;
