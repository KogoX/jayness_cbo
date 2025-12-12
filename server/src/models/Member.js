const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Link this Member profile to a Login User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phoneNumber: {
    type: String, 
    required: true, // Needed for M-Pesa
  },
  membershipType: {
    type: String,
    enum: ['Regular', 'Associate', 'Honorary'],
    default: 'Regular',
  },
  // Tracks the monthly Ksh 1,000 contribution
  contributionStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  lastPaymentDate: {
    type: Date,
  },
  // Tracks total amount contributed over time
  totalContributed: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);