import mongoose from 'mongoose';

// Strip `$`-operators from query filters so request bodies can never inject e.g. { $gt: '' }.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

// Reuses an open connection, so serverless invocations (Netlify Functions) don't reconnect each time.
export const connectDB = async (uri, { dbName } = {}) => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, ...(dbName ? { dbName } : {}) });
  return mongoose.connection;
};

export const isDBConnected = () => mongoose.connection.readyState === 1;

export const disconnectDB = () => mongoose.disconnect();
