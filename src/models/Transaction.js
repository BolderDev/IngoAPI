const Model = require("@schemas/model");
const Page = require("@models/Page");

module.exports = class Transaction {
  constructor(data = {}) {
    this.userId = data.userId ?? 0;
    this.created = data.created ?? "";
    this.currency = data.currency ?? 0;
    this.inoutType = data.inoutType ?? 0;
    this.orderId = data.orderId ?? "";
    this.qty = data.quantity ?? 0;
    this.status = data.status ?? 0;
    this.transactionType = data.transactionType ?? 0;
  }

  static fromJson(json) {
    return new Transaction(json);
  }

  toJson() {
    return {
      userId: this.userId,
      created: this.created,
      currency: this.currency,
      inoutType: this.inoutType,
      orderId: this.orderId,
      quantity: this.qty,
      status: this.status,
      transactionType: this.transactionType
    };
  }

  static async fromUserId(userId, pageNo, pageSize) {
    const totalSize = await Model.countDocuments({
      modelName: "wealth_record",
      userId: String(userId)
    });

    const startIndex = Page.getStartIndex(pageNo, pageSize);

    const docs = await Model.find({
      modelName: "wealth_record",
      userId: String(userId)
    })
      .sort({ "data.created": -1 })
      .skip(startIndex)
      .limit(pageSize);

    const items = docs.map(doc => Transaction.fromJson(doc.data));
    return new Page(items, totalSize, pageNo, pageSize);
  }

  async save() {
    await Model.create({
      modelName: "wealth_record",
      userId: String(this.userId),
      data: this.toJson()
    });
  }
};