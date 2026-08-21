import "dotenv/config";
import mongoose from "mongoose";
export default async function connectDB() {
  try {
    await mongoose.connect(process.env.mongodb_url as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}