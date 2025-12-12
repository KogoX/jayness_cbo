const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send a notification (Admin only)
// @route   POST /api/notifications
const sendNotification = async (req, res) => {
  const { userId, title, message, type } = req.body; // userId can be specific ID or 'all'

  try {
    if (userId === 'all') {
      // 1. BROADCAST: Send to everyone
      const users = await User.find({}, '_id'); // Get all user IDs
      
      const notifications = users.map(user => ({
        recipient: user._id,
        title,
        message,
        type: type || 'info'
      }));

      await Notification.insertMany(notifications);
      res.status(201).json({ message: `Sent to ${users.length} users` });

    } else {
      // 2. PERSONAL: Send to one person
      await Notification.create({
        recipient: userId,
        title,
        message,
        type: type || 'info'
      });
      res.status(201).json({ message: 'Notification sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my notifications
// @route   GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }); // Newest first
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.recipient.toString() === req.user._id.toString()) {
      notification.isRead = true;
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendNotification, getMyNotifications, markAsRead };