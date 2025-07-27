const webtoken = require("@common/webtoken");

const Account = require("@models/Account");
const responses = require("@common/responses");
const User = require("@models/User");

async function userAuthentication(request) {
    // Helper to parse userId from headers
    request.getUserId = () => {
        return parseInt(request.headers["userid"]);
    };

    const userId = request.getUserId();
    const accessToken = request.headers["access-token"];

    // Check if required headers exist
    if (!userId || !accessToken) {
        return { hasSucceeded: false, response: responses.requiresUserAuthParams() };
    }

    // Fetch account by userId
    const account = await Account.fromUserId(userId);

    if (!account) {
        // No account found for userId
        return { hasSucceeded: false, response: responses.authFailed() };
    }

    // Verify access token against account's stored token
    const { isValid } = webtoken.verify(accessToken, account.getAccessToken());

    if (!isValid) {
        return { hasSucceeded: false, response: responses.authFailed() };
    }

    return { hasSucceeded: true };
}

async function checkForUserProfile(request) {
    const userId = request.getUserId();

    // Check if user profile exists
    const isUserExists = await User.exists(userId);

    if (!isUserExists) {
        return { hasProfile: false, response: responses.profileNotExists() };
    }

    return { hasProfile: true };
}

module.exports = {
    userAuthentication,
    checkForUserProfile
};