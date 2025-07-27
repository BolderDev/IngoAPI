const mongooseModel = require("@schemas/model");
const Page = require("@models/Page");

module.exports = class FriendRequest {
    constructor() {
        this.requestId = null;
        this.userId = 0;
        this.friendId = 0;
        this.message = "";
        this.picUrl = "";
        this.nickName = "";
        this.sex = 0;
        this.country = "";
        this.language = "";
        this.status = 0;
        this.creationTime = 0;
    }

    static async listFromUserId(userId, pageNo, pageSize) {
        const totalSize = await mongooseModel.countDocuments({ modelName: "FriendRequest", userId });
        const startIndex = Page.getStartIndex(pageNo, pageSize);

        const docs = await mongooseModel.find({ modelName: "FriendRequest", userId })
            .sort({ creationTime: -1 })
            .skip(startIndex)
            .limit(pageSize)
            .lean();

        const rows = docs.map(d => Object.assign(new FriendRequest(), d).response());
        return new Page(rows, totalSize, pageNo, pageSize);
    }

    static async fromFriendId(userId, friendId) {
        const doc = await mongooseModel.findFirst("FriendRequest", { userId, friendId });
        return doc ? Object.assign(new FriendRequest(), doc) : null;
    }

    async save() {
        await mongooseModel.insertOrUpdate("FriendRequest", {
            userId: this.userId,
            friendId: this.friendId
        }, {
            message: this.message,
            picUrl: this.picUrl,
            nickName: this.nickName,
            sex: this.sex,
            country: this.country,
            language: this.language,
            status: this.status,
            creationTime: this.creationTime
        });
    }

    response() {
        return {
            msg: this.message,
            nickName: this.nickName,
            picUrl: this.picUrl,
            requestId: this.requestId,
            status: this.status,
            userId: this.friendId,
            language: this.language,
            country: this.country,
            sex: this.sex
        };
    }

    // Getter/Setter methods
    setRequestId(requestId) { this.requestId = requestId; }
    getRequestId() { return this.requestId; }

    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }

    setFriendId(friendId) { this.friendId = friendId; }
    getFriendId() { return this.friendId; }

    setMessage(message) { this.message = message; }
    getMessage() { return this.message; }

    setProfilePic(picUrl) { this.picUrl = picUrl; }
    getProfilePic() { return this.picUrl; }

    setNickname(nickName) { this.nickName = nickName; }
    getNickname() { return this.nickName; }

    setSex(sex) { this.sex = sex; }
    getSex() { return this.sex; }

    setCountry(country) { this.country = country; }
    getCountry() { return this.country; }

    setLanguage(language) { this.language = language; }
    getLanguage() { return this.language; }

    setStatus(status) { this.status = status; }
    getStatus() { return this.status; }

    setCreationTime(creationTime) { this.creationTime = creationTime; }
    getCreationTime() { return this.creationTime; }
};