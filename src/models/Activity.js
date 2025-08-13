const mongooseModel = require("@schemas/model");

module.exports = class Activity {
    constructor(userId = null) {
        this.userId = userId;
        this.freeWheel = 0;
        this.moneyClaimed = false;
        this.luckDiamonds = 0;
        this.luckGold = 0;
        this.blockDiamonds = 0;
        this.blockGold = 0;
        this.signInDay = 0;
        this.currentSignInDay = 0;
    }

    /** 
     * Load Activity for userId or return null if not found 
     * @returns {Promise<Activity|null>} 
     */
    static async fromUserId(userId) {
        const row = await mongooseModel.findFirst("activity", { userId });
        if (!row) return null;

        const act = new Activity(userId);

        // Assign properties, fallback defaults if undefined
        act.freeWheel = row.freeWheel ?? 0;
        act.moneyClaimed = row.moneyClaimed ?? false;
        act.luckDiamonds = row.luckDiamonds ?? 0;
        act.luckGold = row.luckGold ?? 0;
        act.blockDiamonds = row.blockDiamonds ?? 0;
        act.blockGold = row.blockGold ?? 0;
        act.signInDay = row.signInDay ?? 0;
        act.currentSignInDay = row.currentSignInDay ?? 0;

        return act;
    }

    /**
     * Save the current Activity instance to DB (upsert)
     */
    async save() {
        await mongooseModel.insertOrUpdate(
            "activity", 
            { userId: this.userId },
            {
                freeWheel: this.freeWheel,
                moneyClaimed: this.moneyClaimed,
                luckDiamonds: this.luckDiamonds,
                luckGold: this.luckGold,
                blockDiamonds: this.blockDiamonds,
                blockGold: this.blockGold,
                signInDay: this.signInDay,
                currentSignInDay: this.currentSignInDay
            }
        );
    }

    // Getters and setters
    setUserId(userId) { this.userId = userId; }
    getUserId() { return this.userId; }

    setFreeWheel(val) { this.freeWheel = val; }
    getFreeWheel() { return this.freeWheel; }

    setMoneyClaimed(val) { this.moneyClaimed = val; }
    getMoneyClaimed() { return this.moneyClaimed; }

    setLuckDiamonds(val) { this.luckDiamonds = val; }
    getLuckDiamonds() { return this.luckDiamonds; }

    setLuckGold(val) { this.luckGold = val; }
    getLuckGold() { return this.luckGold; }

    setBlockDiamonds(val) { this.blockDiamonds = val; }
    getBlockDiamonds() { return this.blockDiamonds; }

    setBlockGold(val) { this.blockGold = val; }
    getBlockGold() { return this.blockGold; }

    setSignInDay(val) { this.signInDay = val; }
    getSignInDay() { return this.signInDay; }

    setCurrentSignInDay(val) { this.currentSignInDay = val; }
    getCurrentSignInDay() { return this.currentSignInDay; }
};
