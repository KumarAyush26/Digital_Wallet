const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      // Accept both MONGO_URI (Vercel) and MONGODB_URI env var names
      let uri = process.env.MONGO_URI || process.env.MONGODB_URI;
      const isProduction = process.env.NODE_ENV === 'production';

      if (uri && uri.trim() !== '') {
        console.log(`📡 Connecting to configured MongoDB URI...`);
        await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose.connection;
      } else if (isProduction) {
        throw new Error('MONGO_URI is required in production. Set it in Vercel environment variables.');
      } else {
        try {
          await mongoose.connect('mongodb://127.0.0.1:27017/digital_wallet', {
            serverSelectionTimeoutMS: 2000
          });
          console.log(`✅ Local MongoDB Connected: 127.0.0.1:27017/digital_wallet`);
          return mongoose.connection;
        } catch (localErr) {
          console.log(`ℹ️ Local MongoDB not reachable. Initializing embedded MongoMemoryServer...`);
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongod = await MongoMemoryServer.create();
          const memUri = mongod.getUri();
          await mongoose.connect(memUri);
          console.log(`✅ Embedded MongoMemoryServer connected at: ${memUri}`);
          return mongoose.connection;
        }
      }
    } catch (error) {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
      throw error;
    }
  })();

  return cachedPromise;
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
