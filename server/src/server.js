const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const path = require('path');
const requestContext = require('./middleware/requestContext');
const { startReminderJobs } = require('./services/reminderService');

// Load env vars
dotenv.config();

// Connect to Database using Mongoose
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',            // Local Development
    'http://localhost:5000',            // Local Server
    'https://jayness-cbo.vercel.app'    // Production Frontend (NO trailing slash!)
  ],
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestContext);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/beneficiaries', require('./routes/beneficiaryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/impact', require('./routes/impactRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- STATIC FOLDER PATH ---
// Points to 'server/uploads' (Go up one level from 'src')
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Basic Route to Test
app.get('/', (req, res) => {
  res.send('Jayness CBO API is running...');
});

const PORT = process.env.PORT || 5000;
startReminderJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
