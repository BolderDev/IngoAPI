const Model = require("@schemas/model");
const clanConfig = require("@config/clan");
const ClanRoles = require("@constants/ClanRoles");
const ClanMember = require("@models/ClanMember");
const Page = require("@models/Page");

module.exports = class Clan {
  constructor(clanId, chiefId = null) {
    this.clanId = clanId;
    this.chiefId = chiefId;
    this.name = "";
    this.picUrl = "";
    this.tags = [];
    this.details = "";
    this.experience = 0;
    this.level = 1;
    this.memberCount = 0;
    this.currentCount = 0;
    this.maxCount = 0;
    this.freeVerify = 0;
    this.language = "";
    this.creationTime = Date.now();
  }

  static fromJson(json) {
    const c = new Clan(json.clanId, json.chiefId);
    Object.assign(c, json);
    return c;
  }

  static async fromClanId(clanId) {
    const doc = await Model.findOne({ modelName: "Clan", "data.clanId": clanId });
    return doc ? Clan.fromJson(doc.data) : null;
  }

  static async exists(clanId) {
    const doc = await Model.findOne({ modelName: "Clan", "data.clanId": clanId });
    return !!doc;
  }

  static async search(clanId, query, pageNo, pageSize) {
    const docs = await Model.find({
      modelName: "Clan",
      "data.name": { $regex: `^${query}`, $options: "i" },
      "data.clanId": { $ne: clanId }
    });

    const all = docs.map(d => d.data);
    const totalSize = all.length;
    const startIndex = Page.getStartIndex(pageNo, pageSize);

    const pagedClans = all.slice(startIndex, startIndex + pageSize)
      .map(c => Clan.fromJson(c).response());

    return new Page(pagedClans, totalSize, pageNo, pageSize);
  }

  async addMember(userId, role) {
    const member = new ClanMember(userId);
    member.setClanId(this.clanId);
    member.setRole(role);
    await member.save();

    this.memberCount++;
    await this.save();
  }

  async removeMember(userId) {
    const member = await ClanMember.fromUserId(userId);
    if (!member || member.getClanId() !== this.clanId) return false;

    await member.delete();
    this.memberCount = Math.max(0, this.memberCount - 1);
    await this.save();
    return true;
  }

  async getMembers(onlyAuthorities) {
    const docs = await Model.find({ modelName: "ClanMember", "data.clanId": this.clanId });

    const filtered = docs
      .map(d => d.data)
      .filter(m => {
        const role = typeof m.role === "string" ? parseInt(m.role) : m.role;
        return !onlyAuthorities || role > ClanRoles.MEMBER;
      });

    const result = [];
    for (const m of filtered) {
      const member = ClanMember.fromJson(m);
      const info = await member.getInfo();
      if (info) result.push(info);
    }

    return result;
  }

  async getElderCount() {
    const docs = await Model.find({
      modelName: "ClanMember",
      "data.clanId": this.clanId,
      "data.role": ClanRoles.ELDER
    });
    return docs.length;
  }

  addExperience(experience) {
    this.experience += experience;

    const config = clanConfig.levels[this.level];
    if (config?.upgradeExperience != null && this.experience >= config.upgradeExperience) {
      this.level += 1;
      if (this.level > 9) {
        this.level = 9;
      } else {
        this.experience -= config.upgradeExperience;
      }
    }
  }

  async create() {
    await this.save();
  }

  async save() {
    await Model.findOneAndUpdate(
      { modelName: "Clan", "data.clanId": this.clanId },
      { modelName: "Clan", data: this },
      { upsert: true, new: true }
    );
  }

  async delete() {
    await Model.deleteOne({ modelName: "Clan", "data.clanId": this.clanId });

    const members = await Model.find({ modelName: "ClanMember", "data.clanId": this.clanId });
    for (const m of members) {
      await Model.deleteOne({ modelName: "ClanMember", "data.userId": m.data.userId });
    }
  }

  response(shownMembers) {
    return {
      clanId: this.clanId,
      currentCount: this.memberCount,
      details: this.details,
      experience: this.experience,
      headPic: this.picUrl,
      level: this.level,
      name: this.name,
      maxCount: clanConfig.levels[this.level]?.maxCount || this.maxCount || 0,
      clanMembers: shownMembers,
      tags: this.tags,
      freeVerify: this.freeVerify,
    };
  }

  // ----------- Getters and Setters ------------
  setClanId(clanId) { this.clanId = clanId; }
  getClanId() { return this.clanId; }

  setChiefId(chiefId) { this.chiefId = chiefId; }
  getChiefId() { return this.chiefId; }

  setName(name) { this.name = name; }
  getName() { return this.name; }

  setDetails(details) { this.details = details; }
  getDetails() { return this.details; }

  setExperience(exp) { this.experience = Math.min(exp, 50000000); }
  getExperience() { return this.experience; }

  setProfilePic(picUrl) { this.picUrl = picUrl; }
  getProfilePic() { return this.picUrl; }

  setLevel(level) { this.level = level; }
  getLevel() { return this.level; }

  setTags(tags) { this.tags = tags; }
  getTags() { return this.tags; }

  setVerification(freeVerify) { this.freeVerify = freeVerify; }
  getVerification() { return this.freeVerify; }

  setCreationTime(creationTime) { this.creationTime = creationTime; }
  getCreationTime() { return this.creationTime; }

  setMemberCount(count) { this.memberCount = count; }
  getMemberCount() { return this.memberCount; }

  setCurrentCount(count) { this.currentCount = count; }
  getCurrentCount() { return this.currentCount; }

  setMaxCount(count) { this.maxCount = count; }
  getMaxCount() { return this.maxCount; }
};