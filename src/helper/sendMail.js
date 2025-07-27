require("module-alias/register");
const base = require("@mail-service/base");
const mongooseModel = require("@schemas/model");
const mongoose = require('@common/mongoose');

mongoose.init({
  mongoUri: "mongodb+srv://GhostGo:MrGhostBG13@cluster0.k0o7urc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  resetOnInit: false,
});
async function sendMailToUser(userId) {
  const mail = await base.sendMail({
    userId: Number(userId),
    title: "Welcome Beta tester!",
    content: "We’ve give u a gift. Here’s a gift!",
    attachment: [
      { itemId: 2, qty: 50000000, name: "Gold", icon: "", type: 1 },
      { itemId: 1, qty: 50000000, name: "Diamonds", icon: "", type: 1 },
      { name: "VIP", icon: "", vipLevel: 2, vipDuration: 7, type: 3 }
    ],
    type: 1,
    extra: "event:welcome_back"
  });

  console.log(`✅ Mail sent to user ${userId}`);
}

async function sendToAllUsers() {
  const users = await mongooseModel.find({ modelName: 'user' }, { userId: 1 });
  if (!users.length) {
    console.log("❌ No users found.");
    return;
  }

  for (const user of users) {
    try {
      await sendMailToUser(user.userId);
    } catch (err) {
      console.error(`❌ Failed to send mail to user ${user.userId}:`, err.message);
    }
  }

  console.log(`✅ Done! Sent to ${users.length} users.`);
}

async function init(arg) {
  if (!arg) {
    console.error("❌ Missing argument. Usage: node sendMail.js <userId|all>");
    process.exit(1);
  }

  if (arg === "all") {
    await sendToAllUsers();
  } else if (!isNaN(Number(arg))) {
    await sendMailToUser(Number(arg));
  } else {
    console.error("❌ Invalid argument. Use a number or 'all'.");
  }
}

// Run if called directly
if (require.main === module) {
  const arg = process.argv[2];
  init(arg);
}

module.exports = { init };
