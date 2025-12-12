const express = require('express');
const router = express.Router();
const { getAccessToken, initiateSTKPush, mpesaCallback, checkPaymentStatus, getMyHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have this from before

// Route to trigger payment (Must be logged in)
// URL: /api/payments/pay
router.post('/pay', protect, getAccessToken, initiateSTKPush);
// 2. Public Route (No 'protect' middleware)
router.post('/public/pay', getAccessToken, initiateSTKPush);

// Route for Safaricom to call us back (Public)
// URL: /api/payments/callback
router.post('/callback', mpesaCallback);
// Check status
router.get('/status/:checkoutRequestID', protect, checkPaymentStatus);
// Get user's history
router.get('/history', protect, getMyHistory);

module.exports = router;