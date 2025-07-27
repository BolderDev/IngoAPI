const mongooseModel = require("@schemas/model");

module.exports = class GameUpdate {
  constructor(gameId) {
    this.gameId = gameId;
    this.version = 0;
    this.content = "";
  }

  static async fromGameId(gameId) {
    const row = await mongooseModel.findOne({ modelName: "game_update", gameId });
    if (!row) return new GameUpdate(gameId);

    const instance = new GameUpdate(gameId);
    instance.version = row.version || 0;
    instance.content = row.content || "";
    return instance;
  }

  response() {
    return {
      count: this.version,
      content: this.content,
    };
  }

  setGameId(gameId) {
    this.gameId = gameId;
  }

  getGameId() {
    return this.gameId;
  }

  setVersion(version) {
    this.version = version;
  }

  getVersion() {
    return this.version;
  }

  setContent(content) {
    this.content = content;
  }

  getContent() {
    return this.content;
  }

  async save() {
    await mongooseModel.updateOne(
      { modelName: "game_update", gameId: this.gameId },
      {
        $set: {
          version: this.version,
          content: this.content
        },
        modelName: "game_update"
      },
      { upsert: true }
    );
  }
};