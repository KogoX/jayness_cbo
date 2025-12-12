const mongoose = require('mongoose');

const clientOptions = { 
  serverApi: { version: '1', strict: true, deprecationErrors: true } 
};

const connectDB = async () => {
  try {
    // connect using the URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, clientOptions);
    
    // Optional: Send a ping to confirm (like your script did)
    await mongoose.connection.db.admin().command({ ping: 1 });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;