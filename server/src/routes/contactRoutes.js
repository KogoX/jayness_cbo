const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Simple Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({ message: 'Message sent successfully!', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

module.exports = router;