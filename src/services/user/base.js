const User = require("@models/User");
const Account = require("@models/Account");
const Vip = require("@models/Vip");

/**
 * Bans a user until a specific time with a given reason,
 * and clears their access token to log them out.
 * 
 * @param {string} userId - The ID of the user to ban.
 * @param {Date | string} stopToTime - The date/time until the user is banned.
 * @param {string | number} stopReason - A reason code or string to describe the ban.
 */
async function setBanUser(userId, stopToTime, stopReason) {
    if (!userId || !stopToTime) {
        throw new Error("userId and stopToTime are required.");
    }

    const user = await User.fromUserId(userId);
    const account = await Account.fromUserId(userId);

    if (!user || !account) {
        throw new Error("User or Account not found");
    }

    user.setStopToTime(new Date(stopToTime));
    user.setStopReason(stopReason || "unknown");
    user.setStatus(1); // Set user status to banned
    account.setAccessToken(""); // Clear access token to force logout

    await Promise.all([user.save(), account.save()]);
}

/**
 * Grants VIP to a user for a number of days.
 * 
 * @param {string} userId - The user ID
 * @param {number} vipLevel - The VIP level
 * @param {number} days - Number of days the VIP lasts
 */
async function addVip(userId, vipLevel, days) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + days);

    const vip = await Vip.fromUserId(userId);
    vip.setLevel(vipLevel);
    vip.setExpireDate(expireDate);
    await vip.save();
}

/**
 * Retrieves a user's ban info and resets expired bans.
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Ban info object
 */
async function getBanInfo(userId) {
    const [user, account] = await Promise.all([
        User.fromUserId(userId),
        Account.fromUserId(userId)
    ]);

    if (!user || !account) {
        return {
            userId,
            status: 0,
            stopToTime: null,
            stopReason: null
        };
    }

    const now = new Date();
    const stopToTime = user.getStopToTime();
    const stopReason = user.getStopReason();
    let isBanned = false;

    if (stopToTime && new Date(stopToTime) > now) {
        isBanned = true;
    } else if (stopToTime || stopReason || user.getStatus() === 1) {
        user.setStopToTime(null);
        user.setStopReason(null);
        user.setStatus(0);
        await user.save();
    }

    return {
        userId,
        status: isBanned ? 1 : 0,
        stopToTime: user.getStopToTime(),
        stopReason: user.getStopReason() ? `ban_reason_${user.getStopReason()}` : null,
        email: account.getEmail() || null
    };
}

module.exports = {
    setBanUser,
    addVip,
    getBanInfo
};