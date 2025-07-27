const crypto = require("crypto");
const constants = require("@common/constants");
const database = require("@common/database");
const logger = require("@common/logger");
const responses = require("@common/responses");
const webtoken = require("@common/webtoken");
const hostConfig = require("@config/host");
const authConfig = require("@config/auth");
const Game = require("@models/Game");
const Page = require("@models/Page");
const GameDetail = require("@models/GameDetail");
const GameUpdate = require("@models/GameUpdate");
const GameLike = require("@models/GameLike");
const GameAccount = require("@models/GameAccount");
const MiniGameToken = require("@models/MiniGameToken");

async function getGamesRecommendation(userId, language) {
  const allGames = await db.get('game') || {};
  const recommendedGames = [];

  for (const gameId in allGames) {
    const gameData = allGames[gameId];
    if (gameData.isRecommended) {
      const game = new Game();
      Object.assign(game, gameData);
      recommendedGames.push(game.response());
    }
  }

  return responses.success(recommendedGames);
}

async function getRecentlyPlayedList(userId, language) {
    const gamesData = [];
    return responses.success(gamesData);
}

async function getRecentlyPlayedFriendList(userId, language) {
    logger.warn("GetRecentlyPlayedFriendList: Implementation needed");
    return responses.innerError();
}

async function getGameDetails(userId, gameId, language) {
    const game = await Game.fromGameId(gameId);
    if (game == null) {
        return responses.gameNotExists();
    }
    
    const gameDetail = await GameDetail.fromGameId(gameId);
    const gameLike = await GameLike.fromUserId(userId);
    return responses.success({
        ...game.response(),
        ...gameLike.response(gameId),
        warmUpResponse: gameDetail
    });
}

async function likeGame(userId, gameId) {
    const game = await Game.fromGameId(gameId);
    if (!game) {
        return responses.gameNotExists();
    }
    
    const gameLike = await GameLike.fromUserId(userId);
    const alreadyLiked = gameLike.getGames().includes(gameId);

    if (alreadyLiked) {
        gameLike.removeGame(gameId);
        await game.decrementLikeCount();  // Decrement the game's like count
    } else {
        gameLike.addGame(gameId);
        await game.incrementLikeCount();  // Increment the game's like count
    }
    await gameLike.save();
    return responses.success({ liked: !alreadyLiked });
}

async function getGames(userId, language, pageNo, pageSize) {
    const games = await Game.listGames(pageNo, pageSize);
    return responses.success(games);
}


async function gameAuth(userId, gameId, engineVersion, accessToken) {
    if (!userId || !gameId || isNaN(engineVersion)) {
        return responses.error("Missing or invalid parameters", 400);
    }

    const timestamp = Date.now();
    const gameAccount = await GameAccount.fromUserId(userId);

    if (!gameAccount) {
        return responses.error("Game account not found", 404);
    }

    const currentToken = gameAccount.getAccessToken();
    if (currentToken && currentToken !== accessToken) {
        return responses.error("Invalid access token", 401);
    }

    const dispatchToken = webtoken.create({ gameId });

    gameAccount.setAccessToken(dispatchToken.dbToken);
    gameAccount.setTimestamp(timestamp);
    await gameAccount.save();

    const gameToken = crypto
        .createHash("sha1")
        .update(authConfig.gameSecretKey + userId + timestamp)
        .digest("hex");

    const dispatch = new MiniGameToken({
        token: dispatchToken.userToken,
        signature: gameToken,
        timestamp,
        region: 1001,
        dispUrl: hostConfig.dispHost
    });

    return responses.success(dispatch);
      }
async function gamePartyAuth(userId) {
    logger.warn("GamePartyAuth: Implementation needed");
    return responses.innerError();
}

async function getResourceInfo(gameId, engineVersion, resVersion) {
    logger.warn("GetResourceInfo: Implementation needed");
    return responses.innerError();
}

async function setEngineVersion(userId, engineVersion) {
    logger.warn("SetEngineVersion: Implementation needed");
    return responses.innerError();
}

async function getGameInformation(gameId, language) {
    const gameInfo = Game.getGameById(gameId);
    if (gameInfo == null) {
        return responses.gameNotExists();
    }

    // TODO: Language support

    return responses.success(gameInfo.warmUpResponse);
}

async function getChatRoom(userId, roomName) {
    logger.warn("GetChatRoom: Implementation needed");
    return responses.innerError();
}

async function deleteChatRoom(roomId) {
    logger.warn("DeleteChatRoom: Implementation needed");
    return responses.innerError();
}

async function getGamesRecommendationByType(userId, language, type, pageNo, pageSize) {
    logger.warn("GetGamesRecommendationByType: Implementation needed");
    const gamesData = [];
    return responses.success(new Page(gamesData, gamesData.length, pageNo, pageSize));
}

async function getGameRank(gameId, type, pageNo, pageSize) {
    logger.warn("GetGameRank: Implementation needed");
    return responses.innerError();
}

async function getUserGameRank(userId, gameId, type) {
    logger.warn("GetUserGameRank: Implementation needed");
    return responses.innerError();
}

async function getPartyGames(userId) {
    const partyGames = await Game.listPartyGames();
    return responses.success(partyGames);
}

async function getPartyGameConfig(gameId) {
    logger.warn("GetPartyGameConfig: Implementation needed");
    return responses.innerError();
}

async function getGameTeamMembers(teamId) {
    logger.warn("GetGameTeamMembers: Implementation needed");
    return responses.innerError();
}

async function getGameTurntableInfo(gameId) {
    logger.warn("GetGameTurntableInfo: Implementation needed");
    return responses.innerError();
}

async function getGameTurntableReward(userId, gameId) {
    logger.warn("GetGameTurntableReward: Implementation needed");
    return responses.innerError();
}

async function getGameTurntableRewardName(userId, gameId) {
    logger.warn("GetGameTurntableRewardName: Implementation needed");
    return responses.success();
}

async function getEngineInfo(gameType, engineVersion, resVersion) {
    logger.warn("GetEngineInfo: Implementation needed");
    return responses.success({});
}

async function getGameUpdateInfo(gameId, language, engineVersion) {
    const gameUpdate = await GameUpdate.fromGameId(gameId);
    return responses.success(gameUpdate.response());
}

async function getGameListUpdateInfo(engineVersion, language) {
    logger.warn("GetGameListUpdateInfo: Implementation needed");
    return responses.innerError();
}

async function getNoticeInfo(type) {
    const notice = database.getKey(constants.DB_NOTICES_TABLE, type);
    return responses.success(notice);
}

async function getCommunityGames(pageNo, pageSize) {
    logger.warn("GetCommunityGames: Implementation needed");
    return responses.success(Page.empty());
}

async function getCommunityGamesStatus() {
    logger.warn("GetCommunityGamesStatus: Implementation needed");
    return responses.innerError();
}

module.exports = {
    getGamesRecommendation: getGamesRecommendation,
    getRecentlyPlayedList: getRecentlyPlayedList,
    getRecentlyPlayedFriendList: getRecentlyPlayedFriendList,
    likeGame: likeGame,
    getGames: getGames,
    gameAuth: gameAuth,
    gamePartyAuth: gamePartyAuth,
    getResourceInfo: getResourceInfo,
    setEngineVersion: setEngineVersion,
    getGameDetails: getGameDetails,
    getGameInformation: getGameInformation,
    getChatRoom: getChatRoom,
    deleteChatRoom: deleteChatRoom,
    getGamesRecommendationByType: getGamesRecommendationByType,
    getGameRank: getGameRank,
    getUserGameRank: getUserGameRank,
    getPartyGames: getPartyGames,
    getPartyGameConfig: getPartyGameConfig,
    getGameTeamMembers: getGameTeamMembers,
    getGameTurntableInfo: getGameTurntableInfo,
    getGameTurntableReward: getGameTurntableReward,
    getGameTurntableRewardName: getGameTurntableRewardName,
    getEngineInfo: getEngineInfo,
    getGameUpdateInfo: getGameUpdateInfo,
    getGameListUpdateInfo: getGameListUpdateInfo,
    getNoticeInfo: getNoticeInfo,
    getCommunityGames: getCommunityGames,
    getCommunityGamesStatus: getCommunityGamesStatus
}
