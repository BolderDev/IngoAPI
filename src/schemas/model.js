const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  userId: { type: String, index: true },
  email: String,
  password: String,
  creationTime: Number,
  accessToken: String,
  loginTime: Number,
  code: String,
  expires: Number,
  bindType: Number,
  data: mongoose.Schema.Types.Mixed
}, { strict: false });

const Model = mongoose.model('Model', modelSchema);

// ---- InsertOrUpdate Support ----
async function insertOrUpdate(modelName, filter, update) {
  return Model.findOneAndUpdate(
    { modelName, ...filter },
    { $set: update, modelName },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function findFirst(modelName, query) {
  return Model.findOne({ modelName, ...query }).lean();
}

module.exports = Object.assign(Model, {
  insertOrUpdate,
  findFirst
});