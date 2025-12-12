const express = require('express');
const router = express.Router();
const { sendNotification, getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// User Routes
router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

// Admin Routes
router.post('/', protect, admin, sendNotification);

module.exports = router;