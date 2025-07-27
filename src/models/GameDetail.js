const mongooseModel = require("@schemas/model");

module.exports = class GameDetail {
  constructor() {
    this.gameId = "";
    this.bannerUrl = "";
    this.gameDetail = "";
    this.featuredPlay = [];
  }

  static async fromGameId(gameId) {
    const data = await mongooseModel.findFirst("game_detail", { gameId });
    if (!data) return null;

    const instance = new GameDetail();
    instance.gameId = data.gameId || "";
    instance.bannerUrl = data.bannerUrl || "";
    instance.gameDetail = data.gameDetail || "";
    instance.featuredPlay = data.featuredPlay || [];
    return instance;
  }

  async save() {
    await mongooseModel.insertOrUpdate("game_detail", { gameId: this.gameId }, {
      gameId: this.gameId,
      bannerUrl: this.bannerUrl,
      gameDetail: this.gameDetail,
      featuredPlay: this.featuredPlay
    });
  }
};