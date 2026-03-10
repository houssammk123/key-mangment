const mongoose = require('mongoose');

const unbindRequestSchema = new mongoose.Schema({
  keyCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
}, { timestamps: true });

module.exports = mongoose.model('UnbindRequest', unbindRequestSchema);
