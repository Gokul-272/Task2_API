import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";
const PORT = process.env.PORT;
async function startServer() {
  try {
      await connectDB();
      app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startServer();