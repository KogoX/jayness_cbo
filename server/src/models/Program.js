const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    enum: [
      'Child and Orphan Support',
      'Women Empowerment Hub',
      'Community Health Initiative',
      'Education and Literacy Drive',
      'Youth Empowerment and Innovation',
      'Environmental and Civic Engagement'
    ],
  },
  description: {
    type: String,
    required: true,
  },
  targetBudget: {
    type: Number,
    required: true, // e.g., How much money do you need for this?
  },
  currentRaised: {
    type: Number,
    default: 0, // Automatically updates when people donate
  },
  beneficiariesCount: {
    type: Number,
    default: 0, // e.g., "150 Children supported"
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Upcoming'],
    default: 'Active',
  },
  image: {
    type: String, // URL to an image (we'll use a placeholder for now)
    default: 'https://via.placeholder.com/300'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Program', programSchema);