const crypto = require("crypto");
const constants = require("@common/constants");
const redis = require("@common/redis");
const modelSchema = require("@schemas/model"); // Mongoose model wrapper
const User = require("@models/User"); // Must support fromUserId()

module.exports = class GameAccount {
    constructor() {
        this.userId = 0;
        this.accessToken = "";
        this.timestamp = 0;
    }

    /** @returns {Promise<GameAccount>} */
    static async fromUserId(userId) {
        const cache = await redis.getKey(constants.CACHE_GAME_ACCOUNT, userId);
        if (cache) {
            const obj = JSON.parse(cache);
            return Object.assign(new GameAccount(), obj);
        }

        const mongoDoc = await modelSchema.findFirst("game_account", { userId });
        if (mongoDoc) {
            const gameAccount = Object.assign(new GameAccount(), mongoDoc);
            await gameAccount.save(); // refresh Redis
            return gameAccount;
        }

        // Make sure user exists before creating GameAccount
        const user = await User.fromUserId(userId);
        if (!user) return null;

        const newAccount = new GameAccount();
        newAccount.setUserId(user.getUserId());
        newAccount.setAccessToken(GameAccount.generateAccessToken());
        newAccount.setTimestamp(Date.now());
        await newAccount.save();
        return newAccount;
    }

    async save() {
        await modelSchema.insertOrUpdate("game_account", { userId: this.userId }, {
            accessToken: this.accessToken,
            timestamp: this.timestamp
        });

        await redis.setKey({
            key: constants.CACHE_GAME_ACCOUNT,
            params: [this.userId]
        }, JSON.stringify(this), 600);
    }

    static generateAccessToken() {
        return crypto.randomBytes(16).toString("hex");
    }

    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }

    setAccessToken(token) { this.accessToken = token; }
    getAccessToken() { return this.accessToken; }

    setTimestamp(timestamp) { this.timestamp = timestamp; }
    getTimestamp() { return this.timestamp; }
};