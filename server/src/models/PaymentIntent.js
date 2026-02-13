const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema(
  {
    intentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      default: null,
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
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['Initiated', 'Pending', 'Completed', 'Failed', 'Cancelled'],
      default: 'Initiated',
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
    mpesaReceiptNumber: {
      type: String,
      default: null,
    },
    channel: {
      type: String,
      default: 'mpesa',
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
