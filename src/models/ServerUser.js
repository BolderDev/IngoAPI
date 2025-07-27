const crypto = require("crypto");

module.exports = class ServerUser {
    constructor(options) {
        this.id = options.userId;
        this.sex = options.sex;
        this.vip = options.vip;
        this.skin = options.skin;
        this.team = crypto.randomInt(2, 5);
        this.pioneer = true;
        this.rid = 1001;
        this.clz = 0;
    }
}