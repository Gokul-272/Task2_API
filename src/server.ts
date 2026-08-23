import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
      await connectDB();
      const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    process.on("SIGINT", async () => {
      console.log("SIGINT received. Shutting down gracefully...");
      server.close(async () => {
        console.log("HTTP server closed.");
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startServer();