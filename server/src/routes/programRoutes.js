const express = require('express');
const router = express.Router();
const { 
  getPrograms, 
  getProgramById, 
  createProgram, 
  updateProgram, 
  deleteProgram 
} = require('../controllers/programController');
const { protect, admin } = require('../middleware/authMiddleware');

// PUBLIC ROUTES (Must be first!)
router.get('/', getPrograms);
router.get('/:id', getProgramById);

// PROTECTED ADMIN ROUTES (Middleware applied here)
router.post('/', protect, admin, createProgram);
router.put('/:id', protect, admin, updateProgram);
router.delete('/:id', protect, admin, deleteProgram);

module.exports = router;