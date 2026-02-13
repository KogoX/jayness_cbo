const express = require('express');
const router = express.Router();
const {
  getAccessToken,
  initiateSTKPush,
  mpesaCallback,
  checkPaymentStatus,
  getPaymentReceipt,
  cancelPendingPayment,
  getMyHistory,
  getReconciliationQueue,
  resolveReconciliationItem,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Authenticated Payment Route (User logs in first)
// URL: /api/payments/pay
router.post('/pay', protect, getAccessToken, initiateSTKPush);

// 2. Public Payment Route (Guest checkout / No Login)
// URL: /api/payments/public/pay
router.post('/public/pay', getAccessToken, initiateSTKPush);

// 3. Callback Route (Safaricom talks to this)
// URL: /api/payments/callback
router.post('/callback', mpesaCallback);

// 4. Check status (Frontend checks this while spinner is loading)
router.get('/status/:checkoutRequestID', checkPaymentStatus);

// 5. Download receipt (only after confirmed payment)
router.get('/receipt/:checkoutRequestID', getPaymentReceipt);

// 6. Cancel payment (frontend can stop pending checkout)
router.patch('/cancel/:checkoutRequestID', cancelPendingPayment);

// 7. Get user's history
router.get('/history', protect, getMyHistory);

// 8. Admin reconciliation queue
router.get('/reconciliation/queue', protect, admin, getReconciliationQueue);
router.patch('/reconciliation/:intentId/resolve', protect, admin, resolveReconciliationItem);

module.exports = router;
