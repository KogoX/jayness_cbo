const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require('../controllers/authController');

// Define the URLs
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
