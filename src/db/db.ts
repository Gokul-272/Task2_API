import mongoose from "mongoose";

const MONGO_URI = process.env.mongodb_url;
const connectDB = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("mongodb_url is not defined");
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (mongoose.connection.readyState === 2) {
    return;
  }
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
};

export default connectDB;