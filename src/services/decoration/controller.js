const service = require("@decoration-service/service");

async function getDressListByType(request) {
    return await service.getDressListByType(request.getUserId(),
                                            parseInt(request.params.typeId),
                                            parseInt(request.query.pageNo),
                                            parseInt(request.query.pageSize));
}

async function getEquippedDresses(request) {
    return await service.getEquippedDresses(request.getUserId());
}

async function getOtherEquippedDresses(request) {
    return await service.getEquippedDresses(parseInt(request.params.otherId));
}

async function useDress(request) {
    return await service.useDress(request.getUserId(),
                                  parseInt(request.params.decorationId));
}

async function removeDress(request) {
    return await service.removeDress(request.getUserId(),
                                     parseInt(request.params.decorationId));
}

module.exports = [
    {
        "path": "/decoration/api/v1/decorations/using",
        "methods": ["GET"],
        "functions": [getEquippedDresses]
    },
    {
        "path": "/decoration/api/v:version/decorations/:typeId",
        "methods": ["GET"],
        "functions": [getDressListByType]
    },
    {
        "path": "/decoration/api/v1/decorations/:otherId/using",
        "methods": ["GET"],
        "functions": [getOtherEquippedDresses]
    },
    {
        "path": "/decoration/api/v1/decorations/using/:decorationId",
        "methods": ["PUT", "DELETE"],
        "functions": [useDress, removeDress]
    }
]