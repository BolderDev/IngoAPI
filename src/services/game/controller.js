const responses = require("@common/responses");
const NoticeTypes = require("@constants/NoticeTypes");
const service = require("@game-service/service");

async function getGamesRecommendation(request) {
    return await service.getGamesRecommendation(request.getUserId(),
                                                request.headers["language"]);
}

async function getRecentlyPlayedList(request) {
    return await service.getRecentlyPlayedList(request.getUserId(),
                                               request.headers["language"]);
}

async function getRecentlyPlayedFriendList(request) {
    return await service.getRecentlyPlayedFriendList(request.getUserId(),
                                                     request.headers["language"]);
}

async function likeGame(request) {
    return await service.likeGame(request.getUserId(),
                                  request.params.gameId);
}

async function getGames(request) {
    // TODO: Add more available parameters as needed
    return await service.getGames(request.getUserId(),
                                  request.headers["language"],
                                  parseInt(request.query.pageNo),
                                  parseInt(request.query.pageSize));
}


async function gameAuth(request) {
    const userId = request.getUserId();
    const gameId = request.query.typeId;
    const engineVersion = parseInt(request.query.gameVersion);
    const accessToken = request.headers["access-token"];

    return await service.gameAuth(userId, gameId, engineVersion, accessToken);
}


async function gamePartyAuth(request) {
    return await service.gamePartyAuth(request.getUserId());
}

async function getResourceInfo(request) {
    return await service.getResourceInfo(request.query.gameType,
                                         parseInt(request.query.engineVersion),
                                         parseInt(request.query.resVersion));
}

async function setEngineVersion(request) {
    return await service.setEngineVersion(request.getUserId(),
                                          parseInt(request.query.engineVersion));
}

async function getGameDetails(request) {
    return await service.getGameDetails(request.getUserId(),
                                        request.params.gameId,
                                        request.headers["language"]);
}

async function getGameInformation(request) {
    return await service.getGameInformation(request.params.gameId,
                                            request.params.language);
}

async function getChatRoom(request) {
    return await service.getChatRoom(request.getUserId(),
                                     request.query.roomName);
}

async function deleteChatRoom(request) {
    return await service.deleteChatRoom(request.query.roomId);
}

async function getGamesRecommendationByType(request) {
    return await service.getGamesRecommendationByType(request.getUserId(),
                                                      request.headers["language"],
                                                      request.query.type,
                                                      parseInt(request.query.pageNo),
                                                      parseInt(request.query.pageSize));
}

async function getGameRank(request) {
    return await service.getGameRank(request.params.gameId,
                                     request.query.type,
                                     parseInt(request.query.pageNo),
                                     parseInt(request.query.pageSize));
}

async function getUserGameRank(request) {
    return await service.getUserGameRank(request.getUserId(),
                                         request.params.gameId,
                                         request.query.type);
}

async function getPartyGames(request) {
    return await service.getPartyGames(request.getUserId());
}

async function getPartyGameConfig(request) {
    return await service.getPartyGameConfig(request.params.gameId);
}

async function getGameTeamMembers(request) {
    return await service.getGameTeamMembers(request.params.teamId);
}

async function getGameTurntableInfo(request) {
    return await service.getGameTurntableInfo(request.params.gameId);
}

async function getGameTurntableReward(request) {
    return await service.getGameTurntableInfo(request.getUserId(),
                                              request.params.gameId);
}

async function getGameTurntableRewardName(request) {
    return await service.getGameTurntableRewardName(request.getUserId(),
                                                    request.params.gameId);
}

async function getEngineInfo(request) {
    return await service.getEngineInfo(request.query.gameType,
                                       parseInt(request.query.engineVersion),
                                       parseInt(request.query.resVersion));
}

async function getGameUpdateInfo(request) {
    return await service.getGameUpdateInfo(request.params.gameId,
                                           request.headers["language"],
                                           parseInt(request.query.engineVersion));
}

async function getGameListUpdateInfo(request) {
    return await service.getGameListUpdateInfo(request.query.oldEngineVersion,
                                               request.headers["language"]);
}

async function getAnnouncementInfo(request) {
    return await service.getNoticeInfo(NoticeTypes.ANNOUNCEMENT);
}

async function getStopAnnouncementInfo(request) {
    return await service.getNoticeInfo(NoticeTypes.MAINTENANCE);
}

async function getCommunityGames(request) {
    return await service.getCommunityGames(parseInt(request.query.pageNo),
                                           parseInt(request.query.pageSize));
}

async function getCommunityGamesStatus(request) {
    return await service.getCommunityGamesStatus();
}

module.exports = [
    {
        "path": "/game/api/v2/games/recommendation", 
        "methods": ["GET"],
        "functions": [getGamesRecommendation]
    },
    {
        "path": "/game/api/v1/games/playlist/recently",
        "methods": ["GET"],
        "functions": [getRecentlyPlayedList]
    },
    {
        "path": "/game/api/v1/games/playlist/friends",
        "methods": ["GET"],
        "functions": [getRecentlyPlayedFriendList]
    },
    {
        "path": "/game/api/v1/games/:gameId/appreciation",
        "methods": ["PUT"],
        "functions": [likeGame]
    },
    {
        "path": "/game/api/v1/games",
        "methods": ["GET"],
        "functions": [getGames]
    },
    {
        "path": "/game/api/v2/game/auth",
        "methods": ["GET"],
        "functions": [gameAuth]
    },
    {
        "path": "/game/api/v1/party/auth",
        "methods": ["GET"],
        "functions": [gamePartyAuth]
    },

    {
        "path": "/game/api/v1/games/resource/version",
        "methods": ["GET"],
        "functions": [getResourceInfo]
    },
    {
        "path": "/game/api/v1/games/engine",
        "methods": ["PUT"],
        "functions": [setEngineVersion]
    },
    {
        "path": "/game/api/v2/games/:gameId",
        "methods": ["GET"],
        "functions": [getGameDetails]
    },
    {
        "path": "/game/api/v1/games/warmup/:gameId/languages/:language",
        "methods": ["GET"],
        "functions": [getGameInformation]
    },
    {
        "path": "/game/api/v1/game/chat/room",
        "methods": ["POST", "DELETE"],
        "functions": [getChatRoom, deleteChatRoom]
    },
    {
        "path": "/game/api/v2/games/recommendation/type",
        "methods": ["GET"],
        "functions": [getGamesRecommendationByType]
    },
    {
        "path": "/game/api/v1/games/:gameId/rank",
        "methods": ["GET"],
        "functions": [getGameRank]
    },
    {
        "path": "/game/api/v1/games/:gameId/uses/rank",
        "methods": ["GET"],
        "functions": [getUserGameRank]
    },
    {
        "path": "/game/api/v1/games/all/open/party",
        "methods": ["GET"],
        "functions": [getPartyGames]
    },
    {
        "path": "/game/api/v1/games/config/app/:gameId",
        "methods": ["GET"],
        "functions": [getPartyGameConfig]
    },
    {
        "path": "/game/api/v1/games/team/member/:teamId",
        "methods": ["GET"],
        "functions": [getGameTeamMembers]
    },
    {
        "path": "/game/api/v1/game/:gameId/turntable",
        "methods": ["GET", "PUT"],
        "functions": [getGameTurntableInfo, getGameTurntableReward] 
    },
    {
        "path": "/game/api/v1/game/:gameId/turntable/props",
        "methods": ["GET"],
        "functions": [getGameTurntableRewardName]
    },
    {
        "path": "/game/api/v1/games/app-engine/upgrade",
        "methods": ["GET"],
        "functions": [getEngineInfo]
    },
    {
        "path": "/game/api/v1/games/update/tip/info/app/:gameId",
        "methods": ["GET"],
        "functions": [getGameUpdateInfo]
    },
    {
        "path": "/game/api/v1/games/update/list/:userId",
        "methods": ["GET"],
        "functions": [getGameListUpdateInfo]
    },
    {
        "path": "/game/api/v1/games/announcement/info",
        "methods": ["GET"],
        "functions": [getAnnouncementInfo]
    },
    {
        "path": "/game/api/v1/games/stop/announcement/info",
        "methods": ["GET"],
        "functions": [getStopAnnouncementInfo]
    },
    {
        "path": "/game/api/v1/games/ugc",
        "methods": ["GET"],
        "functions": [getCommunityGames]
    },
    {
        "path": "/game/api/v1/games/ugc/status",
        "methods": ["GET"],
        "functions": [getCommunityGamesStatus]
    }
]
