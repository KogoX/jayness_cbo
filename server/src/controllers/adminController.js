const User = require('../models/User');
const Payment = require('../models/Payment');
const Program = require('../models/Program');
const AuditLog = require('../models/AuditLog');
const PaymentIntent = require('../models/PaymentIntent');
const Beneficiary = require('../models/Beneficiary');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
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

const getReviewQueue = async (req, res) => {
  try {
    const now = Date.now();
    const toHours = (date) => Math.floor((now - new Date(date).getTime()) / (1000 * 60 * 60));

    const [paymentItems, pendingBeneficiaries, contactMessages] = await Promise.all([
      PaymentIntent.find({ reconciliationStatus: { $in: ['Mismatch', 'NeedsReview'] } })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('intentId reconciliationStatus mismatchReason createdAt updatedAt amount phoneNumber'),
      Beneficiary.find({ status: 'Pending' })
        .sort({ createdAt: 1 })
        .limit(20)
        .select('fullName phone assignedProgram createdAt'),
      ContactMessage.find({ status: 'New' })
        .sort({ createdAt: 1 })
        .limit(20)
        .select('name email subject createdAt'),
    ]);

    const paymentQueue = paymentItems.map((item) => {
      const ageHours = toHours(item.createdAt || item.updatedAt);
      const slaHours = 24;
      return {
        type: 'payment_reconciliation',
        id: item.intentId,
        title: `Intent ${item.intentId}`,
        detail: item.mismatchReason || item.reconciliationStatus,
        ageHours,
        slaHours,
        breached: ageHours > slaHours,
      };
    });

    const beneficiaryQueue = pendingBeneficiaries.map((item) => {
      const ageHours = toHours(item.createdAt);
      const slaHours = 48;
      return {
        type: 'beneficiary_approval',
        id: item._id,
        title: item.fullName,
        detail: item.phone || 'No phone provided',
        ageHours,
        slaHours,
        breached: ageHours > slaHours,
      };
    });

    const contactQueue = contactMessages.map((item) => {
      const ageHours = toHours(item.createdAt);
      const slaHours = 24;
      return {
        type: 'contact_followup',
        id: item._id,
        title: item.subject || 'General inquiry',
        detail: item.email,
        ageHours,
        slaHours,
        breached: ageHours > slaHours,
      };
    });

    const items = [...paymentQueue, ...beneficiaryQueue, ...contactQueue]
      .sort((a, b) => b.ageHours - a.ageHours)
      .slice(0, 30);

    const summary = {
      total: items.length,
      breached: items.filter((item) => item.breached).length,
      byType: {
        payment_reconciliation: paymentQueue.length,
        beneficiary_approval: beneficiaryQueue.length,
        contact_followup: contactQueue.length,
      },
    };

    res.json({ summary, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const monthRangeFromKey = (monthKey) => {
  const now = new Date();
  const [yearStr, monthStr] = (monthKey || '').split('-');
  const year = Number(yearStr) || now.getFullYear();
  const monthIndex = (Number(monthStr) || now.getMonth() + 1) - 1;

  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  const normalizedKey = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, '0')}`;
  return { start, end, monthKey: normalizedKey };
};

const getMonthlyComplianceReport = async (req, res) => {
  try {
    const { month, format = 'json' } = req.query;
    const { start, end, monthKey } = monthRangeFromKey(month);

    const [
      completedPayments,
      intents,
      reminderCount,
      auditCount,
      pendingBeneficiaries,
      openContacts,
    ] = await Promise.all([
      Payment.find({ status: 'Completed', createdAt: { $gte: start, $lt: end } }).select('amount mpesaReceiptNumber'),
      PaymentIntent.find({ createdAt: { $gte: start, $lt: end } }).select('reconciliationStatus'),
      Notification.countDocuments({
        createdAt: { $gte: start, $lt: end },
        'metadata.category': 'reminder',
      }),
      AuditLog.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Beneficiary.countDocuments({ status: 'Pending', createdAt: { $gte: start, $lt: end } }),
      ContactMessage.countDocuments({ status: 'New', createdAt: { $gte: start, $lt: end } }),
    ]);

    const paymentTotal = completedPayments.reduce((sum, item) => sum + item.amount, 0);
    const receiptsRecorded = completedPayments.filter(
      (item) => item.mpesaReceiptNumber && item.mpesaReceiptNumber !== 'N/A'
    ).length;

    const intentsByStatus = intents.reduce(
      (acc, item) => {
        acc[item.reconciliationStatus] = (acc[item.reconciliationStatus] || 0) + 1;
        return acc;
      },
      { NotChecked: 0, Matched: 0, Mismatch: 0, NeedsReview: 0 }
    );

    const totalIntents = intents.length || 1;
    const automationCoverage = Math.round(((intentsByStatus.Matched || 0) / totalIntents) * 100);
    const recordCompleteness = completedPayments.length
      ? Math.round((receiptsRecorded / completedPayments.length) * 100)
      : 100;

    const report = {
      month: monthKey,
      payments: {
        completedCount: completedPayments.length,
        totalAmount: paymentTotal,
        receiptsRecorded,
      },
      reconciliation: intentsByStatus,
      remindersSent: reminderCount,
      auditEvents: auditCount,
      slaRiskItems: pendingBeneficiaries + openContacts + intentsByStatus.NeedsReview + intentsByStatus.Mismatch,
      automationCoveragePercent: automationCoverage,
      recordCompletenessPercent: recordCompleteness,
    };

    if (format === 'csv') {
      const lines = [
        'metric,value',
        `month,${report.month}`,
        `payments_completed,${report.payments.completedCount}`,
        `payments_total_amount,${report.payments.totalAmount}`,
        `receipts_recorded,${report.payments.receiptsRecorded}`,
        `reconciliation_matched,${report.reconciliation.Matched}`,
        `reconciliation_mismatch,${report.reconciliation.Mismatch}`,
        `reconciliation_needs_review,${report.reconciliation.NeedsReview}`,
        `reconciliation_not_checked,${report.reconciliation.NotChecked}`,
        `reminders_sent,${report.remindersSent}`,
        `audit_events,${report.auditEvents}`,
        `sla_risk_items,${report.slaRiskItems}`,
        `automation_coverage_percent,${report.automationCoveragePercent}`,
        `record_completeness_percent,${report.recordCompletenessPercent}`,
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="compliance-${report.month}.csv"`);
      return res.status(200).send(lines.join('\n'));
    }

    res.json(report);
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
  getReviewQueue,
  getMonthlyComplianceReport,
};
