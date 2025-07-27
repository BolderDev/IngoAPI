const mongooseModel = require("@schemas/model");
const Page = require("@models/Page");

module.exports = class ClanMessage {
    constructor(userId) {
        this.messageId = null;
        this.userId = userId;
        this.clanId = 0;
        this.authorityId = 0;
        this.message = "";
        this.picUrl = "";
        this.nickName = "";
        this.type = 0;
        this.status = 0;
        this.creationTime = 0;
    }

    static fromJson(json) {
        const m = new ClanMessage(json.userId);
        Object.assign(m, json);
        return m;
    }

    toJson() {
        return {
            modelName: "ClanMessage",
            messageId: this.messageId,
            userId: this.userId,
            clanId: this.clanId,
            authorityId: this.authorityId,
            message: this.message,
            picUrl: this.picUrl,
            nickName: this.nickName,
            type: this.type,
            status: this.status,
            creationTime: this.creationTime
        };
    }

    static async listFromFilter(filterFn, pageNo, pageSize) {
        const allDocs = await mongooseModel.find({ modelName: "ClanMessage" }).lean();
        const filtered = allDocs.filter(filterFn);

        const totalSize = filtered.length;
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const pageData = filtered
            .sort((a, b) => b.creationTime - a.creationTime)
            .slice(startIndex, startIndex + pageSize)
            .map(ClanMessage.fromJson)
            .map(m => m.response());

        return new Page(pageData, totalSize, pageNo, pageSize);
    }

    static async findFirst(userId, type, status) {
        const doc = await mongooseModel.findOne({
            modelName: "ClanMessage",
            userId,
            type,
            status
        }).lean();
        return doc ? ClanMessage.fromJson(doc) : new ClanMessage(userId);
    }

    async save() {
        if (!this.messageId) {
            const latest = await mongooseModel.find({ modelName: "ClanMessage" })
                .sort({ messageId: -1 }).limit(1).lean();
            this.messageId = latest.length ? (latest[0].messageId || 0) + 1 : 1;
        }

        this.creationTime = this.creationTime || Date.now();

        await mongooseModel.insertOrUpdate("ClanMessage", { messageId: this.messageId }, this.toJson());
    }

    async delete() {
        if (this.messageId) {
            await mongooseModel.deleteOne({ modelName: "ClanMessage", messageId: this.messageId });
        }
    }

    response() {
        return {
            clanId: this.clanId,
            headPic: this.picUrl,
            id: this.messageId,
            nickName: this.nickName,
            status: this.status,
            type: this.type,
            userId: this.userId,
            msg: this.message
        };
    }

    // Setters/Getters...
    getMessageId() { return this.messageId; }
    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }
    setClanId(clanId) { this.clanId = clanId; }
    getClanId() { return this.clanId; }
    setAuthorityId(authorityId) { this.authorityId = authorityId; }
    getAuthorityId() { return this.authorityId; }
    setMessage(message) { this.message = message; }
    getMessage() { return this.message; }
    setProfilePic(picUrl) { this.picUrl = picUrl; }
    getProfilePic() { return this.picUrl; }
    setNickname(nickName) { this.nickName = nickName; }
    getNickname() { return this.nickName; }
    setType(type) { this.type = type; }
    getType() { return this.type; }
    setStatus(status) { this.status = status; }
    getStatus() { return this.status; }
    setCreationTime(creationTime) { this.creationTime = creationTime; }
    getCreationTime() { return this.creationTime; }
};