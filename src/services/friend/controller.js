const service = require("@friend-service/service");

async function getFriendList(request) {
return await service.getFriendList(request.getUserId(),
parseInt(request.query.pageNo),
parseInt(request.query.pageSize));
}

async function getFriendRequestList(request) {
return await service.getFriendRequestList(request.getUserId(),
parseInt(request.query.pageNo),
parseInt(request.query.pageSize));
}

async function searchFriendByNickname(request) {
return await service.searchFriendByNickname(request.getUserId(),
request.params.nickName,
parseInt(request.query.pageNo),
parseInt(request.query.pageSize));
}

async function searchFriendById(request) {
return await service.searchFriendById(request.getUserId(),
parseInt(request.params.friendId));
}

async function sendFriendRequest(request) {
return await service.sendFriendRequest(request.getUserId(),
parseInt(request.body.friendId),
request.body.msg);
}

async function deleteFriend(request) {
return await service.deleteFriend(request.getUserId(),
parseInt(request.query.friendId));
}

async function addFriendAlias(request) {
return await service.addFriendAlias(request.getUserId(),
parseInt(request.params.friendId),
request.query.alias);
}

async function deleteFriendAlias(request) {
return await service.deleteFriendAlias(request.getUserId(),
parseInt(request.params.friendId));
}

async function acceptFriendRequest(request) {
return await service.acceptFriendRequest(request.getUserId(),
parseInt(request.params.friendId));
}

async function rejectFriendRequest(request) {
return await service.rejectFriendRequest(request.getUserId(),
parseInt(request.params.friendId));
}

async function getFriendInfo(request) {
return await service.getFriendInfo(request.getUserId(),
parseInt(request.params.friendId));
}

async function getFriendStatus(request) {
return await service.getFriendStatus(request.getUserId());
}

async function getFriendRecommendation(request) {
return await service.getFriendRecommendation(request.getUserId());
}

module.exports = [
{
"path": "/friend/api/v1/friends",
"methods": ["GET", "POST", "DELETE"],
"functions": [getFriendList, sendFriendRequest, deleteFriend]
},
{
"path": "/friend/api/v1/friends/requests",
"methods": ["GET"],
"functions": [getFriendRequestList]
},
{
"path": "/friend/api/v1/friends/info/:nickName",
"methods": ["GET"],
"functions": [searchFriendByNickname]
},
{
"path": "/friend/api/v1/friends/info/id/:friendId",
"methods": ["GET"],
"functions": [searchFriendById]
},
{
"path": "/friend/api/v1/friends/:friendId/alias",
"methods": ["POST", "DELETE"],
"functions": [addFriendAlias, deleteFriendAlias]
},
{
"path": "/friend/api/v1/friends/:friendId/agreement",
"methods": ["PUT"],
"functions": [acceptFriendRequest]
},
{
"path": "/friend/api/v1/friends/:friendId/rejection",
"methods": ["PUT"],
"functions": [rejectFriendRequest]
},
{
"path": "/friend/api/v2/friends/:friendId",
"methods": ["GET"],
"functions": [getFriendInfo]
},
{
"path": "/friend/api/v1/friends/status",
"methods": ["GET"],
"functions": [getFriendStatus]
},
{
"path": "/friend/api/v1/friends/recommendation",
"methods": ["GET"],
"functions": [getFriendRecommendation]
}
]

