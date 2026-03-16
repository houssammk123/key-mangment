const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  keyCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['UNUSED', 'ACTIVE', 'REUSABLE'],
    default: 'UNUSED',
  },
  reusable: {
    type: Boolean,
    default: false,
  },
  boundEmail: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  redeemedAt: {
    type: Date,
    default: null,
  },
  inviteLink: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Key', keySchema);
