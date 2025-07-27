const logger = require("@common/logger");
const responses = require("@common/responses");
const groupChatConfig = require("@config/groupchat");
const Page = require("@models/Page");

async function getGroupChatList(userId, pageNo, pageSize) {
    logger.warn("GetGroupChatList: Implementation needed");
    return responses.success(Page.empty());
}

async function getGroupChatPrice(userId) {
    return responses.success(groupChatConfig);
}

module.exports = {
    getGroupChatList: getGroupChatList,
    getGroupChatPrice: getGroupChatPrice
}