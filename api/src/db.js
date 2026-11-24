import mongoose from 'mongoose';

export function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/remittance_tracker';
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}
