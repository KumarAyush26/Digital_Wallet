const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log(`📡 Connecting to configured MongoDB URI...`);
      await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } else {
      try {
        // Try connecting to default localhost mongodb first
        await mongoose.connect('mongodb://127.0.0.1:27017/digital_wallet', {
          serverSelectionTimeoutMS: 2000
        });
        console.log(`✅ Local MongoDB Connected: 127.0.0.1:27017/digital_wallet`);
      } catch (localErr) {
        console.log(`ℹ️ Local MongoDB not reachable. Initializing embedded MongoMemoryServer for zero-friction standalone run...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`✅ Embedded MongoMemoryServer connected successfully at: ${memUri}`);
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB disconnected.');
  } catch (error) {
    console.error('Error disconnecting DB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
