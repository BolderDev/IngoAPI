const model = require("@schemas/model");

class Mail {
  constructor(data = {}) {
    this.id = data.id || 0;
    this.userId = data.userId || null;  // ← Needed to make status/user relationship clear
    this.title = data.title || "";
    this.content = data.content || "";
    this.sendDate = data.sendDate || 0;
    this.status = data.status || 0; // ← Status is now part of the mail itself
    this.type = data.type || 0;
    this.attachment = (data.attachment || []).map(this._parseAttachment);
    this.extra = data.extra || "";
  }

  _parseAttachment(data) {
    return {
      name: data.name || "",
      qty: data.qty || 0,
      icon: data.icon || "",
      itemId: data.itemId || "",
      type: data.type || 0,
      vipLevel: data.vipLevel || 0,
      vipDuration: data.vipDuration || 0
    };
  }

  static async fromId(id, userId) {
    const doc = await model.findOne({ modelName: "Mail", id, userId }).lean();
    return doc ? new Mail(doc) : null;
  }

  static fromJson(json) {
    return new Mail(json);
  }

  async save() {
    await model.insertOrUpdate("Mail", { id: this.id, userId: this.userId }, { ...this });
  }

  // Getters / Setters
  getId() { return this.id; }
  getUserId() { return this.userId; }
  getStatus() { return this.status; }
  getAttachments() { return this.attachment; }
  isUnread() { return this.status === 0; }
  hasAttachments() { return this.attachment.length > 0; }

  setStatus(status) { this.status = status; }
}

module.exports = Mail;
