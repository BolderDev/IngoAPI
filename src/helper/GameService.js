const Game = require("@models/Game");

async function init() {

 

  await saveGameFromJson({
    gameId: "g1008",
    gameTitle: "bedwars",
    gameCoverPic: "https://static-hatcoins.vercel.app/gamesimg/bedwar_cover.png",
    praiseNumber: 0,
    gameTypes: ["SIM", "AVG"],
    visitorEnter: 0
  });

 
}
init().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

async function saveGameFromJson(json) {
  const game = new Game();
  game.setGameId(json.gameId);
  game.setGameName(json.gameTitle);
  game.setIconUrl(json.gameCoverPic);
  game.setLikeCount(json.praiseNumber);
  game.setGameTypes(json.gameTypes);
  game.onlineNumber = json.onlineNumber;
  game.visitorEnter = json.visitorEnter;
  game.version = json.version;
  game.isNewEngine = json.isNewEngine;
  game.isUgcGame = json.isUgcGame;
  game.engineVersion = json.engineVersion;
  game.publishRegion = json.publishRegion;
  game.pcVersion = json.pcVersion;
  game.isVipPrivilegeGame = json.isVipPrivilegeGame;
  game.engineType = json.engineType;

  await game.save(); // Save to db as `game.g1008`
}

module.exports = {
init, 
saveGameFromJson
}
