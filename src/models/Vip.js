const Model = require("@schemas/model");

module.exports = class Vip {
  constructor(userId) {
    this.userId = userId;
    this.vip = 0;
    this.expireDate = 0;
  }

  /** @returns {Vip} */
  static fromJson(json) {
    const vip = new Vip(json.userId);
    vip.vip = json.vip ?? 0;
    vip.expireDate = json.expireDate ?? 0;
    return vip;
  }

  /** @returns {Promise<Vip>} */
  static async fromUserId(userId) {
    const doc = await Model.findOne({ modelName: "Vip", userId }).lean();
    return doc ? Vip.fromJson(doc) : new Vip(userId);
  }

  async create() {
    const existing = await Model.exists({ modelName: "Vip", userId: this.userId });
    if (!existing) {
      await Model.create({
        modelName: "Vip",
        userId: this.userId,
        vip: this.vip,
        expireDate: this.expireDate
      });
    }
  }

  async save() {
    await Model.updateOne(
      { modelName: "Vip", userId: this.userId },
      {
        $set: {
          vip: this.vip,
          expireDate: this.expireDate
        }
      },
      { upsert: true }
    );
  }

  toJson() {
    return {
      userId: this.userId,
      vip: this.vip,
      expireDate: this.expireDate
    };
  }

  response() {
    return {
      vip: this.vip,
      expireDate: this.expireDate
    };
  }

  setUserId(userId) {
    this.userId = userId;
  }

  getUserId() {
    return this.userId;
  }

  setLevel(vip) {
    this.vip = vip;
  }

  getLevel() {
    return this.vip;
  }

  setExpireDate(expireDate) {
    this.expireDate = expireDate;
  }

  getExpireDate() {
    return this.expireDate;
  }
};