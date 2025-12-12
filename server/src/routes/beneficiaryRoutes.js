const express = require('express');
const router = express.Router();
const { 
  getBeneficiaries, 
  createBeneficiary, 
  deleteBeneficiary,
  publicRegisterBeneficiary
} = require('../controllers/beneficiaryController');
const { protect, admin } = require('../middleware/authMiddleware');

// PUBLIC ROUTE (Must be before the /:id routes)
router.post('/public/register', publicRegisterBeneficiary);

// ADMIN ROUTES
router.get('/', protect, admin, getBeneficiaries);
router.post('/', protect, admin, createBeneficiary);
router.delete('/:id', protect, admin, deleteBeneficiary);

module.exports = router;