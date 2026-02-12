const axios = require('axios');
const Payment = require('../models/Payment');
const Program = require('../models/Program'); 

const getTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
};

const getMpesaAccessTokenValue = async () => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY.trim();
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET.trim();
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = 'Basic ' + Buffer.from(consumer_key + ':' + consumer_secret).toString('base64');

  const response = await axios.get(url, {
    headers: { Authorization: auth },
  });

  return response.data.access_token;
};

const markPaymentCompleted = async (payment, receipt = 'N/A') => {
  const wasCompleted = payment.status === 'Completed';

  payment.status = 'Completed';
  payment.mpesaReceiptNumber = receipt;
  payment.transactionDate = new Date();
  await payment.save();

  // Prevent double-adding raised amount when callback/status-query race each other.
  if (!wasCompleted && payment.programId) {
    const program = await Program.findById(payment.programId);
    if (program) {
      program.currentRaised = (program.currentRaised || 0) + payment.amount;
      await program.save();
      console.log(`🚀 Updated Program Budget: ${program.title} is now Ksh ${program.currentRaised}`);
    }
  }
};

const mapMpesaResultCodeToStatus = (resultCode) => {
  const code = String(resultCode);

  if (code === '0') return 'Completed';
  if (code === '1032') return 'Cancelled';
  if (code === '1' || code === '2001') return 'Failed';

  return 'Pending';
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
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

// 1. Middleware to generate M-Pesa Access Token
const getAccessToken = async (req, res, next) => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY.trim();
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET.trim();
  
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = 'Basic ' + Buffer.from(consumer_key + ':' + consumer_secret).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: { Authorization: auth },
    });
    
    console.log("------------------------------------------------");
    console.log("🔑 GENERATED TOKEN:", response.data.access_token.substring(0, 10) + "...");
    console.log("------------------------------------------------");

    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error("❌ TOKEN GENERATION FAILED:", error.response ? error.response.data : error.message);
    res.status(400).json({ message: "Could not generate M-Pesa token" });
  }
};

// 2. Initiate STK Push
const initiateSTKPush = async (req, res) => {
  // Capture programId from the frontend request
  const { phoneNumber, amount, programId } = req.body; 
  const token = req.token;

  const timestamp = getTimestamp();

  const shortCode = process.env.MPESA_SHORTCODE.trim();
  const passkey = process.env.MPESA_PASSKEY.trim();
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  // Ensure Callback URL is your LIVE Render URL
  // Example: https://jayness-cbo.onrender.com/api/payments/callback
  const callbackURL = process.env.MPESA_CALLBACK_URL 
    ? process.env.MPESA_CALLBACK_URL.trim() 
    : 'https://jayness-cbo.onrender.com/api/payments/callback';

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
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json', 
      },
    });

    console.log("✅ STK PUSH SUCCESS:", response.data);

    // Save transaction
    await Payment.create({
      user: req.user ? req.user._id : null, // If logged in, save ID. If not, save null.
      programId: programId || null, 
      phoneNumber,
      amount,
      checkoutRequestID: response.data.CheckoutRequestID,
      status: 'Pending',
    });

    res.status(200).json({ 
      message: "STK Push Initiated successfully", 
      data: response.data 
    });

  } catch (error) {
    console.error("❌ STK PUSH ERROR:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "STK Push Failed", error: error.message });
  }
};

// 3. Handle Callback
const mpesaCallback = async (req, res) => {
  try {
    console.log("📡 CALLBACK RECEIVED");

    const callbackData = req.body.Body.stkCallback;
    const checkoutRequestID = callbackData.CheckoutRequestID;

    // ResultCode 0 means Success
    if (String(callbackData.ResultCode) === '0') {
      console.log("✅ Payment Successful!");
      
      const items = callbackData?.CallbackMetadata?.Item || [];
      // Use optional chaining or find safely just in case metadata is weird
      const receiptItem = items.find(item => item.Name === 'MpesaReceiptNumber');
      const receipt = receiptItem ? receiptItem.Value : 'N/A';

      const payment = await Payment.findOne({ checkoutRequestID });
      
      if (payment) {
        await markPaymentCompleted(payment, receipt);
      }
    } else {
      console.log("❌ Payment Failed/Cancelled (Code " + callbackData.ResultCode + ")");
      const payment = await Payment.findOne({ checkoutRequestID });
      if (payment) {
        payment.status = mapMpesaResultCodeToStatus(callbackData.ResultCode);
        await payment.save();
      }
    }

    res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. Check Payment Status (Frontend Polls This)
const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const payment = await Payment.findOne({ checkoutRequestID });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'Pending') {
      try {
        const mpesaStatus = await queryStkStatusFromMpesa(checkoutRequestID);
        const mappedStatus = mapMpesaResultCodeToStatus(mpesaStatus.ResultCode);

        if (mappedStatus === 'Completed') {
          await markPaymentCompleted(payment, mpesaStatus.MpesaReceiptNumber || payment.mpesaReceiptNumber || 'N/A');
        } else if (mappedStatus === 'Failed' || mappedStatus === 'Cancelled') {
          payment.status = mappedStatus;
          await payment.save();
        }
      } catch (queryError) {
        // Callback may still arrive; keep Pending if query fails/transient.
        console.error('STK Query Error:', queryError.response ? queryError.response.data : queryError.message);
      }
    }

    const latest = await Payment.findOne({ checkoutRequestID });

    res.status(200).json({
      status: latest.status,
      receipt: latest.mpesaReceiptNumber,
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    res.status(500).json({ message: "Could not check status" });
  }
};

// 5. Cancel Pending Payment
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

    res.status(200).json({ message: 'Payment cancelled', status: payment.status });
  } catch (error) {
    console.error('Cancel Payment Error:', error);
    res.status(500).json({ message: 'Could not cancel payment' });
  }
};

// 5. Get My Transaction History
const getMyHistory = async (req, res) => {
  try {
    // Only works if user is logged in
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ message: "Could not fetch history" });
  }
};

module.exports = { 
  getAccessToken, 
  initiateSTKPush, 
  mpesaCallback, 
  checkPaymentStatus, 
  cancelPendingPayment,
  getMyHistory 
};
