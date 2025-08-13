const Model = require("@schemas/model");
const clanConfig = require("@config/clan");
const ClanRoles = require("@constants/ClanRoles");
const ClanMember = require("@models/ClanMember");
const Page = require("@models/Page");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    const c = new Clan(json?.clanId ?? null, json?.chiefId ?? null);
    Object.assign(c, { ...c, ...json }); // keep defaults if missing
    return c;
  }

  static async fromClanId(clanId) {
    const doc = await Model.findOne({ modelName: "Clan", "data.clanId": clanId });
    return doc ? Clan.fromJson(doc.data) : null;
  }

  static async exists(clanId) {
    return !!(await Model.findOne({ modelName: "Clan", "data.clanId": clanId }));
  }

  static async search(clanId, query, pageNo, pageSize) {
    const safeQuery = escapeRegex(query);
    const docs = await Model.find({
      modelName: "Clan",
      "data.name": { $regex: `^${safeQuery}`, $options: "i" },
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
      const exists = await ClanMember.fromUserId(userId);

      // If they’re in another clan, remove them first
      if (exists && exists.getClanId() !== this.clanId) {
        await exists.delete();
      } else if (exists && exists.getClanId() === this.clanId) {
        return; // already in this clan
      }

      const member = new ClanMember(userId);
      member.setClanId(this.clanId);
      member.setRole(role);

      // Add all required display fields
      member.setExperience(0);
      member.setCurrentGold(0);
      member.setCurrentDiamond(0);
      member.setLastDonationDate(null);
      member.setNickName(await this.fetchUserName(userId)); // fetch from user service
      member.setProfilePic(await this.fetchUserPic(userId));

      await member.save();

      this.memberCount++;
      await this.save();
    }

  async removeMember(userId) {
    const member = await ClanMember.fromUserId(userId);
    if (!member || member.getClanId() !== this.clanId) return false;

    await member.delete();
    this.memberCount = Math.max(0, this.memberCount - 1);
    this.currentCount = Math.max(0, this.currentCount - 1);
    await this.save();
    return true;
  }

  async getMembers(onlyAuthorities = false) {
    const docs = await Model.find({ modelName: "ClanMember", "data.clanId": this.clanId });

    const filtered = docs
      .map(d => d.data)
      .filter(m => {
        const role = typeof m.role === "string" ? parseInt(m.role) : m.role;
        return !onlyAuthorities || role > ClanRoles.MEMBER;
      });

    // Ensure every member has at least basic info
    const members = await Promise.all(
      filtered.map(async (m) => {
        try {
          const cm = ClanMember.fromJson(m);
          const info = await cm.getInfo();
          return info || { userId: m.userId, role: m.role, nickName: m.nickName || "Unknown" };
        } catch (err) {
          return { userId: m.userId, role: m.role, nickName: "Unknown" };
        }
      })
    );

    return members;
  }

  async getElderCount() {
    const docs = await Model.find({
      modelName: "ClanMember",
      "data.clanId": this.clanId,
      "data.role": ClanRoles.ELDER
    });
    return docs.length;
  }

  addExperience(exp) {
    this.experience += exp;

    while (true) {
      const config = clanConfig.levels[this.level];
      if (config?.upgradeExperience != null && this.experience >= config.upgradeExperience) {
        this.level = Math.min(this.level + 1, 9);
        if (this.level < 9) {
          this.experience -= config.upgradeExperience;
        } else {
          this.experience = Math.min(this.experience, clanConfig.levels[9]?.upgradeExperience ?? this.experience);
          break;
        }
      } else break;
    }
  }

  async create() {
    await this.save();
  }

  async save() {
    const plainData = JSON.parse(JSON.stringify(this));
    await Model.findOneAndUpdate(
      { modelName: "Clan", "data.clanId": this.clanId },
      { modelName: "Clan", data: plainData },
      { upsert: true, new: true }
    );
  }

  async delete() {
    await Model.deleteOne({ modelName: "Clan", "data.clanId": this.clanId });
    await Model.deleteMany({ modelName: "ClanMember", "data.clanId": this.clanId });
  }

  async logAction(action, userId) {
    // Optional audit log for clan actions
    await Model.create({
      modelName: "ClanLog",
      data: {
        clanId: this.clanId,
        action,
        userId,
        timestamp: Date.now()
      }
    });
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
