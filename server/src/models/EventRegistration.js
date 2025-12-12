const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Optional, but good to have
  },
  phone: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('EventRegistration', registrationSchema);