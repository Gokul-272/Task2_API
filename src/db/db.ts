import "dotenv/config";
import mongoose from "mongoose";
export default async function connectDB() {
  try {
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("mongodb_url exists:", !!process.env.mongodb_url);
    await mongoose.connect(process.env.mongodb_url as string);
    console.log("MongoDB connected:", mongoose.connection.readyState);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}