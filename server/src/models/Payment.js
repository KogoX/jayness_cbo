const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allows public donations
  },
  // Optional, because monthly contributions don't belong to a specific program
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  checkoutRequestID: {
    type: String, 
    required: true, 
    unique: true
  },
  intentId: {
    type: String,
    default: null,
    index: true,
  },
  paymentIntent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentIntent',
    default: null,
  },
  mpesaReceiptNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending',
  },
  reconciliationStatus: {
    type: String,
    enum: ['NotChecked', 'Matched', 'Mismatch', 'NeedsReview'],
    default: 'NotChecked',
  },
  mismatchReason: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    enum: ['authenticated', 'public', 'system'],
    default: 'public',
  },
  transactionDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
