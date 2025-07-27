const MongooseModel = require("@schemas/model");

module.exports = class Wealth {
    constructor(userId) {
        this.userId = userId;
        this.golds = 0;
        this.diamonds = 0;
        this.clanGolds = 0;
    }

    /** @returns {Promise<Wealth>} */
    static async fromUserId(userId) {
        const doc = await MongooseModel.findOne({ modelName: "Wealth", userId });
        if (doc) {
            const wealth = new Wealth(userId);
            Object.assign(wealth, doc.toObject());
            return wealth;
        }

        return new Wealth(userId);
    }

    async create() {
        await MongooseModel.create({
            modelName: "Wealth",
            userId: this.userId,
            golds: this.golds,
            diamonds: this.diamonds,
            clanGolds: this.clanGolds
        });
    }

    async save() {
        await MongooseModel.updateOne(
            { modelName: "Wealth", userId: this.userId },
            {
                $set: {
                    golds: this.golds,
                    diamonds: this.diamonds,
                    clanGolds: this.clanGolds
                }
            },
            { upsert: true }
        );
    }

    setGold(gold) {
        this.golds = gold;
    }

    getGold() {
        return this.golds;
    }

    setDiamonds(diamonds) {
        this.diamonds = diamonds;
    }

    getDiamonds() {
        return this.diamonds;
    }

    setClanGolds(clanGold) {
        this.clanGolds = clanGold;
    }

    getClanGolds() {
        return this.clanGolds;
    }
};