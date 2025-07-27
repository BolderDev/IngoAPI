const Model = require("@schemas/model");

async function getNextId(type, step, start) {
  const modelName = `nextId.${type}`;

  const result = await Model.findOneAndUpdate(
    { modelName },
    { $inc: { "data.value": step } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (result.data?.value === step) {
    // First time creation, set to start + step
    result.data.value = start + step;
    await result.save();
  }

  return result.data.value;
}

module.exports.getNextUserId = () => getNextId("user", 16, 1000);
module.exports.getNextClanId = () => getNextId("clan", 4, 500);