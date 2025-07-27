class MiniGameToken {
    constructor({ token, signature, timestamp, region, dispUrl }) {
        this.token = token;
        this.signature = signature;
        this.timestamp = timestamp;
        this.region = region;
        this.dispUrl = dispUrl;
    }

    toJSON() {
        return {
            token: this.token,
            signature: this.signature,
            timestamp: this.timestamp,
            region: this.region,
            dispUrl: this.dispUrl
        };
    }
}

module.exports = MiniGameToken;
