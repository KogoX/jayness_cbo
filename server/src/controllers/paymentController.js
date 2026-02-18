const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const PaymentIntent = require('../models/PaymentIntent');
const Program = require('../models/Program');
const { logAudit } = require('../utils/auditLogger');

const getTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    (`0${date.getMonth() + 1}`).slice(-2) +
    (`0${date.getDate()}`).slice(-2) +
    (`0${date.getHours()}`).slice(-2) +
    (`0${date.getMinutes()}`).slice(-2) +
    (`0${date.getSeconds()}`).slice(-2)
  );
};

const generateIntentId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const normalizePhone = (value = '') => String(value).replace(/\D/g, '').slice(-9);

const mapMpesaResultCodeToStatus = (resultCode) => {
  const code = String(resultCode);
  if (code === '0') return 'Completed';
  if (code === '1032') return 'Cancelled';
  if (code === '1' || code === '2001') return 'Failed';
  return 'Pending';
};

const normalizeItemName = (name = '') => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

const getCallbackItemValue = (items, expectedName) => {
  const expected = normalizeItemName(expectedName);
  const found = (items || []).find(
    (item) => normalizeItemName(item?.Name || item?.name || item?.Key || item?.key) === expected
  );
  return found?.Value ?? found?.value;
};

const hasUsableReceiptCode = (value) => {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized.length > 0 && normalized.toUpperCase() !== 'N/A';
};

const extractMpesaReceiptCode = (callbackData) => {
  const items = callbackData?.CallbackMetadata?.Item || [];
  const fromKnownKey =
    getCallbackItemValue(items, 'MpesaReceiptNumber') ||
    getCallbackItemValue(items, 'M-PesaReceiptNumber') ||
    getCallbackItemValue(items, 'ReceiptNumber');

  if (fromKnownKey) return String(fromKnownKey);

  for (const item of items) {
    if (typeof item?.Value === 'string') {
      const trimmed = item.Value.trim();
      if (/^[A-Z0-9]{8,15}$/i.test(trimmed)) {
        return trimmed;
      }
    }
  }

  const resultDesc = String(callbackData?.ResultDesc || '').trim();
  const matchFromDesc = resultDesc.match(/\b[A-Z0-9]{8,15}\b/i);
  if (matchFromDesc) return matchFromDesc[0];

  return undefined;
};

const extractReceiptFromStatusQuery = (queryData) => {
  const topLevelReceipt =
    queryData?.MpesaReceiptNumber || queryData?.['M-PesaReceiptNumber'] || queryData?.ReceiptNumber;

  if (hasUsableReceiptCode(topLevelReceipt)) {
    return String(topLevelReceipt).trim();
  }

  const items = queryData?.ResultParameters?.ResultParameter || queryData?.ResultParameters?.Item || [];
  const fromKnownKey =
    getCallbackItemValue(items, 'MpesaReceiptNumber') ||
    getCallbackItemValue(items, 'M-PesaReceiptNumber') ||
    getCallbackItemValue(items, 'ReceiptNumber');

  if (hasUsableReceiptCode(fromKnownKey)) {
    return String(fromKnownKey).trim();
  }

  for (const item of items) {
    if (typeof item?.Value === 'string') {
      const trimmed = item.Value.trim();
      if (/^[A-Z0-9]{8,15}$/i.test(trimmed)) {
        return trimmed;
      }
    }
  }

  return undefined;
};

const getMpesaAccessTokenValue = async () => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY.trim();
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET.trim();
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = `Basic ${Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')}`;

  const response = await axios.get(url, {
    headers: { Authorization: auth },
  });

  return response.data.access_token;
};

const queryStkStatusFromMpesa = async (checkoutRequestID) => {
  const token = await getMpesaAccessTokenValue();
  const shortCode = process.env.MPESA_SHORTCODE.trim();
  const passkey = process.env.MPESA_PASSKEY.trim();
  const timestamp = getTimestamp();
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

const getIntentForPayment = async (payment) => {
  if (payment.paymentIntent) {
    return PaymentIntent.findById(payment.paymentIntent);
  }

  if (payment.intentId) {
    return PaymentIntent.findOne({ intentId: payment.intentId });
  }

  return null;
};

const reconcilePaymentAndIntent = async (payment, intent, req = null, context = {}) => {
  if (!payment) return;

  if (!intent) {
    payment.reconciliationStatus = 'NeedsReview';
    payment.mismatchReason = 'Missing payment intent';
    await payment.save();
    await logAudit({
      req,
      action: 'payment.reconciliation.flagged',
      entityType: 'Payment',
      entityId: payment._id,
      metadata: { checkoutRequestID: payment.checkoutRequestID, reason: payment.mismatchReason, ...context },
      source: context.source || 'api',
    });
    return;
  }

  const reasons = [];
  if (Number(payment.amount) !== Number(intent.amount)) {
    reasons.push('Amount mismatch');
  }
  if (normalizePhone(payment.phoneNumber) !== normalizePhone(intent.phoneNumber)) {
    reasons.push('Phone mismatch');
  }

  const status = reasons.length ? 'Mismatch' : 'Matched';
  const reason = reasons.length ? reasons.join('; ') : null;

  payment.reconciliationStatus = status;
  payment.mismatchReason = reason;
  await payment.save();

  intent.reconciliationStatus = status;
  intent.mismatchReason = reason;
  intent.lastCheckedAt = new Date();
  await intent.save();

  if (status !== 'Matched') {
    await logAudit({
      req,
      action: 'payment.reconciliation.flagged',
      entityType: 'PaymentIntent',
      entityId: intent._id,
      metadata: {
        intentId: intent.intentId,
        checkoutRequestID: payment.checkoutRequestID,
        reason,
        ...context,
      },
      source: context.source || 'api',
    });
  }
};

const syncIntentFromPayment = async (payment, req = null, context = {}) => {
  const intent = await getIntentForPayment(payment);
  if (!intent) {
    await reconcilePaymentAndIntent(payment, null, req, context);
    return;
  }

  intent.checkoutRequestID = payment.checkoutRequestID || intent.checkoutRequestID;
  intent.status = payment.status;
  intent.mpesaReceiptNumber = payment.mpesaReceiptNumber || intent.mpesaReceiptNumber;
  intent.lastCheckedAt = new Date();
  await intent.save();

  await reconcilePaymentAndIntent(payment, intent, req, context);
};

const markPaymentCompleted = async (payment, receipt, req = null, context = {}) => {
  const wasCompleted = payment.status === 'Completed';

  payment.status = 'Completed';
  if (hasUsableReceiptCode(receipt)) {
    payment.mpesaReceiptNumber = String(receipt).trim();
  }
  if (!payment.transactionDate) {
    payment.transactionDate = new Date();
  }
  await payment.save();

  if (!wasCompleted && payment.programId) {
    const program = await Program.findById(payment.programId);
    if (program) {
      program.currentRaised = (program.currentRaised || 0) + payment.amount;
      await program.save();
    }
  }

  await syncIntentFromPayment(payment, req, context);
};

const refreshPendingPaymentStatus = async (payment, checkoutRequestID) => {
  const needsReceiptSync =
    payment.status === 'Completed' && (!payment.mpesaReceiptNumber || payment.mpesaReceiptNumber === 'N/A');

  if (payment.status !== 'Pending' && !needsReceiptSync) {
    return payment;
  }

  try {
    const mpesaStatus = await queryStkStatusFromMpesa(checkoutRequestID);
    const mappedStatus = mapMpesaResultCodeToStatus(mpesaStatus.ResultCode);

    if (mappedStatus === 'Completed') {
      const receiptCode =
        extractReceiptFromStatusQuery(mpesaStatus) || extractMpesaReceiptCode({ CallbackMetadata: mpesaStatus });
      await markPaymentCompleted(payment, receiptCode || payment.mpesaReceiptNumber, null, {
        source: 'system_job',
        trigger: needsReceiptSync ? 'receipt_sync' : 'status_query',
      });
    } else if (payment.status === 'Pending' && (mappedStatus === 'Failed' || mappedStatus === 'Cancelled')) {
      payment.status = mappedStatus;
      await payment.save();
      await syncIntentFromPayment(payment, null, { source: 'system_job', trigger: 'status_query' });
    }
  } catch (queryError) {
    console.error('STK Query Error:', queryError.response ? queryError.response.data : queryError.message);
  }

  return payment;
};

const getAccessToken = async (req, res, next) => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY.trim();
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET.trim();
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = `Basic ${Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: auth },
    });
    req.token = response.data.access_token;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Could not generate M-Pesa token' });
  }
};

const initiateSTKPush = async (req, res) => {
  const { phoneNumber, amount, programId } = req.body;
  const token = req.token;
  const timestamp = getTimestamp();
  const shortCode = process.env.MPESA_SHORTCODE.trim();
  const passkey = process.env.MPESA_PASSKEY.trim();
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const callbackURL = process.env.MPESA_CALLBACK_URL?.trim()
    || `${req.protocol}://${req.get('host')}/api/payments/callback`;

  const intentId = generateIntentId();
  const intent = await PaymentIntent.create({
    intentId,
    user: req.user ? req.user._id : null,
    programId: programId || null,
    phoneNumber,
    amount,
    status: 'Initiated',
  });

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackURL,
    AccountReference: 'JaynessCBO',
    TransactionDesc: 'Donation',
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    intent.checkoutRequestID = response.data.CheckoutRequestID;
    intent.status = 'Pending';
    await intent.save();

    await Payment.create({
      user: req.user ? req.user._id : null,
      programId: programId || null,
      phoneNumber,
      amount,
      checkoutRequestID: response.data.CheckoutRequestID,
      intentId,
      paymentIntent: intent._id,
      status: 'Pending',
      source: req.user ? 'authenticated' : 'public',
    });

    await logAudit({
      req,
      action: 'payment.intent.created',
      entityType: 'PaymentIntent',
      entityId: intent._id,
      after: {
        intentId: intent.intentId,
        amount,
        phoneNumber,
        checkoutRequestID: response.data.CheckoutRequestID,
      },
    });

    res.status(200).json({
      message: 'STK Push Initiated successfully',
      intentId,
      data: response.data,
    });
  } catch (error) {
    intent.status = 'Failed';
    intent.mismatchReason = error.message;
    await intent.save();

    await logAudit({
      req,
      action: 'payment.intent.failed',
      entityType: 'PaymentIntent',
      entityId: intent._id,
      metadata: { error: error.message },
      status: 'failure',
    });

    res.status(500).json({ message: 'STK Push Failed', error: error.message });
  }
};

const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback || req.body?.stkCallback;
    if (!callbackData) {
      return res.status(400).json({ message: 'Invalid callback payload' });
    }
    const checkoutRequestID = callbackData.CheckoutRequestID;
    const payment = await Payment.findOne({ checkoutRequestID });

    if (!payment) {
      return res.status(200).json({ message: 'Callback received with unknown checkout request' });
    }

    if (String(callbackData.ResultCode) === '0') {
      let receipt = extractMpesaReceiptCode(callbackData);
      if (!hasUsableReceiptCode(receipt)) {
        try {
          const statusData = await queryStkStatusFromMpesa(checkoutRequestID);
          receipt = extractReceiptFromStatusQuery(statusData) || receipt;
        } catch (statusError) {
          console.error(
            'Callback fallback query failed:',
            statusError.response ? statusError.response.data : statusError.message
          );
        }
      }
      await markPaymentCompleted(payment, receipt, null, {
        source: 'system_job',
        trigger: 'callback',
      });
    } else {
      payment.status = mapMpesaResultCodeToStatus(callbackData.ResultCode);
      await payment.save();
      await syncIntentFromPayment(payment, null, { source: 'system_job', trigger: 'callback' });
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const payment = await Payment.findOne({ checkoutRequestID });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await refreshPendingPaymentStatus(payment, checkoutRequestID);

    const latest = await Payment.findOne({ checkoutRequestID });

    res.status(200).json({
      status: latest.status,
      receipt: latest.mpesaReceiptNumber,
      receiptPending:
        latest.status === 'Completed' && (!latest.mpesaReceiptNumber || latest.mpesaReceiptNumber === 'N/A'),
      reconciliationStatus: latest.reconciliationStatus,
      intentId: latest.intentId,
    });
  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({ message: 'Could not check status' });
  }
};

const getPaymentReceipt = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const payment = await Payment.findOne({ checkoutRequestID });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await refreshPendingPaymentStatus(payment, checkoutRequestID);

    const latest = await Payment.findOne({ checkoutRequestID })
      .populate('user', 'name email')
      .populate('programId', 'title');

    if (!latest || latest.status !== 'Completed') {
      return res.status(400).json({ message: 'Receipt available only after payment confirmation' });
    }

    if (!latest.mpesaReceiptNumber || latest.mpesaReceiptNumber === 'N/A') {
      return res.status(409).json({ message: 'M-Pesa receipt code not recorded yet. Please try again shortly.' });
    }

    res.status(200).json({
      checkoutRequestID: latest.checkoutRequestID,
      intentId: latest.intentId || null,
      receiptNumber: latest.mpesaReceiptNumber,
      amount: latest.amount,
      phoneNumber: latest.phoneNumber,
      transactionDate: latest.transactionDate || latest.updatedAt || latest.createdAt,
      status: latest.status,
      reconciliationStatus: latest.reconciliationStatus,
      payerName: latest.user?.name || 'Anonymous Donor',
      payerEmail: latest.user?.email || null,
      programTitle: latest.programId?.title || 'General Contribution',
      issuedAt: new Date(),
    });
  } catch (error) {
    console.error('Get Receipt Error:', error);
    res.status(500).json({ message: 'Could not generate receipt' });
  }
};

const cancelPendingPayment = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const payment = await Payment.findOne({ checkoutRequestID });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed payment' });
    }

    if (payment.status === 'Failed' || payment.status === 'Cancelled') {
      return res.status(200).json({ message: 'Payment already closed', status: payment.status });
    }

    payment.status = 'Cancelled';
    await payment.save();
    await syncIntentFromPayment(payment, req, { source: 'api', trigger: 'cancel' });

    await logAudit({
      req,
      action: 'payment.cancelled',
      entityType: 'Payment',
      entityId: payment._id,
      after: { status: 'Cancelled' },
    });

    res.status(200).json({ message: 'Payment cancelled', status: payment.status });
  } catch (error) {
    console.error('Cancel Payment Error:', error);
    res.status(500).json({ message: 'Could not cancel payment' });
  }
};

const getMyHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ message: 'Could not fetch history' });
  }
};

const getReconciliationQueue = async (req, res) => {
  try {
    const queue = await PaymentIntent.find({
      reconciliationStatus: { $in: ['Mismatch', 'NeedsReview'] },
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate('user', 'name email')
      .populate('programId', 'title');

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveReconciliationItem = async (req, res) => {
  try {
    const { intentId } = req.params;
    const { reconciliationStatus = 'Matched', resolutionNote = '' } = req.body;

    if (!['Matched', 'Mismatch', 'NeedsReview'].includes(reconciliationStatus)) {
      return res.status(400).json({ message: 'Invalid reconciliation status' });
    }

    const intent = await PaymentIntent.findOne({ intentId });
    if (!intent) {
      return res.status(404).json({ message: 'Payment intent not found' });
    }

    const before = {
      reconciliationStatus: intent.reconciliationStatus,
      mismatchReason: intent.mismatchReason,
      resolutionNote: intent.resolutionNote,
    };

    intent.reconciliationStatus = reconciliationStatus;
    intent.resolutionNote = resolutionNote || null;
    intent.resolvedBy = req.user?._id || null;
    intent.resolvedAt = new Date();
    if (reconciliationStatus === 'Matched') {
      intent.mismatchReason = null;
    }
    await intent.save();

    await Payment.updateMany(
      { $or: [{ intentId: intent.intentId }, { paymentIntent: intent._id }] },
      {
        reconciliationStatus: intent.reconciliationStatus,
        mismatchReason: intent.mismatchReason,
      }
    );

    await logAudit({
      req,
      action: 'payment.reconciliation.resolved',
      entityType: 'PaymentIntent',
      entityId: intent._id,
      before,
      after: {
        reconciliationStatus: intent.reconciliationStatus,
        mismatchReason: intent.mismatchReason,
        resolutionNote: intent.resolutionNote,
      },
    });

    res.json(intent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAccessToken,
  initiateSTKPush,
  mpesaCallback,
  checkPaymentStatus,
  getPaymentReceipt,
  cancelPendingPayment,
  getMyHistory,
  getReconciliationQueue,
  resolveReconciliationItem,
};
