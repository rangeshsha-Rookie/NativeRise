// server/src/config/db.js
import mongoose from 'mongoose';
import config from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected');
  } catch (err) {
    console.error(`[Database] MongoDB disconnect error: ${err.message}`);
  }
}

export default {
  connectDB,
  disconnectDB
};
