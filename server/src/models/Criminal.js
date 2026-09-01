const mongoose = require('mongoose');

const genderOptions = ['MALE', 'FEMALE', 'OTHER'];

const criminalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Criminal full name is required'],
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: {
        values: genderOptions,
        message: '{VALUE} is not a valid gender option.',
      },
      default: 'MALE',
      uppercase: true,
      trim: true,
    },
    identifyingMarks: {
      type: String,
      trim: true,
      default: '',
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    associatedCaseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Query optimization & search indexes
criminalSchema.index({ name: 1, isDeleted: 1 });
criminalSchema.index({ associatedCaseIds: 1 });
criminalSchema.index({ isDeleted: 1 });

// Full text index for minimal search
criminalSchema.index({
  name: 'text',
  aliases: 'text',
  identifyingMarks: 'text',
});

const Criminal = mongoose.model('Criminal', criminalSchema);

module.exports = Criminal;
