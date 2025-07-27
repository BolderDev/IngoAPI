const constants = require("@common/constants");
const logger = require("@common/logger");
const responses = require("@common/responses");
const luckyWheelConfig = require("@config/luckywheel");
const allWheelConfig = require("@config//luckyconfig");
const allWheelRewardsConfig = require("@config/rewards");
const allWheelShopConfig = require("@config/luckyshop");
const mongooseModel = require("@schemas/model");
const payServiceBase = require("@pay-service/base");
const decorationServiceBase = require("@decoration-service/base");
const Currencies = require("@constants/Currencies");
const actionsConfig = require("@config/action");
const Activity = require("@models/Activity");
const User = require("@models/User");
const ActivityManager = require("@activity-service/base");
const WheelTypes = require("@constants/WheelTypes");
const userServiceBase = require("@user-service/base");
const RewardTypes = require("@constants/RewardTypes");
const WealthManager = require("@pay-service/base");
const Model = require("@schemas/model");
const ERROR_REWARD_NOT_EXISTS = 1;
const ERROR_NOT_ENOUGH_BLOCKS = 2;
const ERRROR_ALREADY_OWNED = 3;
function selectByWeight(items) {
    const totalWeight = items.reduce((acc, val) => acc + val.weight, 0);

    const randomNumber = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const item of items) {
        cumulativeWeight += item.weight;
        if (randomNumber <= cumulativeWeight) {
            return item;
        }
    }
}

// --- Unimplemented (untouched) ---
async function getSignInActivity(userId) {
    logger.warn("GetSignInActivity: Implementation needed");
    return responses.innerError();
}

async function getSignInReward(userId) {
    logger.warn("GetSignInReward: Implementation needed");
    return responses.innerError();
}


async function getActivityList(userId) {
    const loginTimeSeconds = 7200;
    const serverTimestamp = Math.floor(Date.now() / 1000);

    const activityTitleList = [
        {
            titleName: "Login Gift",
            pic: "http://static.sandboxol.com/sandbox/activity/sign_up_gift/sign_gift.png",
            content: "activity:sign",
            status: 1,
            isEnable: true,
            isLast: false,
            position: 0
        },
        {
            titleName: "Prize Wheel",
            pic: "http://static-xenox-service.vercel.app/events/wheel/new_activity_banner_lucky_wheel.png",
            content: "activity:wheel",
            status: 1,
            isEnable: true,
            isLast: false,
            position: 1
        },
        {
            titleName: "Currency Frenzy",
            pic: "http://static-xenox-service.vercel.app/events/frenzy/banner_currency_frenzy.png",
            content: "activity:currency_frenzy",
            status: 1,
            isEnable: true,
            isLast: false,
            position: 2
        }
    ];

    const data = {
        cumulativeTime: loginTimeSeconds,
        serverTime: serverTimestamp,
        activityTitleList
    };

    return responses.success(data);
}


async function getActivityTaskList(userId, activityType) {
    try {
        // Get today's day: 1 (Monday) to 7 (Sunday)
        const dayJs = new Date();
        const jsDay = dayJs.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const todayCondition = jsDay === 0 ? "7" : String(jsDay); // Convert Sunday from 0 to "7"

        // Filter actions by activityType
        let filtered = actionsConfig.filter(action => action.actionType === activityType);

        // If activityType is "common", also filter by today’s condition
        if (activityType === "common") {
            filtered = filtered.filter(action => action.condition === todayCondition);
        }

        if (filtered.length === 0) {
            logger.warn(`No tasks found for user ${userId}, type ${activityType}`);
            return responses.error(404, "No tasks found", null);
        }

        return responses.success(filtered);
    } catch (err) {
        logger.error("GetActivityTaskList Error:", err);
        return responses.innerError();
    }
}


// --- Mongoose-based implementation ---
async function getActivityFreeWheelStatus(userId) {
    const activity = Activity.fromUserId(userId);
    if (!activity) {
            await ActivityManager.createActivitySession(userId);
            return responses.error(404, `Activity is not defined for userId: ${userId}`, null);
    }
    return responses.success({ isFree: activity.freeWheel == null ? 1 : 0 });
}

async function getActivityWheelInfo(userId, type) {
    const user = await User.fromUserId(userId);
    if (!user) {
        logger.warn(`User not found for userId: ${userId}`);
        return responses.error(404, "User not found", null);
    }

    const activity = await Activity.fromUserId(userId);
    if (!activity) {
        await ActivityManager.createActivitySession(userId);
        return responses.error(404, `Activity is not defined for userId: ${userId}`, null);
    }

    if (type !== WheelTypes.GOLD && type !== WheelTypes.DIAMOND) {
        return responses.invalidType();
    }

    // Clone base config
    const activityInfo = { ...allWheelConfig[type] };
    activityInfo.activityDesc = allWheelConfig.activityDesc;

    // Determine which reward list to use (based on user.sex)
    const validSex = user.sex === 1 || user.sex === 2 ? user.sex : 1;
    const rewardListKey = `rewardInfoList_${validSex}`;
    const rewardList = allWheelRewardsConfig?.[type]?.[rewardListKey];

    if (!rewardList || !Array.isArray(rewardList)) {
        logger.error(`Missing reward list for type=${type}, sex=${user.sex}, key=${rewardListKey}`);
        return responses.error(500, `Reward list not found`, null);
    }

    // Attach reward list as unified field
    activityInfo.rewardInfoList = rewardList;

    // Wheel state
    const freeWheel = activity.freeWheel;
    const nextFreeWheel = 0;
    activityInfo.seconds = type !== WheelTypes.DIAMOND ? nextFreeWheel : 0;
    activityInfo.isFree = freeWheel;

    // Lucky value field mapping
    const luckyField = type === WheelTypes.DIAMOND ? 'luckDiamonds' : 'luckGold';
    activityInfo.luckyValue = parseInt(activity[luckyField]) || 0;

    // Blocks (for shop)
    const goldBlocks = parseInt(activity.blockGold) || 0;
    const diamondBlocks = parseInt(activity.blockDiamonds) || 0;
    activityInfo.totalBlock = goldBlocks + diamondBlocks;

    return responses.success(activityInfo);
}

// --- Still mocked, implementation later ---



async function playActivityWheel(userId, type, isMultiplePlay) {
  try {
    const user = await User.fromUserId(userId);
    if (!user) throw new Error("User not found");

    let activity = await Activity.fromUserId(userId);
    if (!activity) {
      await ActivityManager.createActivitySession(userId);
      throw new Error(`Activity is not defined for userId: ${userId}`);
    }

    if (type !== WheelTypes.GOLD && type !== WheelTypes.DIAMOND) {
      throw new Error("Invalid wheel type");
    }

    const wheelConfig = allWheelConfig[type];
    const rewardConfig = allWheelRewardsConfig[type]?.rewardConfig;
    const rewardList = allWheelRewardsConfig[type]?.[`rewardInfoList_${user.sex}`] || [];
    const luckyValueLimit = type === WheelTypes.DIAMOND ? 400 : 1000;

    const isMultiSpins = parseInt(isMultiplePlay) === 1;
    if (isMultiplePlay != 0 && isMultiplePlay != 1) {
      throw new Error("Invalid parameter: isMulti");
    }

    const priceType = type === WheelTypes.GOLD ? 2 : 1;
    const field = type === WheelTypes.DIAMOND ? "luckDiamond" : "luckGold";
    const blockField = type === WheelTypes.DIAMOND ? "blockDiamond" : "blockGold";

    let userLuckyValue = parseInt(activity[field]) || 0;

    // Determine price
    let price = isMultiSpins
      ? wheelConfig.multiQuantity
      : (activity.freeWheel === 1 && type === WheelTypes.GOLD)
        ? 0
        : wheelConfig.singleQuantity;

    const successRemove = await WealthManager.removeCurrency(userId, priceType, price);
    if (!successRemove) return null;

    // Consume freeWheel if applicable
    if (type === WheelTypes.GOLD && activity.freeWheel === 1 && !isMultiSpins) {
      activity.freeWheel = 0;
    }

    // MULTI SPIN
    if (isMultiSpins) {
      const multiplayInfo = { userLuckyValue, drawList: [] };

      for (let i = 0; i < wheelConfig.drawRewardCount; i++) {
        if (userLuckyValue >= luckyValueLimit) {
          const blockReward = rewardList.find(r => r.rewardType === RewardTypes.BLOCK);
          if (blockReward) {
            activity[field] = 0;
            await activity.save();
            return responses.success({ ...blockReward, luckValue: -luckyValueLimit });
          }
        }

        const item = selectByWeight(rewardConfig);
        const itemInfo = rewardList.find(x => x.rewardId === item.rewardId);
        const spinData = { ...itemInfo };
        let luckValue = wheelConfig.oneIncreaseValue;

        switch (itemInfo.rewardType) {
          case RewardTypes.DIAMOND:
            await WealthManager.addCurrency(userId, 1, item.rewardQty, "wheel_reward");
            break;
          case RewardTypes.GOLD:
            await WealthManager.addCurrency(userId, 2, item.rewardQty, "wheel_reward");
            break;
          case RewardTypes.VIP:
            await userServiceBase.addVip(userId, item.rewardVipLevel, item.rewardVipDays);
            spinData.isTransform = 1;
            spinData.before = 0;
            spinData.now = 0;
            break;
          case RewardTypes.DRESS: {
            const dressId = item[`rewardDressId_${user.sex}`];
            if (!dressId) break;

            const ownedDresses = await decorationServiceBase.getOwnedDresses(userId);
            if (ownedDresses.includes(dressId)) {
              luckValue += item.luckValue;
              spinData.isTransform = 1;
              spinData.luckValue = item.luckValue;
            } else {
              await decorationServiceBase.addDresses(userId, [dressId]);
              spinData.rewardDressId = dressId;
              spinData.isTransform = 0;
              spinData.luckValue = 0;
            }
            break;
          }
        }

        // Update lucky values
        spinData.luckValue = luckValue;
        userLuckyValue += luckValue;
        activity[field] = userLuckyValue;
        activity[blockField] = (parseInt(activity[blockField]) || 0) + luckValue;

        // Promote block → luck
        if (type === WheelTypes.GOLD && activity[blockField] >= 1000) {
          activity[blockField] = 0;
          activity.luckGold = (parseInt(activity.luckGold) || 0) + 1;
        }
        if (type === WheelTypes.DIAMOND && activity[blockField] >= 400) {
          activity[blockField] = 0;
          activity.luckDiamond = (parseInt(activity.luckDiamond) || 0) + 1;
        }

        multiplayInfo.drawList.push(spinData);
      }

      await activity.save();
      return responses.success({ ...multiplayInfo, userLuckyValue });
    }

    // SINGLE SPIN
    if (userLuckyValue >= luckyValueLimit) {
      const blockReward = rewardList.find(r => r.rewardType === RewardTypes.BLOCK);
      if (blockReward) {
        activity[field] = 0;
        await activity.save();
        return responses.success({ ...blockReward, luckValue: -luckyValueLimit });
      }
    }

    const item = selectByWeight(rewardConfig);
    const itemInfo = rewardList.find(x => x.rewardId === item.rewardId);
    if (!itemInfo) throw new Error("Selected reward not found");

    const spinData = { ...itemInfo };
    let luckValue = wheelConfig.oneIncreaseValue;

    switch (itemInfo.rewardType) {
      case RewardTypes.DIAMOND:
        await WealthManager.addCurrency(userId, 1, item.rewardQty, "wheel_reward");
        break;
      case RewardTypes.GOLD:
        await WealthManager.addCurrency(userId, 2, item.rewardQty, "wheel_reward");
        break;
      case RewardTypes.VIP:
        await userServiceBase.addVip(userId, item.rewardVipLevel, item.rewardVipDays);
        spinData.isTransform = 1;
        spinData.before = 0;
        spinData.now = 0;
        break;
      case RewardTypes.DRESS: {
        const dressId = item[`rewardDressId_${user.sex}`];
        if (!dressId) break;

        const ownedDresses = await decorationServiceBase.getOwnedDresses(userId);
        if (ownedDresses.includes(dressId)) {
          luckValue += item.luckValue;
          spinData.isTransform = 1;
          spinData.luckValue = item.luckValue;
        } else {
          await decorationServiceBase.addDresses(userId, [dressId]);
          spinData.rewardDressId = dressId;
          spinData.isTransform = 0;
          spinData.luckValue = 0;
        }
        break;
      }
    }

    spinData.luckValue = luckValue;
    userLuckyValue += luckValue;
    activity[field] = userLuckyValue;
    activity[blockField] = (parseInt(activity[blockField]) || 0) + luckValue;

    // Promote block → luck
    if (type === WheelTypes.GOLD && activity[blockField] >= 1000) {
      activity[blockField] = 0;
      activity.luckGold = (parseInt(activity.luckGold) || 0) + 1;
    }
    if (type === WheelTypes.DIAMOND && activity[blockField] >= 400) {
      activity[blockField] = 0;
      activity.luckDiamond = (parseInt(activity.luckDiamond) || 0) + 1;
    }

    await activity.save();
    return responses.success({ ...spinData, userLuckyValue });

  } catch (err) {
    logger.error("playActivityWheel failed:", {
      message: err?.message,
      stack: err?.stack
    });
    return responses.innerError();
  }
}


    
            

    
async function getActivityWheelShopInfo(userId, type) {
    const user = await User.fromUserId(userId); // uses your User model with .fromUserId
        let activity = await Activity.fromUserId(userId);

        if (!activity) {
            await ActivityManager.createActivitySession(userId);
            return responses.error(404, `Activity is not defined for userId: ${userId}`, null);
        }
    
    
    const shopKey = `shop_${user.sex}`;
        const shopData = allWheelShopConfig[type]?.[shopKey] || [];

        const blockWealth = type === "gold"
            ? parseInt(activity.getLuckGold()) || 0
            : parseInt(activity.getLuckDiamonds()) || 0;

        return responses.success({
            userBlock: blockWealth,
            remainingTime: luckyWheelConfig.remainingTime,
            blockShopRewardInfoList: shopData
        });  
}

module.exports = {
    getSignInActivity,
    getSignInReward,
    getActivityList,
    getActivityTaskList,
    getActivityFreeWheelStatus,
    getActivityWheelInfo,
    getActivityWheelShopInfo,
    playActivityWheel
};
