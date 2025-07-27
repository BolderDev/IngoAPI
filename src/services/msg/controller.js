const service = require("@msg-service/service");

async function getGroupChatList(request) {
    return await service.getGroupChatList(request.getUserId(),
                                          parseInt(request.query.pageNo),
                                          parseInt(request.query.pageSize));
}

async function getGroupChatPrice(request) {
    return await service.getGroupChatPrice(request.getUserId());
}

module.exports = [
    {
        "path": "/msg/api/v1/msg/group/chat/list",
        "methods": ["GET"],
        "functions": [getGroupChatList]
    },
    {
        "path" : "/msg/api/v1/group/chat/price",
        "methods": ["GET"],
        "functions": [getGroupChatPrice]
    }
]