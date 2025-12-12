const express = require('express');
const router = express.Router();

// Import EVERYTHING from the userController
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} = require('../controllers/userController');

const { protect, admin } = require('../middleware/authMiddleware');

// 1. Auth Routes (Public)
router.post('/', registerUser);
router.post('/login', authUser);

// 2. Profile Routes (Private)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// 3. Admin Routes (Admin Only)
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;