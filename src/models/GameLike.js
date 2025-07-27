const mongooseModel = require("@schemas/model");

module.exports = class GameLike {
  constructor(userId) {
    this.userId = userId;
    this.games = [];
  }

  static async fromUserId(userId) {
    const data = await mongooseModel.findFirst("game_like", { userId });
    const instance = new GameLike(userId);
    if (data && Array.isArray(data.games)) {
      instance.setGames(data.games);
    }
    return instance;
  }

  response(gameId) {
    return {
      appreciate: this.games.includes(gameId),
    };
  }

  setUserId(userId) {
    this.userId = userId;
  }

  getUserId() {
    return this.userId;
  }

  setGames(games) {
    this.games = games;
  }

  getGames() {
    return this.games;
  }

  async save() {
    await mongooseModel.insertOrUpdate("game_like", { userId: this.userId }, {
      games: this.games
    });
  }

  addGame(gameId) {
    if (!this.games.includes(gameId)) {
      this.games.push(gameId);
    }
  }

  removeGame(gameId) {
    this.games = this.games.filter((id) => id !== gameId);
  }
};