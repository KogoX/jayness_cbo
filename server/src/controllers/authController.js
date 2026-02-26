const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto'); 
const sendEmail = require('../utils/sendEmail');

// Helper function to generate a Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // User stays logged in for 30 days
  });
};

const getFrontendBaseUrl = () => {
  const configuredUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://jayness-cbo.vercel.app';
  }

  return 'https://jayness-cbo.vercel.app';
};

const generateEmailVerificationToken = (user) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return rawToken;
};

const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = `${getFrontendBaseUrl()}/verify-email/${rawToken}`;
  const message = `Welcome to Jayness CBO.\n\nPlease verify your email by clicking this link:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`;

  await sendEmail({
    email: user.email,
    subject: 'Verify your Jayness CBO account',
    message,
  });
};

const generateEmailOtp = (user) => {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  user.emailOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
  user.emailOtpExpire = Date.now() + 10 * 60 * 1000;
  return otp;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // 1. Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create the user
    const user = await User.create({
      name,
      email: normalizedEmail,
      // Password hashing is handled by the model pre-save hook.
      password,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // 4. Send back user info and authenticate immediately
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user.id),
        message: 'Account created successfully.',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // 1. Check for user email
    const user = await User.findOne({ email: normalizedEmail });

    // 2. Check if password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash it and save to DB (Security best practice)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3. Set expiration (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 4. Create Reset URL (Frontend URL)
    const resetUrl = `${getFrontendBaseUrl()}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click on the following link to reset your password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Jayness CBO Password Reset',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log("❌ EMAIL ERROR DETAILED:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
const resetPassword = async (req, res) => {
  try {
    // 1. Get token from URL and hash it to match DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // 2. Find user with that token and verify it hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 3. Set new password (hashed by model pre-save hook)
    user.password = req.body.password;

    // 4. Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password Updated Success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:verificationToken
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.verificationToken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend Email Verification
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
  const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    // Keep response generic to avoid account enumeration.
    if (!user) {
      return res.status(200).json({ success: true, message: 'If this account exists, a verification email has been sent.' });
    }

    if (user.isEmailVerified === true) {
      return res.status(200).json({ success: true, message: 'This email is already verified. Please sign in.' });
    }

    const rawVerificationToken = generateEmailVerificationToken(user);
    await user.save();
    await sendVerificationEmail(user, rawVerificationToken);

    return res.status(200).json({ success: true, message: 'Verification email sent. Check your inbox.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Send email OTP for verification (logged-in user)
// @route   POST /api/auth/email-otp
// @access  Private
const sendEmailOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified.' });
    }

    const otp = generateEmailOtp(user);
    await user.save();

    const message = `Your Jayness CBO verification code is: ${otp}\n\nThis code expires in 10 minutes.`;
    await sendEmail({
      email: user.email,
      subject: 'Jayness CBO email verification code',
      message,
    });

    return res.status(200).json({ message: 'Verification code sent.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email OTP (logged-in user)
// @route   POST /api/auth/email-otp/verify
// @access  Private
const verifyEmailOtp = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'OTP is required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        message: 'Email is already verified.',
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      });
    }

    const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');
    const isValid =
      user.emailOtpHash &&
      user.emailOtpExpire &&
      user.emailOtpExpire > Date.now() &&
      user.emailOtpHash === hashedOtp;

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpire = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Email verified successfully.',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  sendEmailOtp,
  verifyEmailOtp,
};
