const MongooseModel = require("@schemas/model");

module.exports = class Localization {
    constructor(userId) {
        this.userId = userId;
        this.language = "";
        this.country = "";
    }

    static async fromUserId(userId) {
        const doc = await MongooseModel.findOne({ modelName: "Localization", userId });
        if (doc) {
            const loc = new Localization(userId);
            Object.assign(loc, doc.toObject());
            return loc;
        }
        return new Localization(userId);
    }

    async create() {
        await MongooseModel.create({
            modelName: "Localization",
            userId: this.userId,
            language: this.language,
            country: this.country
        });
    }

    async save() {
        await MongooseModel.updateOne(
            { modelName: "Localization", userId: this.userId },
            {
                $set: {
                    language: this.language,
                    country: this.country
                }
            },
            { upsert: true }
        );
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setLanguage(language) {
        this.language = language;
    }

    getLanguage() {
        return this.language;
    }

    setCountry(country) {
        this.country = country;
    }

    getCountry() {
        return this.country;
    }
};