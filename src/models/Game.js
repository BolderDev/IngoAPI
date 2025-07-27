const mongooseModel = require("@schemas/model");
const Page = require("@models/Page");

module.exports = class Game {
  constructor() {
    this.gameId = "";
    this.gameName = "";
    this.iconUrl = "";
    this.isRecommended = false;
    this.gameTypes = [];
    this.likeCount = 6;
    this.shopEnabled = 0;
    this.rankEnabled = 0;
    this.partyEnabled = 0;
    this.authorId = 0;
    this.creationTime = 0;

    // Extended
    this.onlineNumber = 0;
    this.visitorEnter = 0;
    this.version = 0;
    this.isNewEngine = 0;
    this.isUgcGame = 0;
    this.engineVersion = 0;
    this.publishRegion = "regionALL";
    this.pcVersion = 0;
    this.isVipPrivilegeGame = 0;
    this.engineType = 0;
  }

  static async fromGameId(gameId) {
    const row = await mongooseModel.findOne({ modelName: "game", gameId });
    if (!row) return null;
    const game = new Game();
    Object.assign(game, row.toObject());
    return game;
  }

  static async listGames(pageNo, pageSize) {
    const allGames = await mongooseModel.find({ modelName: "game" }).lean();
    const totalSize = allGames.length;
    const startIndex = Page.getStartIndex(pageNo, pageSize);
    const pageGames = allGames.slice(startIndex, startIndex + pageSize).map(data => {
      const g = new Game();
      Object.assign(g, data);
      return g.response();
    });
    return new Page(pageGames, totalSize, pageNo, pageSize);
  }

  static async listPartyGames() {
    const games = await mongooseModel.find({
      modelName: "game",
      partyEnabled: 1
    }).lean();

    return games.map(data => {
      const g = new Game();
      Object.assign(g, data);
      return g;
    });
  }

  response() {
    return {
      gameId: this.gameId,
      gameTitle: this.gameName,
      gameCoverPic: this.iconUrl,
      gameTypes: this.gameTypes,
      praiseNumber: this.likeCount,
      onlineNumber: this.onlineNumber,
      visitorEnter: this.visitorEnter,
      version: this.version,
      isNewEngine: this.isNewEngine,
      isUgcGame: this.isUgcGame,
      engineVersion: this.engineVersion,
      publishRegion: this.publishRegion,
      pcVersion: this.pcVersion,
      isVipPrivilegeGame: this.isVipPrivilegeGame,
      engineType: this.engineType
    };
  }

  async save() {
    await mongooseModel.updateOne(
      { modelName: "game", gameId: this.gameId },
      {
        $set: {
          gameName: this.gameName,
          iconUrl: this.iconUrl,
          isRecommended: this.isRecommended,
          gameTypes: this.gameTypes,
          likeCount: this.likeCount,
          shopEnabled: this.shopEnabled,
          rankEnabled: this.rankEnabled,
          partyEnabled: this.partyEnabled,
          authorId: this.authorId,
          creationTime: this.creationTime,
          onlineNumber: this.onlineNumber,
          visitorEnter: this.visitorEnter,
          version: this.version,
          isNewEngine: this.isNewEngine,
          isUgcGame: this.isUgcGame,
          engineVersion: this.engineVersion,
          publishRegion: this.publishRegion,
          pcVersion: this.pcVersion,
          isVipPrivilegeGame: this.isVipPrivilegeGame,
          engineType: this.engineType
        },
        modelName: "game"
      },
      { upsert: true }
    );
  }

  async incrementLikeCount() {
    this.likeCount++;
    await this.save();
  }

  async decrementLikeCount() {
    if (this.likeCount > 0) {
      this.likeCount--;
      await this.save();
    }
  }

  // Getters & Setters...
  setGameId(val) { this.gameId = val; }
  getGameId() { return this.gameId; }

  setGameName(val) { this.gameName = val; }
  getGameName() { return this.gameName; }

  setIconUrl(val) { this.iconUrl = val; }
  getIconUrl() { return this.iconUrl; }

  setIsRecommended(val) { this.isRecommended = val; }
  getIsRecommended() { return this.isRecommended; }

  setGameTypes(val) { this.gameTypes = val; }
  getGameTypes() { return this.gameTypes; }

  setLikeCount(val) { this.likeCount = val; }
  getLikeCount() { return this.likeCount; }

  setShopEnabled(val) { this.shopEnabled = val; }
  getShopEnabled() { return this.shopEnabled; }

  setRankEnabled(val) { this.rankEnabled = val; }
  getRankEnabled() { return this.rankEnabled; }

  setPartyEnabled(val) { this.partyEnabled = val; }
  getPartyEnabled() { return this.partyEnabled; }

  setAuthorId(val) { this.authorId = val; }
  getAuthorId() { return this.authorId; }

  setCreationTime(val) { this.creationTime = val; }
  getCreationTime() { return this.creationTime; }
};