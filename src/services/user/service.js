const constants = require("@common/constants");
const logger = require("@common/logger");
const responses = require("@common/responses");
const nickNameConfig = require("@config/nickname");
const Localization = require("@models/Localization");
const User = require("@models/User");
const Vip = require("@models/Vip");
const serverConfiguration = require('@config/server-configuration');
const payServiceBase = require("@pay-service/base");
const database = require("@common/database");
const Wealth = require("@models/Wealth");

const Model = require("@schemas/model");

async function getConfigFile(configFile) {
  const config = database.getKey(constants.DB_APP_CONFIG_TABLE, configFile, true);
  return responses.success(config || {});
}
async function getUserInfo(userId) {
  const user = await User.fromUserId(userId);
  const vip = await Vip.fromUserId(userId);

  return responses.success({
    ...user.response(),
    ...vip.response()
  });
}

async function createProfile(userId, nickName, sex) {
  const isUserExists = await User.exists(userId);
  if (isUserExists) return responses.profileExists();

  if (!nickName || !sex) return responses.missingRegisterParams();

  if (nickName.length > serverConfiguration.user.userNicknameMax) {
    return responses.nicknameTooLong();
  }

  if (nickName.length < serverConfiguration.user.userNicknameMin) {
    return responses.nicknameTooShort();
  }

  if (sex !== 1 && sex !== 2) return responses.invalidSex();

  // ✅ Check if nickname already taken (case-insensitive)
  const nicknameTaken = await Model.findOne({
    modelName: "user",
    nickName: new RegExp(`^${nickName}$`, "i")
  }).lean();

  if (nicknameTaken) {
    return responses.nicknameAlreadyUsed();
  }

  const user = new User(userId);
  user.setNickname(nickName);
  user.setSex(sex);
  await user.create();

  const vip = new Vip(userId);
  await vip.create();

  const userLocale = new Localization(userId);
  await userLocale.create();

  const wealth = new Wealth(userId);
  await wealth.create();

  return responses.success({
    ...user.response(),
    ...vip.response()
  });
}

async function setUserInfo(userId, picUrl, birthday, details) {
  const user = await User.fromUserId(userId);
  if (picUrl != null) user.setProfilePic(picUrl);
  if (birthday != null) user.setBirthday(birthday);
  if (details != null) user.setDetails(details);
  await user.save();
  return responses.success(user);
}


async function changeNickName(userId, newNickname) {
  if (!newNickname || typeof newNickname !== "string") {
    return responses.invalidNicknameFormat();
  }

  const nickname = newNickname.trim();

  const isValid = nickname.length >= serverConfiguration.user.userNicknameMin &&
    nickname.length <= serverConfiguration.user.userNicknameMax &&
    /^[a-zA-Z0-9_]+$/.test(nickname);

  if (!isValid) return responses.invalidNicknameFormat();

  const user = await User.fromUserId(userId);
  if (!user) return responses.userNotFound();

  const currentNickname = user.getNickname();
  const isSameNickname = currentNickname?.toLowerCase() === nickname.toLowerCase();

  // ✅ Use direct .findOne on your custom "Model" with modelName === "user"
  const nicknameTaken = await Model.findOne({
    modelName: "user",
    nickName: new RegExp(`^${nickname}$`, "i"),
    userId: { $ne: userId }
  }).lean();

  if (nicknameTaken) {
    return responses.nicknameAlreadyUsed();
  }

  if (isSameNickname) {
    return user.getIsFreeNickname()
      ? responses.success(user)
      : responses.sameNickname();
  }

  if (!user.getIsFreeNickname()) {
    const currencyType = nickNameConfig.currencyType;
    const cost = nickNameConfig.quantity;

    // ✅ Explicit check first
    const hasEnough = await payServiceBase.hasEnoughCurrency(userId, currencyType, cost);
    if (!hasEnough) return responses.insufficientCurrency();

    const result = await payServiceBase.removeCurrency(userId, currencyType, cost, 3); // 3 = nickname change
    if (result.hasFailed) return responses.insufficientCurrency();

    user.setIsFreeNickname(false);
  } else {
    user.setIsFreeNickname(false);
  }

  user.setNickname(nickname);
  await user.save();

  return responses.success(user);
}

async function isChangingNameFree(userId) {
  const user = await User.fromUserId(userId);
  return responses.success({
    currencyType: nickNameConfig.currencyType,
    quantity: nickNameConfig.quantity,
    free: user.getIsFreeNickname()
  });
}

async function setUserLanguage(userId, language) {
  const locale = await Localization.fromUserId(userId);
  locale.setLanguage(language);
  await locale.save();
  return responses.success();
}

async function getUserVipInfo(userId) {
  const vip = await Vip.fromUserId(userId);
  return responses.success(vip.response());
}

async function getDailyRewardInfo(userId) {
  logger.warn("getDailyRewardInfo: Implementation needed");
  return responses.success();
}

async function receiveDailyReward(userId) {
  logger.warn("receiveDailyReward: Implementation needed");
  return responses.success();
}

async function getDailyTasksAdConfig(userId) {
  logger.warn("GetDailyTasksAdConfig: Implementation needed");
  return responses.success();
}

async function reportUser(userId) {
  logger.warn("reportUser: Implementation needed");
  return responses.innerError();
}

async function getUserInfoReward(userId) {
  const user = await User.fromUserId(userId);
  if (!user) return responses.userNotFound();

  const hasDetails = typeof user.getDetails() === "string" && user.getDetails().length > 0;
  const hasPic = typeof user.getProfilePic() === "string" && user.getProfilePic().length > 0;
  const hasBirthday = !!user.getBirthday();

  if (hasDetails && hasPic && hasBirthday) {
    const result = await payServiceBase.addCurrency(userId, 1, 5, 4); // 4 = type: info reward
    if (result.hasFailed) return responses.innerError("Could not grant reward.");

    return responses.success({ rewardGiven: true, balance: result.balance });
  }

  return responses.success({
    rewardGiven: false,
    reason: "Profile incomplete"
  });
}

module.exports = {
  getConfigFile,
  getUserInfo,
  setUserInfo,
  createProfile,
  changeNickName,
  isChangingNameFree,
  setUserLanguage,
  getUserVipInfo,
  getDailyRewardInfo,
  receiveDailyReward,
  getDailyTasksAdConfig,
  reportUser,
  getUserInfoReward
};
