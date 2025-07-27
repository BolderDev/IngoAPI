
const bcrypt = require("@common/bcrypt");
const responses = require("@common/responses");
const identifiers = require("@common/identifiers");
const webtoken = require("@common/webtoken");
const config = require("@config/auth");
const Account = require("@models/Account");
const User = require("@models/User");
const { sendVerificationEmail } = require("@common/email");
const userServiceBase = require("@user-service/base");

const AuthTokenResponse = require("@models/AuthTokenResponse");

async function appAuthToken(userId) {
    const account = await Account.fromUserId(userId);
    if (!account) return responses.userNotExists();

    const hasPassword = !!account.getPassword();
    const hasBinding = false; // Replace when binding is implemented

    const response = new AuthTokenResponse(
        account.getUserId(),
        account.getAccessToken(),
        hasBinding,
        hasPassword
    );

    return responses.success({
            userId: response.userId,
            accessToken: response.accessToken,
            hasBinding: response.hasBinding,
            hasPassword: response.hasPassword
    });
}

async function appRenew() {
const userId = await identifiers.getNextUserId();
const tokenObject = webtoken.create({ userId });

const account = new Account(userId);
account.setAccessToken(tokenObject.dbToken);
account.setCreationTime(Date.now());
await account.create();

account.setAccessToken(tokenObject.userToken);

return responses.success({
userId: account.getUserId(),
accessToken: account.getAccessToken()
});
}

async function appSetPassword(userId, password) {
const account = await Account.fromUserId(userId);
if (account.getPassword()) {
return responses.passwordAlreadySet();
}

const { hash: hashedPassword, salt } = bcrypt.hash(password);  
account.setPassword(`${salt}:${hashedPassword}`);  
await account.save();  

return responses.success();

}


async function appLogin(userId, password) {
    const account = await Account.fromUserId(userId);
    if (!account) return responses.userNotExists();

    const [salt, storedHash] = account.getPassword().split(':');
    const isPasswordValid = bcrypt.verify(password, storedHash, salt);

    if (!isPasswordValid) return responses.invalidPassword();

    // 🔒 Ban Check
    const banInfo = await userServiceBase.getBanInfo(userId);
    if (banInfo.status === 1) {
        return responses.error(`User is banned until ${banInfo.stopToTime}. Reason: ${banInfo.stopReason}`);
    }

    const tokenObject = webtoken.create({ userId: account.userId });
    account.setAccessToken(tokenObject.dbToken);
    account.setLoginTime(Date.now());
    await account.save();

    account.setAccessToken(tokenObject.userToken);

    const isProfileExists = await User.exists(account.getUserId());
    if (!isProfileExists) {
        return responses.profileNotExists(account.response());
    }

    return responses.success(account.response());
}

async function sendEmailBind(userId, accessToken, email, bindType = 0) {
if (!webtoken.verify({ userId, token: accessToken })) {
return responses.invalidToken();
}

const account = await Account.fromUserId(userId);  
if (!account) return responses.userNotExists();  

let targetEmail = email;  

if (bindType === 1) {  
    targetEmail = account.getEmail();  
    if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.includes("@")) {  
        return responses.error("Cannot unbind: no email is currently bound");  
    }  
} else {  
    if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.includes("@")) {  
        return responses.error("Invalid email: not a valid address");  
    }  
    targetEmail = targetEmail.trim().toLowerCase();  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {  
        return responses.error("Invalid email: format incorrect");  
    }  
}  

const code = await account.storeEmailVerification(targetEmail, bindType);  

try {  
    await sendVerificationEmail(targetEmail, code);  
} catch (err) {  
    return responses.error("Failed to send email");  
}  

return responses.success({ message: "Verification code sent" });

}

async function emailBind(userId, accessToken, verifyCode) {
if (!webtoken.verify({ userId, token: accessToken })) {
return responses.invalidToken();
}

const account = await Account.fromUserId(userId);  
if (!account) return responses.userNotExists();  

const result = await account.verifyEmail(verifyCode);  
if (!result.success) return responses.error(result.reason);  

return responses.success({ message: "Email successfully verified and bound" });

}

async function unbindEmail(userId, accessToken, verifyCode) {
if (!webtoken.verify({ userId, token: accessToken })) {
return responses.invalidToken();
}

const account = await Account.fromUserId(userId);  
if (!account) return responses.userNotExists();  

const result = await account.unbindEmailWithCode(verifyCode);  
if (!result.success) return responses.error(result.reason);  

return responses.success({ message: "Email unbound successfully" });

}

async function modifyPassword(userId, currentPassword, newPassword) {
const account = await Account.fromUserId(userId);
if (!account) return responses.userNotExists();

const [salt, storedHash] = account.getPassword().split(':');  
const isPasswordValid = bcrypt.verify(currentPassword, storedHash, salt);  
if (!isPasswordValid) return responses.invalidPassword();  

const { hash: newHash, salt: newSalt } = bcrypt.hash(newPassword);  
account.setPassword(`${newSalt}:${newHash}`);  
await account.save();  

return responses.success();

}


module.exports = {
unbindEmail,
sendEmailBind,
emailBind,
appAuthToken,
appLogin,
appRenew,
appSetPassword,
modifyPassword
};
