const Model = require("@schemas/model");

async function getNextId(type, step, start) {
  const modelName = `nextId.${type}`;

  const result = await Model.findOneAndUpdate(
    { modelName },
    {
      $inc: { "data.value": step },
      $setOnInsert: { "data.value": start }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return result.data.value;
}

module.exports.getNextUserId = () => getNextId("user", 16, 1000);
module.exports.getNextClanId = () => getNextId("clan", 4, 500);
