const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String, 
    enum: ['info', 'alert', 'success'],
    default: 'info'
  },
  dedupeKey: {
    type: String,
    default: undefined,
    unique: true,
    sparse: true,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
