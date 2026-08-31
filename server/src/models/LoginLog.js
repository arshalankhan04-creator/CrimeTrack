const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    event: {
      type: String,
      enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'],
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

loginLogSchema.index({ createdAt: -1 });

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

module.exports = LoginLog;
