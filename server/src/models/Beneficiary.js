const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String, 
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    required: true, 
  },
  email: {
    type: String,   
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  assignedProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Graduated', 'Pending'],
    default: 'Active',
  },
  needs: {
    type: String,
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Beneficiary', beneficiarySchema);