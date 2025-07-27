const Model = require("@schemas/model");

module.exports = class ClanNotice {
  constructor(clanId) {
    this.clanId = clanId;
    this.content = "";
    this.updateTime = null;
  }

  static fromJson(json) {
    const notice = new ClanNotice(json.clanId);
    notice.content = json.content ?? "";
    notice.updateTime = json.updateTime ?? null;
    return notice;
  }

  toJson() {
    return {
      modelName: "ClanNotice", // required for shared schema design
      clanId: this.clanId,
      content: this.content,
      updateTime: this.updateTime,
    };
  }

  /** @returns {Promise<ClanNotice>} */
  static async fromClanId(clanId) {
    const data = await Model.findFirst("ClanNotice", { clanId });
    return data ? ClanNotice.fromJson(data) : new ClanNotice(clanId);
  }

  async save() {
    await Model.insertOrUpdate("ClanNotice", { clanId: this.clanId }, this.toJson());
  }

  response() {
    return {
      content: this.content
    };
  }

  // --- Getters and Setters ---
  setClanId(clanId) { this.clanId = clanId; }
  getClanId() { return this.clanId; }

  setContent(content) { this.content = content; }
  getContent() { return this.content; }

  setUpdateTime(time) { this.updateTime = time; }
  getUpdateTime() { return this.updateTime; }
};