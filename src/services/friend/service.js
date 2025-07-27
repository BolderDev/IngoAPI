const logger = require("@common/logger");
const responses = require("@common/responses");
const friendConfig = require("@config/friend");
const RequestStatuses = require("@constants/RequestStatuses");

const Friend = require("@models/Friend");
const FriendRequest = require("@models/FriendRequest");
const GameStatus = require("@models/GameStatus");
const Localization = require("@models/Localization");
const Page = require("@models/Page");
const User = require("@models/User");
const mongooseModel = require("@schemas/model");

// --- Friend List ---
async function getFriendList(userId, pageNo, pageSize) {
const friends = await Friend.listFromUserId(userId, pageNo, pageSize);
return responses.success(friends);
}

// --- Friend Request List ---
async function getFriendRequestList(userId, pageNo, pageSize) {
const friendRequests = await FriendRequest.listFromUserId(userId, pageNo, pageSize);
return responses.success(friendRequests);
}

// --- Friend Search ---
async function searchFriendByNickname(userId, nickName, pageNo, pageSize) {
if (!nickName) return responses.success(Page.empty());

const excludeList = await Friend.listIdsFromUserId(userId);
const results = await Friend.search(userId, nickName, excludeList, pageNo, pageSize);
return responses.success(results);

}

async function searchFriendById(userId, friendId) {
if (userId === friendId) return responses.success();

const hasFriend = await Friend.isFriend(userId, friendId);
if (hasFriend) return responses.success();

const exists = await User.exists(friendId);
if (!exists) return responses.success();

return getFriendInfo(userId, friendId);

}

// --- Send Friend Request ---
async function sendFriendRequest(userId, friendId, message) {
const hasFriend = await Friend.isFriend(userId, friendId);
if (hasFriend) return responses.alreadyFriend();

const user = await User.fromUserId(userId);
const userLocale = await Localization.fromUserId(userId);

const request = new FriendRequest();
request.setUserId(friendId); // receiver
request.setFriendId(userId); // sender
request.setMessage(message);
request.setProfilePic(user.getProfilePic?.() || "");
request.setNickname(user.getNickname?.() || "");
request.setSex(user.getSex?.() || 0);
request.setCountry(userLocale.getCountry?.() || "");
request.setLanguage(userLocale.getLanguage?.() || "");
request.setStatus(RequestStatuses.PENDING);
request.setCreationTime(Date.now());

await request.save();
return responses.success();

}

// --- Delete Friend ---
async function deleteFriend(userId, friendId) {
const hasFriend = await Friend.isFriend(userId, friendId);
if (!hasFriend) return responses.notValidUser();

await Friend.removeFriend(userId, friendId);
return responses.success();

}

// --- Alias ---
async function addFriendAlias(userId, friendId, alias) {
const friend = await Friend.fromUserId(userId, friendId);
if (!friend) return responses.notValidUser();

if (alias) {
friend.setAlias(alias);
await friend.save();
}

return responses.success();

}

async function deleteFriendAlias(userId, friendId) {
const friend = await Friend.fromUserId(userId, friendId);
if (!friend) return responses.notValidUser();

if (friend.getAlias()) {
friend.setAlias(null);
await friend.save();
}

return responses.success();

}

// --- Accept / Reject Request ---

async function acceptFriendRequest(userId, friendId) {
// Reject invalid requests (same user or non-existing target user)
if (userId === friendId || !(await User.exists(friendId))) {
return responses.notValidUser();
}

// FriendRequest: from friendId (sender) to userId (receiver)
const request = await FriendRequest.fromFriendId(userId, friendId);
if (!request) {
return responses.notValidUser();
}

// Update status and save
request.setStatus(RequestStatuses.ACCEPTED);
await request.save();

// Add friendship in both directions
await Friend.addFriend(userId, friendId);

return responses.success();

}

async function rejectFriendRequest(userId, friendId) {
if (userId === friendId || !(await User.exists(friendId))) {
return responses.notValidUser();
}

const request = await FriendRequest.fromFriendId(friendId, userId);
if (!request) return responses.notValidUser();

request.setStatus(RequestStatuses.REFUSED);
await request.save();

return responses.success();

}

// --- Get Friend Info ---
async function getFriendInfo(userId, friendId) {
// Check if friend user exists
const exists = await User.exists(friendId);
if (!exists) {
return responses.userNotExists();
}

// Get basic profile info via Friend.getInfo(friendId)
const info = await Friend.getInfo(friendId); // <-- just profile

// Check if they are a friend of current user
const friend = await Friend.fromUserId(userId, friendId);
if (friend) {
info.friend = true;
info.alias = friend.getAlias?.();
}

return responses.success(info);

}
// --- Friend Status ---
async function getFriendStatus(userId) {
const friendIds = await Friend.listIdsFromUserId(userId);
const statusList = friendIds.map(friendId => new GameStatus(friendId));

return responses.success({
curFriendCount: friendIds.length,
maxFriendCount: friendConfig.maxFriends,
status: statusList
});

}

// --- Recommendation ---
async function getFriendRecommendation(userId) {
const users = await mongooseModel.find({ modelName: "user", userId: { $ne: userId } })
.select("userId sex nickName picUrl")
.limit(20)
.lean();

const results = users.map(user => ({
userId: user.userId,
sex: user.sex,
nickName: user.nickName,
picUrl: user.picUrl
}));

return responses.success(results);

}

module.exports = {
getFriendList,
getFriendRequestList,
searchFriendByNickname,
searchFriendById,
sendFriendRequest,
deleteFriend,
addFriendAlias,
deleteFriendAlias,
acceptFriendRequest,
rejectFriendRequest,
getFriendInfo,
getFriendStatus,
getFriendRecommendation
};
