const mongooseModel = require("@schemas/model");

module.exports = class User {
    constructor(userId) {
        this.userId = userId;
        this.nickName = "";
        this.sex = 0;
        this.picUrl = "";
        this.details = "";
        this.birthday = "";
        this.isFreeNickname = true;

        // New fields
        this.status = 0;
        this.stopToTime = null;
        this.stopReason = null;
    }

    /** @returns {Promise<User>} */
    static async fromUserId(userId) {
        const doc = await mongooseModel.findOne({ modelName: 'user', userId });
        if (!doc) return null;
        const user = new User(userId);
        Object.assign(user, doc.toObject());
        return user;
    }

    /** @returns {Promise<Boolean>} */
    static async exists(userId) {
        const count = await mongooseModel.countDocuments({ modelName: 'user', userId });
        return count === 1;
    }

    async create() {
        await mongooseModel.create({
            modelName: 'user',
            userId: this.userId,
            nickName: this.nickName,
            sex: this.sex,
            picUrl: this.picUrl,
            details: this.details,
            birthday: this.birthday,
            isFreeNickname: this.isFreeNickname,
            status: this.status,
            stopToTime: this.stopToTime,
            stopReason: this.stopReason
        });
    }

    async save() {
        await mongooseModel.updateOne(
            { modelName: 'user', userId: this.userId },
            {
                $set: {
                    nickName: this.nickName,
                    sex: this.sex,
                    picUrl: this.picUrl,
                    details: this.details,
                    birthday: this.birthday,
                    isFreeNickname: this.isFreeNickname,
                    status: this.status,
                    stopToTime: this.stopToTime,
                    stopReason: this.stopReason
                }
            },
            { upsert: true }
        );
    }

    response() {
        return {
            userId: this.userId,
            nickName: this.nickName,
            sex: this.sex,
            picUrl: this.picUrl,
            details: this.details,
            birthday: this.birthday,
            status: this.status,
            stopToTime: this.stopToTime,
            stopReason: this.stopReason
        };
    }

    // Getters & Setters

    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }

    setNickname(nickName) { this.nickName = nickName; }
    getNickname() { return this.nickName; }

    setSex(sex) { this.sex = sex; }
    getSex() { return this.sex; }

    setProfilePic(picUrl) { this.picUrl = picUrl; }
    getProfilePic() { return this.picUrl; }

    setDetails(details) { this.details = details; }
    getDetails() { return this.details; }

    setBirthday(birthday) { this.birthday = birthday; }
    getBirthday() { return this.birthday; }

    setIsFreeNickname(isFreeNickname) { this.isFreeNickname = isFreeNickname; }
    getIsFreeNickname() { return this.isFreeNickname; }

    setStatus(status) { this.status = status; }
    getStatus() { return this.status; }

    setStopToTime(stopToTime) { this.stopToTime = stopToTime; }
    getStopToTime() { return this.stopToTime; }

    setStopReason(stopReason) { this.stopReason = stopReason; }
    getStopReason() { return this.stopReason; }
};
