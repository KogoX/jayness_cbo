const express = require('express');
const router = express.Router();
const { registerUser, loginUser,forgotPassword, resetPassword } = require('../controllers/authController');

// Define the URLs
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;