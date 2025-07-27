const mongooseModel = require("@schemas/model");

module.exports = class GameStatus {
  constructor(userId) {
    this.userId = userId;
    this.status = 0;
    this.gameId = "";
    this.gameName = "";
  }

  static async fromUserId(userId) {
    const row = await mongooseModel.findOne({ modelName: "game_status", userId });
    if (!row) return null;
    const gs = new GameStatus(userId);
    Object.assign(gs, row.toObject());
    return gs;
  }

  async save() {
    await mongooseModel.updateOne(
      { modelName: "game_status", userId: this.userId },
      {
        $set: {
          status: this.status,
          gameId: this.gameId,
          gameName: this.gameName
        },
        modelName: "game_status"
      },
      { upsert: true }
    );
  }

  // Optionally add more methods if needed
};