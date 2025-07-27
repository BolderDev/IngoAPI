const service = require("@pay-service/service");

async function getUserWealth(request) {
    return await service.getUserWealth(request.getUserId());
}

async function getWealthRecord(request) {
    return await service.getWealthRecord(request.getUserId(),
                                         parseInt(request.query.pageNo),
                                         parseInt(request.query.pageSize));
}

async function getFirstTopUpReward(request) {
    return await service.getFirstTopUpReward(request.getUserId());
}

async function getTopUpProducts(request) {
    return await service.getTopUpProducts(request.getUserId(),
                                          request.query.type);
}

async function getVipProducts(request) {
    return await service.getVipProducts(request.getUserId());
}

async function getShowThirdPartyPayMethods(request) {
    return await service.getShowThirdPartyPayMethods(request.getUserId());
}

module.exports = [
    {
        "path": "/pay/api/v1/wealth/user",
        "methods": ["GET"],
        "functions": [getUserWealth]
    },
    {
        "path": "/pay/api/v1/wealth/record/users/:userId",
        "methods": ["GET"],
        "functions": [getWealthRecord]
    },
    {
        "path": "/pay/api/v1/first/punch/reward",
        "methods": ["GET"],
        "functions": [getFirstTopUpReward]
    },
    {
        "path": "/pay/api/v1/pay/products",
        "methods": ["GET"],
        "functions": [getTopUpProducts]
    },
    {
        "path": "/pay/api/v1/pay/products/vip",
        "methods": ["GET"],
        "functions": [getVipProducts]
    },
    {
        "path": "/pay/api/v1/pay/payssion/flag",
        "methods": ["GET"],
        "functions": [getShowThirdPartyPayMethods]
    }
]