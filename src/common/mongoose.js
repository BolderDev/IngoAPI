const mongoose = require('mongoose');
const logger = require('@common/logger');

let isConnected = false;
let currentUri = null;

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function init({ mongoUri, options = defaultOptions, resetOnInit = false } = {}) {
  // Use the provided mongoUri or fallback to the environment variable
  mongoUri = mongoUri || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MongoDB URI must be provided either as a parameter or via process.env.MONGO_URI');
  }
  
  // Prevent re-connection if already connected with the same URI
  if (isConnected && currentUri === mongoUri) return;

  try {
    await mongoose.connect(mongoUri, options);
    isConnected = true;
    currentUri = mongoUri;
    logger.info(`✅ Connected to MongoDB: ${mongoUri}`);

    if (resetOnInit) {
      await reset();
    }
  } catch (error) {
    isConnected = false;
    logger.error("❌ MongoDB connection error:", error);
  }
}

async function reset() {
  logger.warn("⚠️ Resetting MongoDB: Dropping all collections...");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  for (const { name } of collections) {
    logger.warn(`🗑 Dropping: ${name}`);
    await db.dropCollection(name);
  }

  logger.info("✅ MongoDB reset complete.");
}

module.exports = {
  init,
  reset,
  mongoose,
};