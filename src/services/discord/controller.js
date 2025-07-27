const service = require("@discord-service/service");

async function getDiscordProfile(request) {
    return await service.getDiscordProfile(request.getUserId(),
                                           request.body.tokenType,
                                           request.body.accessToken);
}

async function bindDiscordAccount(request) {
    return await service.bindDiscordAccount(request.getUserId(),
                                            request.body.tokenType,
                                            request.body.accessToken);
}

async function cancelDiscordBinding(request) {
    return await service.cancelDiscordBinding(request.getUserId(),
                                              request.body.accessToken);
}

async function getDiscordBindingStatus(request) {
    return await service.getDiscordBindingStatus(request.getUserId());
}

async function removeDiscordBinding(request) {
    return await service.removeDiscordBinding(request.getUserId());
}

module.exports = [
    {
        "path": "/discord/api/v1/auth/info",
        "methods": ["GET"],
        "functions": [getDiscordProfile]
    },
    {
        "path": "/discord/api/v1/auth/bind",
        "methods": ["POST"],
        "functions": [bindDiscordAccount]
    },
    {
        "path": "/discord/api/v1/auth/cancel",
        "methods": ["POST"],
        "functions": [cancelDiscordBinding]
    },
    {
        "path": "/discord/api/v1/bind/status",
        "methods": ["GET"],
        "functions": [getDiscordBindingStatus]
    },
    {
        "path": "/discord/api/v1/bind/delete",
        "methods": ["DELETE"],
        "functions": [removeDiscordBinding]
    }
]