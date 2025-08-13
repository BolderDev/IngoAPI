const webtoken = require("@common/webtoken");

const Account = require("@models/Account");
const responses = require("@common/responses");
const User = require("@models/User");

async function userAuthentication(request) {
  // Helper to parse userId as number
  request.getUserId = () => {
    const id = Number(request.headers["userid"]);
    return isNaN(id) ? null : id;
  };

  const userId = request.getUserId();
  const accessToken = request.headers["access-token"];

  if (!userId || !accessToken) {
    return { hasSucceeded: false, response: responses.requiresUserAuthParams() };
  }

  let account;
  try {
    account = await Account.fromUserId(userId);
  } catch (err) {
    // Log error if you want: console.error(err);
    return { hasSucceeded: false, response: responses.authFailed() };
  }

  if (!account) {
    return { hasSucceeded: false, response: responses.authFailed() };
  }

  const { isValid } = webtoken.verify(accessToken, account.getAccessToken());

  if (!isValid) {
    return { hasSucceeded: false, response: responses.authFailed() };
  }

  // Attach user info for downstream use
  request.user = { id: userId, account };

  return { hasSucceeded: true };
}

async function checkForUserProfile(request) {
  const userId = request.getUserId();

  if (!userId) {
    return { hasProfile: false, response: responses.profileNotExists() };
  }

  let isUserExists;
  try {
    isUserExists = await User.exists(userId);
  } catch (err) {
    // Optionally log error
    return { hasProfile: false, response: responses.profileNotExists() };
  }

  if (!isUserExists) {
    return { hasProfile: false, response: responses.profileNotExists() };
  }

  return { hasProfile: true };
}

module.exports = {
  userAuthentication,
  checkForUserProfile
};
