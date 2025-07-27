const service = require("@user-service/service");

async function getConfigFile(request) {
    return await service.getConfigFile(request.params.configFile);
}

async function createProfile(request) {
    return await service.createProfile(request.getUserId(), 
                                      request.body.nickName, 
                                      parseInt(request.body.sex));
}

async function changeNickName(request) {
    return await service.changeNickName(request.getUserId(),
                                        request.query.newName);
}

async function isChangingNameFree(request) {
    return await service.isChangingNameFree(request.getUserId());
}

async function setUserInfo(request) {
    return await service.setUserInfo(request.getUserId(),
                                     request.body.picUrl,
                                     request.body.birthday,
                                     request.body.details);
}

async function getUserInfo(request) {
    return await service.getUserInfo(request.getUserId());
}

async function setUserLanguage(request) {
    return await service.setUserLanguage(request.getUserId(),
                                         request.query.language);
}

async function getUserVipInfo(request) {
    return await service.getUserVipInfo(request.getUserId());
}

async function getDailyRewardInfo(request) {
    return await service.getDailyRewardInfo(request.getUserId());
}

async function receiveDailyReward(request) {
    return await service.receiveDailyReward(request.getUserId());
}

async function getDailyTasksAdConfig(request) {
    return await service.getDailyTasksAdConfig(request.getUserId());
}

async function reportUser(request) {
    return await service.reportUser(request.getUserId());
}

async function receiveUserInfoReward(request) {
    return await service.getUserInfoReward(request.getUserId());
}

module.exports = [
    {
        "path": "/config/files/:configFile",
        "methods": ["GET"],
        "functions": [getConfigFile]
    },
    {
        "path": "/user/api/v1/user/register",
        "methods": ["POST"],
        "functions": [createProfile]
    },
    {
        "path": "/user/api/v1/user/nickName",
        "methods": ["PUT"],
        "functions": [changeNickName]
    },
    {
        "path": "/user/api/v1/user/nickName/free",
        "methods": ["GET"],
        "functions": [isChangingNameFree]
    },
    {
        "path": "/user/api/v1/user/info",
        "methods": ["PUT"],
        "functions": [setUserInfo]
    },
    {
        "path": "/user/api/v1/user/details/info",
        "methods": ["POST"],
        "functions": [getUserInfo]
    },
    {
        "path": "/user/api/v1/user/player/info",
        "methods": ["GET"],
        "functions": [getUserVipInfo]
    },
    {
        "path": "/user/api/v2/users/:userId/daily/sign/in",
        "methods": ["GET", "PUT"],
        "functions": [getDailyRewardInfo, receiveDailyReward]
    },
    {
        "path": "/user/api/v1/users/:userId/daily/tasks/ads/config",
        "methods": ["GET"],
        "functions": [getDailyTasksAdConfig]
    },
    {
        "path": "/user/api/v1/report/push",
        "methods": ["POST"],
        "functions": [reportUser]
    },
    {
        "path": "/user/api/v1/user/language",
        "methods": ["POST"],
        "functions": [setUserLanguage]
    },
    {
        "path": "/user/api/v1/users/prefect/info/reward/:userId",
        "methods": ["POST"],
        "functions": [receiveUserInfoReward]
    }
]