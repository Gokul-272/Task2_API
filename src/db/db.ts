import "dotenv/config";
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export default async function connectDB() {

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  console.log("🔥 Connecting to MongoDB...");
  console.log("mongodb_url exists:", !!process.env.mongodb_url);

  connectionPromise = mongoose
    .connect(process.env.mongodb_url as string)
    .then((connection) => {
      console.log(
        "🔥 MongoDB connected:",
        mongoose.connection.readyState
      );
      return connection;
    })
    .catch((error) => {
      console.error("🔥 MongoDB connection failed:", error);
      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
}