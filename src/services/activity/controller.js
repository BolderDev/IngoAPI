const service = require("@activity-service/service");

async function getSignInActivity(request) {
    return await service.getSignInActivity(request.getUserId());
}

async function getSignInReward(request) {
    return await service.getSignInReward(request.getUserId());
}

async function getActivityList(request) {
    return await service.getActivityList(request.getUserId());
}

async function getActivityTaskList(request) {
    return await service.getActivityTaskList(request.getUserId(),
                                             request.query.titleType);
}

async function getActivityFreeWheelStatus(request) {
    return await service.getActivityFreeWheelStatus(request.getUserId());
}

async function getActivityWheelInfo(request) {
    return await service.getActivityWheelInfo(request.getUserId(),
                                              request.query.type);
}

async function getActivityWheelShopInfo(request) {
    return await service.getActivityWheelShopInfo(request.getUserId(),
                                                  request.query.type);
}

async function playActivityWheel(request) {
    return await service.playActivityWheel(request.getUserId(),
                                           request.query.type,
                                           request.query.isMulti);
}

module.exports = [
    {
        "path": "/activity/api/v1/signIn",
        "methods": ["GET", "POST"],
        "functions": [getSignInActivity, getSignInReward]
    },
    {
        "path": "/activity/api/v1/activity/title",
        "methods": ["GET"],
        "functions": [getActivityList]
    },
    {
        "path": "/activity/api/v1/activity/action",
        "methods": ["GET"],
        "functions": [getActivityTaskList]
    },
    {
        "path": "/activity/api/v1/lucky/turntable/gold/status",
        "methods": ["GET"],
        "functions": [getActivityFreeWheelStatus]
    },
    {
        "path": "/activity/api/v1/lucky/turntable",
        "methods": ["GET", "POST"],
        "functions": [getActivityWheelInfo, playActivityWheel]
    },
    {
        "path": "/activity/api/v1/lucky/turntable/block/reward",
        "methods": ["GET"],
        "functions": [getActivityWheelShopInfo]
    }
]