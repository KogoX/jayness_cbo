const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  deleteUser,
  updateUserRole,
  getAuditLogs,
  getReviewQueue,
  getMonthlyComplianceReport,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect this route with BOTH 'protect' (LoggedIn) and 'admin' (Role Check)
router.get('/stats', protect, admin, getAdminStats);
router.get('/audit-logs', protect, admin, getAuditLogs);
router.get('/review-queue', protect, admin, getReviewQueue);
router.get('/compliance/monthly', protect, admin, getMonthlyComplianceReport);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
