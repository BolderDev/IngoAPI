const logger = require("@common/logger");
const responses = require("@common/responses");
const recharge = require("@config/recharge");
const firstRechargeConfig = require("@config/firstrecharge");
const Transaction = require("@models/Transaction");
const Wealth = require("@models/Wealth");

async function getUserWealth(userId) {
    const wealth = await Wealth.fromUserId(userId);
    return responses.success(wealth);
}

async function getWealthRecord(userId, pageNo, pageSize) {
    const transactions = await Transaction.fromUserId(userId, pageNo, pageSize);
    return responses.success(transactions);
}

async function getFirstTopUpReward(userId) {
    return responses.success(firstRechargeConfig);
}

async function getTopUpProducts(userId, type) {
    logger.warn("GetTopUpProducts: Implementation needed");
    return responses.success(recharge);
}

async function getVipProducts(userId) {
    logger.warn("GetVipProducts: Implementation needed");
    return responses.innerError();
}

async function getShowThirdPartyPayMethods(userId) {
    return responses.success(false);
}

module.exports = {
    getUserWealth: getUserWealth,
    getWealthRecord: getWealthRecord,
    getFirstTopUpReward: getFirstTopUpReward,
    getTopUpProducts: getTopUpProducts,
    getVipProducts: getVipProducts,
    getShowThirdPartyPayMethods: getShowThirdPartyPayMethods
}