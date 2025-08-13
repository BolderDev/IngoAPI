const dressing = require("@common/dressing");
const responses = require("@common/responses");
const logger = require("@common/logger");
const discounts = require("@config/discounts");
const Currencies = require("@constants/Currencies");
const DressOwnerTypes = require("@constants/DressOwnerTypes");
const VipLevels = require("@constants/VipLevels");
const DressOptions = require("@models/DressOptions");
const Page = require("@models/Page");
const User = require("@models/User");
const Vip = require("@models/Vip");
const payServiceBase = require("@pay-service/base");
const decorationServiceBase = require("@decoration-service/base");

async function getDressList(userId, categoryId, currencyType, pageNo, pageSize) {
    const userInfo = await User.fromUserId(userId);
    if (!userInfo) return responses.userNotFound();

    const ownedDresses = await decorationServiceBase.getOwnedDresses(userId);

    const dressesData = dressing.getDresses(new DressOptions({
        categoryId: categoryId, 
        currency: currencyType,
        sex: userInfo.sex,
        hideClanDresses: true, 
        hideFreeDresses: true,
        ownerFilter: ownedDresses,
        ownerType: DressOwnerTypes.TAG_ITEM
    }));

    const data = new Page(dressesData, dressesData.length, pageNo, pageSize);
    return responses.success(data);
}

async function buyDresses(userId, decorationIds) {
    const vip = await Vip.fromUserId(userId);
    if (!vip) return responses.userNotFound();

    const purchaseResults = {};
    const purchasedDresses = [];

    for (const decorationId of decorationIds) {
        const dressInfo = dressing.getDressInfo(decorationId);
        if (!dressInfo) {
            purchaseResults[decorationId] = false;
            continue;
        }

        // Discount logic
        let discount = 0;
        const vipLevel = vip.getLevel();
        if (vipLevel === VipLevels.VIP_PLUS) discount = discounts.vipShopDiscount;
        else if (vipLevel === VipLevels.MVP) discount = discounts.mvpShopDiscount;

        const actualPrice = Math.floor(dressInfo.price * (100 - discount) / 100);

        const hasEnough = await payServiceBase.hasEnoughCurrency(userId, dressInfo.currency, actualPrice);
        if (!hasEnough) {
            purchaseResults[decorationId] = false;
            continue;
        }

        const { hasFailed } = await payServiceBase.removeCurrency(userId, dressInfo.currency, actualPrice, 3);
        purchaseResults[decorationId] = !hasFailed;

        if (!hasFailed) {
            // Use dressInfo.id, not decorationId, in case they differ
            purchasedDresses.push(dressInfo.id);
        }
    }

    if (purchasedDresses.length > 0) {
        await decorationServiceBase.addDresses(userId, purchasedDresses);
    }

    return responses.success({
        decorationPurchaseStatus: purchaseResults
    });
}

async function buyGameProp(userId, gameId, propId) {
    logger.warn("BuyGameProp: Implementation needed");
    return responses.innerError();
}

async function buyGame(userId, gameId) {
    logger.warn("BuyGame: Implementation needed");
    return responses.innerError();
}

async function getPagedDressList(userId, categoryId, currencyType, pageNo, pageSize) {
    const userInfo = await User.fromUserId(userId);
    if (!userInfo) return responses.userNotFound();

    const ownedDresses = await decorationServiceBase.getOwnedDresses(userId);

    const dressesData = dressing.getDresses(new DressOptions({
        categoryId: categoryId, 
        currency: currencyType,
        sex: userInfo.sex,
        hideClanDresses: true, 
        hideFreeDresses: true,
        ownerFilter: ownedDresses,
        ownerType: DressOwnerTypes.TAG_ITEM
    }));

    const pagedData = new Page(dressesData, dressesData.length, pageNo, pageSize);

    return responses.success(pagedData);
}

module.exports = {
    getDressList,
    buyDresses,
    buyGameProp,
    buyGame,
    getPagedDressList
};
