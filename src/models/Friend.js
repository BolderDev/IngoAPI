const mongooseModel = require("@schemas/model");
const Page = require("@models/Page");
const User = require("@models/User");
const Vip = require("@models/Vip");
const Clan = require("@models/Clan");
const ClanMember = require("@models/ClanMember");

module.exports = class Friend {
    constructor() {
        this.userId = 0;
        this.friendId = 0;
        this.alias = "";
    }

    /** @returns {Promise<Friend>} */
    static async fromUserId(userId, friendId) {
        const doc = await mongooseModel.findFirst("Friend", { userId, friendId });
        return doc ? Object.assign(new Friend(), doc) : null;
    }

    static async listFromUserId(userId, pageNo, pageSize) {
        const totalSize = await mongooseModel.countDocuments({ modelName: "Friend", userId });
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const docs = await mongooseModel.find({ modelName: "Friend", userId })
            .skip(startIndex)
            .limit(pageSize)
            .lean();
        const rows = docs.map(d => Object.assign(new Friend(), d));
        return new Page(rows, totalSize, pageNo, pageSize);
    }

    static async listIdsFromUserId(userId) {
        const docs = await mongooseModel.find({ modelName: "Friend", userId }).lean();
        return docs.map(d => d.friendId);
    }

    static async search(userId, query, excludeList, pageNo, pageSize) {
    if (!excludeList || excludeList.length === 0) excludeList = [0];

    const startIndex = Page.getStartIndex(pageNo, pageSize);
    const docs = await mongooseModel.find({
        modelName: "user",  // ✅ FIXED lowercase
        nickName: { $regex: `^${query}`, $options: 'i' },
        userId: { $ne: userId, $nin: excludeList }
    }).skip(startIndex).limit(pageSize).lean();

    const totalSize = await mongooseModel.countDocuments({
        modelName: "user",  // ✅ FIXED lowercase
        nickName: { $regex: `^${query}`, $options: 'i' },
        userId: { $ne: userId, $nin: excludeList }
    });

    return new Page(docs, totalSize, pageNo, pageSize);
}

    

    static async isFriend(userId, friendId) {
        const count = await mongooseModel.countDocuments({
            modelName: "Friend",
            $or: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });
        return count === 2;
    }

    static async addFriend(userId, friendId) {
        await mongooseModel.insertMany([
            { modelName: "Friend", userId, friendId, alias: "" },
            { modelName: "Friend", userId: friendId, friendId: userId, alias: "" }
        ]);
    }

    static async removeFriend(userId, friendId) {
        await mongooseModel.deleteMany({
            modelName: "Friend",
            $or: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });
    }

    async save() {
        await mongooseModel.insertOrUpdate("Friend", {
            userId: this.userId,
            friendId: this.friendId
        }, {
            alias: this.alias
        });
    }
     static async getInfo(userId) {
    const user = await User.fromUserId(userId);
    const vip = await Vip.fromUserId(userId);

    let clanInfo = {};

    // Load ClanMember first and use its role
    const member = await ClanMember.fromUserId(userId);
    if (member && member.clanId && member.clanId !== 0) {
        const clan = await Clan.fromClanId(member.clanId);
        if (clan) {
            clanInfo = {
                clanId: clan.clanId,
                clanName: clan.name,
                role: member.role // ✅ use exact role from ClanMember
            };
        }
    }

    return {
        ...user.response(),
        ...vip.response(),
        ...clanInfo
    };
}
    // Getter/Setter methods
    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }

    setFriendId(friendId) { this.friendId = friendId; }
    getFriendId() { return this.friendId; }

    setAlias(alias) { this.alias = alias; }
    getAlias() { return this.alias; }
};