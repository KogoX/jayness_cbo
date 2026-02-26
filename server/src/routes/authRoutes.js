const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  sendEmailOtp,
  verifyEmailOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define the URLs
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/email-otp', protect, sendEmailOtp);
router.post('/email-otp/verify', protect, verifyEmailOtp);

module.exports = router;
