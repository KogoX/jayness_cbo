const axios = require('axios');

// 1. HARDCODED KEYS (To rule out .env issues)
const consumer_key = "0CoocrMm2VLluhGrebK3lJp4vvdx6SvLcAEvsg3a9ScBNuFl"; // From your chat
const consumer_secret = "pgJHjKB44uOT9SoRMMwdlwlOl3kqkh7htcKVzJ99u0oGXUn0lSGJtphSY91d3DoV"; // From your chat

// 2. SANDBOX URLS
const authUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

async function runTest() {
    console.log("🚀 STARTING MPESA DIAGNOSTIC TEST...");
    
    // --- STEP 1: GENERATE TOKEN ---
    let token = "";
    try {
        const auth = 'Basic ' + Buffer.from(consumer_key + ':' + consumer_secret).toString('base64');
        console.log("1️⃣ Attempting to get Token...");
        
        const response = await axios.get(authUrl, {
            headers: { Authorization: auth },
        });
        
        token = response.data.access_token;
        console.log("✅ SUCCESS! Token received:", token.substring(0, 10) + "...");
    } catch (error) {
        console.error("❌ TOKEN FAILED:", error.response ? error.response.data : error.message);
        return;
    }

    // --- STEP 2: SIMULATE STK PUSH ---
    try {
        console.log("2️⃣ Attempting STK Push (using Sandbox Shortcode 174379)...");
        
        const date = new Date();
        const timestamp = date.getFullYear() +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);
            
        const password = Buffer.from("174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp).toString('base64');

        const requestBody = {
            BusinessShortCode: "174379",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: 1,
            PartyA: "254708374149", // Use your phone here
            PartyB: "174379",
            PhoneNumber: "254708374149", // Use your phone here
            CallBackURL: "https://google.com", // Dummy URL just for testing
            AccountReference: "Test",
            TransactionDesc: "Test"
        };

        const pushResponse = await axios.post(stkUrl, requestBody, {
            headers: { Authorization: 'Bearer ' + token }
        });

        console.log("✅ STK PUSH SUCCESS:", pushResponse.data);
    } catch (error) {
        console.error("❌ STK PUSH FAILED:", error.response ? error.response.data : error.message);
    }
}

runTest();