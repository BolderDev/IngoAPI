require("module-alias/register");
const express = require("express");
const app = express();
require("./router")(app);

const chalk = require("chalk");
const database = require("@common/database");
const dressing = require("@common/dressing");
const redis = require("@common/redis"); // dont remove this
const mongoose = require("@common/mongoose");
const printStartupBanner = require("./helper/printStartupBanner.js");
//redis init
database.init();
dressing.init();

mongoose.init({
  mongoUri: "mongodb+srv://GhostGo:MrGhostBG13@cluster0.k0o7urc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  resetOnInit: false,
});

const config = require("@config/host");

// ✅ server not assigned to a var since it's unused
app.listen(config.apiPort, "0.0.0.0", () => {
  printStartupBanner(config.apiPort);
  console.log(chalk.green.bold(`Server started at http://localhost:${config.apiPort}`));
  console.log('');
});
