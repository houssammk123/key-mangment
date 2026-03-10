const mongoose = require('mongoose');

const inviteLinkSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  assigned: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: String,
    default: null,
  },
  keyCode: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('InviteLink', inviteLinkSchema);
