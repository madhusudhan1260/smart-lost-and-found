// Connects Mongoose to MongoDB once, and logs the connection state.
import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

// 1 = connected (used by GET /api/health)
export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
