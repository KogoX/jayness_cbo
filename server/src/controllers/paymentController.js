const axios = require('axios');
const Payment = require('../models/Payment');
const Program = require('../models/Program'); // <--- IMPORTED PROGRAM MODEL

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

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);

  const shortCode = process.env.MPESA_SHORTCODE.trim();
  const passkey = process.env.MPESA_PASSKEY.trim();
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL.trim(),
    AccountReference: 'JaynessCBO',
    TransactionDesc: 'Monthly Contribution',
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json', 
      },
    });

    console.log("✅ STK PUSH SUCCESS:", response.data);

    // Save transaction WITH programId
    // CRITICAL FIX: Allow user to be null (for public donations)
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
    console.log("📡 CALLBACK RECEIVED:", JSON.stringify(req.body));

    const callbackData = req.body.Body.stkCallback;
    const checkoutRequestID = callbackData.CheckoutRequestID;

    if (callbackData.ResultCode === 0) {
      console.log("✅ Payment Successful!");
      
      const items = callbackData.CallbackMetadata.Item;
      const receipt = items.find(item => item.Name === 'MpesaReceiptNumber').Value;

      const payment = await Payment.findOne({ checkoutRequestID });
      
      if (payment) {
        payment.status = 'Completed';
        payment.mpesaReceiptNumber = receipt;
        payment.transactionDate = new Date();
        await payment.save();
        
        // --- CRITICAL UPDATE: ADD MONEY TO PROGRAM ---
        if (payment.programId) {
          const program = await Program.findById(payment.programId);
          if (program) {
            program.currentRaised += payment.amount;
            await program.save();
            console.log(`🚀 Updated Program Budget: ${program.title} is now Ksh ${program.currentRaised}`);
          }
        }
        // ---------------------------------------------
      }
    } else {
      console.log("❌ Payment Failed/Cancelled");
      const payment = await Payment.findOne({ checkoutRequestID });
      if (payment) {
        payment.status = 'Failed';
        await payment.save();
      }
    }

    res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. Check Payment Status
const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const payment = await Payment.findOne({ checkoutRequestID });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.status(200).json({ 
      status: payment.status,
      receipt: payment.mpesaReceiptNumber 
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    res.status(500).json({ message: "Could not check status" });
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
  getMyHistory 
};