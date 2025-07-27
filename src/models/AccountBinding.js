const db = require("@common/db");

module.exports = class AccountBinding {
    constructor(userId) {
        this.userId = userId;
        this.connectId = "";
    }

    static fromJson(json) {
        const binding = new AccountBinding(json.userId);
        binding.connectId = json.connectId ?? "";
        return binding;
    }

    toJson() {
        return {
            userId: this.userId,
            connectId: this.connectId
        };
    }

    /** @returns {Promise<AccountBinding>} */
    static async fromUserId(userId) {
        const data = db.get(`account_binding.${userId}`);
        return data ? AccountBinding.fromJson(data) : new AccountBinding(userId);
    }

    async save() {
        db.set(`account_binding.${this.userId}`, this.toJson());
    }

    async delete() {
        db.delete(`account_binding.${this.userId}`);
    }

    response() {
        return {
            connectId: this.connectId
        };
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setConnectId(connectId) {
        this.connectId = connectId;
    }

    getConnectId() {
        return this.connectId;
    }
};