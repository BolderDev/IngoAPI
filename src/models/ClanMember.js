const Model = require("@schemas/model");
const ClanRoles = require("@constants/ClanRoles");
const User = require("@models/User");
const Vip = require("@models/Vip");

module.exports = class ClanMember {
  constructor(userId) {
    this.userId = userId;
    this.clanId = 0;
    this.role = ClanRoles.INVALID;
    this.experience = 0;
    this.currentGold = 0;
    this.currentDiamond = 0;
    this.lastDonationDate = null;
  }

  static fromJson(json) {
    const m = new ClanMember(json.userId);
    Object.assign(m, json);
    return m;
  }

  toJson() {
    return {
      userId: this.userId,
      clanId: this.clanId,
      role: this.role,
      experience: this.experience,
      currentGold: this.currentGold,
      currentDiamond: this.currentDiamond,
      lastDonationDate: this.lastDonationDate,
    };
  }

  static async fromUserId(userId) {
    const doc = await Model.findOne({ modelName: "ClanMember", "data.userId": userId });
    return doc ? ClanMember.fromJson(doc.data) : new ClanMember(userId);
  }

  async getInfo() {
    if (!this.clanId) return null;

    const user = await User.fromUserId(this.userId);
    const vip = await Vip.fromUserId(this.userId);

    return {
      userId: this.userId,
      clanId: this.clanId,
      role: this.role,
      experience: this.experience,
      currentGold: this.currentGold,
      currentDiamond: this.currentDiamond,
      lastDonationDate: this.lastDonationDate,
      expireDate: vip.getExpireDate(),
      headPic: user.getProfilePic(),
      nickName: user.getNickname(),
      vip: vip.getLevel(),
    };
  }

  addExperience(exp) {
    this.experience += exp;
  }

  async save() {
    await Model.findOneAndUpdate(
      { modelName: "ClanMember", "data.userId": this.userId },
      {
        modelName: "ClanMember",
        data: this.toJson(),
      },
      { upsert: true, new: true }
    );
  }

  async delete() {
    await Model.deleteOne({ modelName: "ClanMember", "data.userId": this.userId });
  }

  response() {
    return {
      userId: this.userId,
      clanId: this.clanId,
      role: this.role,
    };
  }

  // ----- Getters & Setters -----
  setUserId(userId) { this.userId = userId; }
  getUserId() { return this.userId; }

  setClanId(clanId) { this.clanId = clanId; }
  getClanId() { return this.clanId; }

  setRole(role) { this.role = role; }
  getRole() { return this.role; }

  setExperience(exp) { this.experience = exp; }
  getExperience() { return this.experience; }

  setCurrentGold(gold) { this.currentGold = gold; }
  getCurrentGold() { return this.currentGold; }

  setCurrentDiamond(diamond) { this.currentDiamond = diamond; }
  getCurrentDiamond() { return this.currentDiamond; }

  setLastDonationDate(date) { this.lastDonationDate = date instanceof Date ? date : new Date(date); }
  getLastDonationDate() { return this.lastDonationDate; }
};