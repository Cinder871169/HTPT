const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB database.
 * Detects if the provided MONGO_URI/MONGODB_URI already contains a database name.
 * If not, cleanly appends 'food_users_db' to keep services isolated.
 */
const connectDB = async () => {
  try {
    const rawURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    let mongoURI = rawURI || "mongodb://localhost:27017/food_users_db";

    if (rawURI) {
      // Remove connection schemes to check for database paths
      const cleanURI = rawURI.replace(/^mongodb(\+srv)?:\/\//, "");

      // Get the host part before query params, and trim trailing slash if present
      let hostPart = cleanURI.split("?")[0];
      if (hostPart.endsWith("/")) {
        hostPart = hostPart.slice(0, -1);
      }

      // If it doesn't contain a path slash, it means no database was specified
      const hasDatabase = hostPart.includes("/");

      if (!hasDatabase) {
        // Append database cleanly depending on query params
        const parts = rawURI.split("?");
        const baseURI = parts[0].endsWith("/") ? parts[0] : `${parts[0]}/`;
        const queryParams = parts[1] ? `?${parts[1]}` : "";
        mongoURI = `${baseURI}food_users_db${queryParams}`;
      }
    }

    const conn = await mongoose.connect(mongoURI);

    logger.info(
      `✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
