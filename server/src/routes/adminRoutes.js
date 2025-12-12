const express = require('express');
const router = express.Router();
const { getAdminStats, getUsers, deleteUser, updateUserRole } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect this route with BOTH 'protect' (LoggedIn) and 'admin' (Role Check)
router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;