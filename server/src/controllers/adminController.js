const User = require('../models/User');
const Payment = require('../models/Payment');
const Program = require('../models/Program');

// @desc    Get System Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // 1. Count Total Users
    const totalUsers = await User.countDocuments();

    // 2. Calculate Total Funds Raised (Sum of all Completed payments)
    const payments = await Payment.find({ status: 'Completed' });
    const totalFunds = payments.reduce((acc, item) => acc + item.amount, 0);

    // 3. Count Active Programs
    const activePrograms = await Program.countDocuments();

    res.json({
      totalUsers,
      totalFunds,
      activePrograms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (Promote to Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role; // e.g., 'admin' or 'user'
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats, getUsers, deleteUser, updateUserRole };