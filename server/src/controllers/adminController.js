const User = require('../models/User');
const Payment = require('../models/Payment');
const Program = require('../models/Program');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');

const toCsv = (rows) => {
  const headers = ['timestamp', 'actorRole', 'action', 'entityType', 'entityId', 'status', 'source', 'requestId'];
  const escape = (value) => {
    const raw = value == null ? '' : String(value);
    if (raw.includes('"') || raw.includes(',') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    const record = [
      row.createdAt ? new Date(row.createdAt).toISOString() : '',
      row.actorRole || '',
      row.action || '',
      row.entityType || '',
      row.entityId || '',
      row.status || '',
      row.source || '',
      row.requestId || '',
    ].map(escape);
    lines.push(record.join(','));
  });

  return lines.join('\n');
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const payments = await Payment.find({ status: 'Completed' });
    const totalFunds = payments.reduce((acc, item) => acc + item.amount, 0);
    const activePrograms = await Program.countDocuments();

    res.json({
      totalUsers,
      totalFunds,
      activePrograms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      const before = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      await user.deleteOne();

      await logAudit({
        req,
        action: 'admin.user.deleted',
        entityType: 'User',
        entityId: req.params.id,
        before,
        after: null,
      });

      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    await logAudit({
      req,
      action: 'admin.user.deleted',
      entityType: 'User',
      entityId: req.params.id,
      metadata: { error: error.message },
      status: 'failure',
    });
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      const before = {
        role: user.role,
      };
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();

      await logAudit({
        req,
        action: 'admin.user.role.updated',
        entityType: 'User',
        entityId: updatedUser._id,
        before,
        after: { role: updatedUser.role },
      });

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
    await logAudit({
      req,
      action: 'admin.user.role.updated',
      entityType: 'User',
      entityId: req.params.id,
      metadata: { error: error.message },
      status: 'failure',
    });
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      entityType,
      actorId,
      status,
      from,
      to,
      format = 'json',
    } = req.query;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (actorId) query.actorId = actorId;
    if (status) query.status = status;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const numericLimit = Math.max(1, Math.min(Number(limit) || 25, 200));
    const skip = (Math.max(Number(page) || 1, 1) - 1) * numericLimit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate('actorId', 'name email role'),
      AuditLog.countDocuments(query),
    ]);

    if (format === 'csv') {
      const csv = toCsv(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      return res.status(200).send(csv);
    }

    res.json({
      total,
      page: Number(page) || 1,
      limit: numericLimit,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  deleteUser,
  updateUserRole,
  getAuditLogs,
};
