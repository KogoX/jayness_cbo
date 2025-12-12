const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  getEventById, 
  createEvent, 
  deleteEvent, 
  updateEvent,
  registerForEvent,
  getEventRegistrations
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

// 🟢 PUBLIC ROUTES (Must be first!)
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/register', registerForEvent); // Public Registration

// 🔒 PROTECTED ADMIN ROUTES
router.post('/', protect, admin, createEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.put('/:id', protect, admin, updateEvent);
router.get('/:id/registrations', protect, admin, getEventRegistrations);

module.exports = router;