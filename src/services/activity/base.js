const Activity = require("@models/Activity");

/**
 * Creates an activity session for a user if it doesn't already exist.
 * @param {string|number} userId
 */
async function createActivitySession(userId) {
    const existing = await Activity.fromUserId(userId);
    if (existing) return;

    const activity = new Activity(userId);
    activity.setFreeWheel(1);
    activity.setMoneyClaimed(false);
    activity.setLuckDiamonds(0);
    activity.setLuckGold(0);
    activity.setBlockDiamonds(0);
    activity.setBlockGold(0);
    activity.setSignInDay(0);
    activity.setCurrentSignInDay(0);
    await activity.save();
}

module.exports = {
    createActivitySession
};