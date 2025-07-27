const mongooseModel = require("@schemas/model");

module.exports = class Account {
constructor(userId = null) {
this.userId = userId;
this.email = "";
this.password = "";
this.creationTime = 0;
this.accessToken = "";
this.loginTime = 0;
}

static async fromUserId(userId) {  
    const row = await mongooseModel.findOne({ modelName: 'account', userId });  
    if (!row) return null;  
    const acc = new Account(userId);  
    Object.assign(acc, row.toObject());  
    return acc;  
}  

async create() {  
    await mongooseModel.create({  
        modelName: 'account',  
        userId: this.userId,  
        email: this.email,  
        password: this.password,  
        creationTime: this.creationTime,  
        accessToken: this.accessToken,  
        loginTime: this.loginTime  
    });  
}  

async save() {  
    await mongooseModel.updateOne(  
        { modelName: 'account', userId: this.userId },  
        {  
            $set: {  
                email: this.email,  
                password: this.password,  
                creationTime: this.creationTime,  
                accessToken: this.accessToken,  
                loginTime: this.loginTime  
            }  
        },  
        { upsert: true }  
    );  
}  

response() {  
    return {  
        userId: this.userId,  
        accessToken: this.accessToken,  
        hasPassword: !!this.password  
    };  
}  

async verifyEmail(code) {  
    const row = await mongooseModel.findOne({  
        modelName: 'email_verification',  
        userId: this.userId  
    });  

    if (!row) {  
        return { success: false, reason: "No verification pending" };  
    }  

    const now = Date.now();  
    if (now > row.expires) {  
        await mongooseModel.deleteOne({ modelName: 'email_verification', userId: this.userId });  
        return { success: false, reason: "Verification code expired" };  
    }  

    const expectedCode = String(row.code).trim();  
    const receivedCode = String(code).trim();  

    if (expectedCode !== receivedCode) {  
        return { success: false, reason: "Invalid verification code" };  
    }  

    const emailToBind = row.email;  
    if (!emailToBind || typeof emailToBind !== "string") {  
        return { success: false, reason: "Verification record is corrupted" };  
    }  

    this.setEmail(emailToBind);  
    await this.save();  
    await mongooseModel.deleteOne({ modelName: 'email_verification', userId: this.userId });  

    return { success: true };  
}  

async unbindEmailWithCode(code) {  
    if (!this.email) {  
        return { success: false, reason: "No email bound to this account" };  
    }  

    const row = await mongooseModel.findOne({  
        modelName: 'email_verification',  
        userId: this.userId,  
        bindType: 1  
    });  

    if (!row) {  
        return { success: false, reason: "No verification code found for unbinding" };  
    }  

    if (Date.now() > row.expires) {  
        await mongooseModel.deleteOne({ modelName: 'email_verification', userId: this.userId });  
        return { success: false, reason: "Verification code expired" };  
    }  

    const expectedCode = String(row.code).trim();  
    const receivedCode = String(code).trim();  
    if (expectedCode !== receivedCode) {  
        return { success: false, reason: "Invalid verification code" };  
    }  

    this.setEmail(null);  
    await this.save();  
    await this.clearEmailVerification();  

    return { success: true };  
}  

async storeEmailVerification(email, bindType = 0) {  
    const code = Math.floor(100000 + Math.random() * 900000).toString();  
    const expires = Date.now() + 5 * 60 * 1000;  

    await mongooseModel.updateOne(  
        { modelName: 'email_verification', userId: this.userId },  
        { $set: { email, code, bindType, expires } },  
        { upsert: true }  
    );  

    return code;  
}  

async clearEmailVerification() {  
    await mongooseModel.deleteOne({  
        modelName: 'email_verification',  
        userId: this.userId  
    });  
}  

// Getters/Setters  
setUserId(userId) { this.userId = userId; }  
getUserId() { return this.userId; }  

setEmail(email) { this.email = email; }  
getEmail() { return this.email; }  

setPassword(password) { this.password = password; }  
getPassword() { return this.password; }  

setCreationTime(creationTime) { this.creationTime = creationTime; }  
getCreationTime() { return this.creationTime; }  

setAccessToken(accessToken) { this.accessToken = accessToken; }  
getAccessToken() { return this.accessToken; }  

setLoginTime(loginTime) { this.loginTime = loginTime; }  
getLoginTime() { return this.loginTime; }

};