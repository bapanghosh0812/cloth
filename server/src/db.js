import mongoose from 'mongoose';

// Strip `$`-operators from query filters so request bodies can never inject e.g. { $gt: '' }.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export const connectDB = async (uri) => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
};

export const disconnectDB = () => mongoose.disconnect();
