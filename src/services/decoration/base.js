const Model = require("@schemas/model");
const dressing = require("@common/dressing");
const User = require("@models/User"); // Make sure this is correct path


async function getUserDecorationDoc(userId) {
  if (!userId) throw new Error("Missing userId");

  const doc = await Model.findOneAndUpdate(
    { modelName: "DecorationUser", userId },
    {
      $setOnInsert: {
        modelName: "DecorationUser",
        userId,
        data: { owned: [], equipped: [] }
      }
    },
    {
      new: true,
      upsert: true
    }
  );

  return doc;
}

/**
 * Gets free dress IDs for a given sex
 */
function getFreeDressIds(sex = 0) {
  const free = [];

  for (let categoryId = 1; categoryId <= 7; categoryId++) {
    const list = dressing.getDresses({
      categoryId,
      sex,
      currency: 0,
      hideFreeDresses: false
    });

    for (const item of list) {
      if (item.currency === 0) {
        free.push(item.id);
      }
    }
  }

  return free;
}

/**
 * Gets the full list of owned dresses (owned + free)
 */
async function getOwnedDresses(userId) {
  const doc = await getUserDecorationDoc(userId);
  const owned = doc.data?.owned || [];

  // 🔥 Get user sex from the User model
  const user = await User.fromUserId(userId);
  const sex = user?.getSex?.() ?? 0;

  const free = getFreeDressIds(sex);
  return Array.from(new Set([...owned, ...free]));
}

/**
 * Gets the currently equipped dresses
 */
async function getEquippedDresses(userId) {
  const doc = await getUserDecorationDoc(userId);
  return doc.data?.equipped || [];
}

/**
 * Adds dresses to the owned list (avoids duplicates)
 */
async function addDresses(userId, dresses) {
  const doc = await getUserDecorationDoc(userId);
  const existing = doc.data?.owned || [];
  const updated = Array.from(new Set([...existing, ...dresses]));

  await Model.updateOne(
    { modelName: "DecorationUser", userId },
    { $set: { "data.owned": updated } }
  );
}



/**
 * Sets the equipped dresses and ensures they're owned
 */
async function setEquippedDresses(userId, equippedDresses) {
  const doc = await getUserDecorationDoc(userId);
  const owned = doc.data?.owned || [];

  const newOwned = equippedDresses.filter(id => !owned.includes(id));
  const updatedOwned = Array.from(new Set([...owned, ...newOwned]));

  await Model.updateOne(
    { modelName: "DecorationUser", userId },
    {
      $set: {
        "data.owned": updatedOwned,
        "data.equipped": equippedDresses
      }
    }
  );
}

module.exports = {
  getOwnedDresses,
  getEquippedDresses,
  addDresses,
  setEquippedDresses
};
