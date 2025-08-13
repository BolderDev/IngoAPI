// --- Inline Environment Variables ---
process.env.MONGO_URI = "mongodb+srv://shaurya:ballsandtits@cluster0.kmcqt9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

process.env.REDIS_URL = "rediss://default:AbrXAAIjcDE5YzdjZDU1MmQ3NmU0ZWMxYWI1YmI3MDU5Mjk2MGU3NXAxMA@fast-ferret-47831.upstash.io:6379";

// --- Imports ---
require("module-alias/register");
const express = require("express");
const chalk = require("chalk");
const database = require("@common/database");
const dressing = require("@common/dressing");
const redis = require("@common/redis"); // don't remove this
const mongoose = require("@common/mongoose");
const printStartupBanner = require("./helper/printStartupBanner.js");
const config = require("@config/host");

// --- Express app ---
const app = express();
require("./router")(app);

async function startServer() {
  try {
    console.log(chalk.blue("🔄 Initializing services..."));

    // Init Redis & custom DB
    await database.init();
    await dressing.init();
    await redis.init?.(); // in case your redis module has init()

    // Init Mongo
    await mongoose.init({
      mongoUri: process.env.MONGO_URI,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      resetOnInit: false,
    });

    // Start server only after successful init
    const port = process.env.API_PORT || config.apiPort;
    app.listen(port, "0.0.0.0", () => {
      printStartupBanner(port);
      console.log(
        chalk.green.bold(`✅ Server started at http://localhost:${port}`)
      );
    });

    // Graceful shutdown
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error(chalk.red.bold("❌ Startup failed:"), err);
    process.exit(1);
  }
}

async function shutdown() {
  console.log(chalk.yellow("\n⚠️ Shutting down gracefully..."));
  try {
    await mongoose.connection.close();
    if (redis.quit) await redis.quit();
    console.log(chalk.green("✅ Cleanup complete. Exiting."));
    process.exit(0);
  } catch (err) {
    console.error(chalk.red("❌ Error during shutdown:"), err);
    process.exit(1);
  }
}

startServer();
