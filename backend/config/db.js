const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_connect';
  
  try {
    console.log(`[Database] Connecting to MongoDB: ${uri.replace(/\/\/.*@/, '//<credentials>@')} ...`);
    
    // Set a 3-second connection timeout so server doesn't freeze if local Mongo is stopped
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });

    isConnected = true;
    console.log('✅ [Database] MongoDB connected successfully.');
  } catch (error) {
    isConnected = false;
    console.warn('⚠️  [Database] MongoDB offline or unreachable.');
    console.warn(`    Details: ${error.message}`);
    console.log('💡 [Database] Resilient fallback mode ACTIVE: Reads & Writes will use Local JSON Storage.');
    console.log('    To connect MongoDB, start your local mongod or provide a MongoDB Atlas URI in .env (MONGO_URI).');
  }

  // Monitor connection events
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[Database] MongoDB connection lost. Switched to JSON fallback mode.');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ [Database] MongoDB reconnected.');
  });
}

function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

function getDbStatus() {
  return {
    connected: isMongoConnected(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'none'
  };
}

module.exports = {
  connectDB,
  isMongoConnected,
  getDbStatus
};
