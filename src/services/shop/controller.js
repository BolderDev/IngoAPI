const service = require("@shop-service/service");

async function getDressList(request) {
    return await service.getDressList(request.getUserId(),
                                      parseInt(request.params.typeId),
                                      parseInt(request.query.currency),
                                      parseInt(request.query.pageNo),
                                      parseInt(request.query.pageSize));
}

async function buyDresses(request) {
    let decorationIds = request.query.decorationId;
    if (!Array.isArray(decorationIds)) {
        decorationIds = [decorationIds];
    }

    return await service.buyDresses(request.getUserId(),
                                    decorationIds);
}

async function buyGameProp(request) {
    return await service.buyGameProp(request.getUserId(),
                                     request.query.gameId,
                                     request.query.propsId);
}

async function buyGame(request) {
    return await service.buyGame(request.getUserId(),
                                 request.params.gameId);
}

async function getPagedDressList(request) {
    return await service.getPagedDressList(request.getUserId(),
                                           parseInt(request.params.typeId),
                                           parseInt(request.query.currency),
                                           parseInt(request.query.pageNo),
                                           parseInt(request.query.pageSize));
}

module.exports = [
    {
        "path": "/shop/api/v1/shop/decorations/buy",
        "methods": ["PUT"],
        "functions": [buyDresses]
    },
    {
        "path": "/shop/api/v1/shop/decorations/:typeId",
        "methods": ["GET"],
        "functions": [getDressList]
    },
    {
        "path": "/shop/api/:version/shop/game/props",
        "methods": ["PUT"],
        "functions": [buyGameProp]   
    },
    {
        "path": "/shop/api/v1/pay/game/:gameId",
        "methods": ["PUT"],
        "functions": [buyGame]
    },
    {
        "path": "/shop/api/v1/shop/decorations/pages/:typeId",
        "methods": ["GET"],
        "functions": [getPagedDressList]
    }
]