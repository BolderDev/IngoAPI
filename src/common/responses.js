function methodNotAllowed() {
    return {
        status: 400,
        content: {
            code: 400,
            message: "The method is not supported",
            data: null   
        }
    }
}

function notFound() {
    return {
        status: 404,
        content: {
            code: 404,
            message: "The endpoint is not found",
            data: null
        }
    }
}

function success(data) {
    return {
        status: 200,
        content: {
            code: 1,
            message: "SUCCESS",
            data: data ?? null
        }
    }
}

function innerError() {
    return {
        status: 500,
        content: {
            code: 4,
            message: "INNER ERROR",
            data: null
        }
    }
}

function requiresUserAuthParams() {
    return {
        status: 400,
        content: {
            code: 400,
            message: "userId and access-token are expected"
        }
    }
}

function deviceAuthNotAllowed() {
    return {
        status: 200,
        content: {
            code: 2,
            message: "Device authentication is yet to be supported",
            data: null
        }
    }
}

function authFailed() {
    return {
        status: 401,
        content: {
            code: 401,
            message: "userId or access-token is invalid"
        }
    }
}

function userNotExists() {
    return {
        status: 200,
        content: {
            code: 3004,
            message: "The user doesn't exist",
            data: null
        }
    }
}

function invalidPassword() {
    return {
        status: 200,
        content: {
            code: 108,
            message: "The password is invalid",
            data: null
        }
    }
}

function profileNotExists(data) {
    return {
        status: 200,
        content: {
            code: 1002,
            message: "The profile doesn't exist",
            data: data || null
        }
    }
}

function passwordSet() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The password has already been set",
            data: null
        }
    }  
}

function profileExists() {
    return {
        status: 200,
        content: {
            code: 1001,
            message: "The profile already exists",
            data: null
        }
    }
}

function invalidSex() {
    return {
        status: 400,
        content: {
            code: 3,
            message: "The sex must be 1 or 2",
            data: null
        }
    }
}

function missingRegisterParams() {
    return {
        status: 400,
        content: {
            code: 3,
            message: "Expected nickName and sex parameters",
            data: null
        }
    }
}

function notValidUser() {
    return {
        status: 200,
        content: {
            code: 3004,
            message: "The specified friend id is not a valid user",
            data: null
        }
    }
}

function alreadyInClan() {
    return {
        status: 200,
        content: {
            code: 7001,
            message: "The user is already in a clan",
            data: null
        }
    }
}

function clanNotExists() {
    return {
        status: 200,
        content: {
            code: 7101,
            message: "The specified clan doesn't exist",
            data: null
        }
    }
}

function notEnoughPermissions() {
    return {
        status: 200,
        content: {
            code: 7004,
            message: "You don't have enough permissions to do this action",
            data: null
        }
    }
}

function fileNotFound() {
    return {
        status: 404,
        content: {
            code: 404,
            message: "The file you tried to access wasn't found",
            data: null
        }
    }
}

function fileFound(file) {
    return {
        status: 200,
        content: file
    }
}

function dressNotOwned() {
    return {
        status: 200,
        content: {
            code: 4005,
            message: "User doesn't own this decoration",
            data: null
        }
    }
}

function dispatchAuthFailed() {
    return {
        status: 401,
        content: {
            code: 1001,
            info: "Invalid userId or token"
        }
    }
}

function notEnoughWealth(data) {
    return {
        status: 200,
        content: {
            code: 5006,
            message: "Not enough diamonds or gold",
            data: data ?? null
        }
    }
}

function gameNotExists() {
    return {
        status: 200,
        content: {
            code: 2002,
            message: "The specified game does not exist",
            data: null
        }
    }
}

function notInClan() {
    return {
        status: 200,
        content: {
            code: 7006,
            message: "The specified user is not in this clan",
            data: null
        }
    }
}

function invalidDonateQuantity() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "You need to at least donate 1 of any currency",
            data: null
        }
    }
}

function invalidCurrency() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The currency must either be 1 (Diamond) or 2 (Gold)",
            data: null
        }
    }
}

function donationExceedsMax() {
    return {
        status: 200,
        content: {
            code: 7011,
            message: "The quantity exceeds the donation limit for the specified currency",
            data: null
        }
    }
}

function clanMessageNotFound() {
    return {
        status: 200,
        content: {
            code: 11,
            message: "The specified userId was not found in the clan messages",
            data: null
        }
    }
}

function cannotLeaveClan() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The chief cannot leave its members alone!",
            data: null
        }
    }
}

function elderLimitReached() {
    return {
        status: 200,
        content: {
            code: 7010,
            message: "Already have the maximum number of elders",
            data: null
        }
    }
}

function cannotChangeOwnRole() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "You cannnot change your own role",
            data: null
        }
    }
}

function alreadyElder() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The specified member is already an elder",
            data: null
        }
    }
}

function invalidType() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The specified type is invalid",
            data: null
        }
    }
}

function invalidMailStatus() {
    return {
        status: 200,
        content: {
            code: 3,
            message: "The specified status is invalid",
            data: null
        }
    }
}

function mailNotFound() {
    return {
        status: 200,
        content: {
            code: 2,
            message: "The specified mail was not found",
            data: null
        }
    }
}

function mailHasNoAttachments() {
    return {
        status: 200,
        content: {
            code: 2,
            message: "The specified mail doesn't have any attachments",
            data: null
        }
    }
}

function alreadyFriend() {
    return {
        status: 200,
        content: {
            code: 3001,
            message: "You're already friend with this user",
            data: null
        }
    }
}

function friendListFull() {
    return {
        status: 200,
        content: {
            code: 3002,
            message: "Your friend list is full",
            data: null
        }
    }
}

function discordFailed() {
    return {
        status: 400,
        content: {
            code: 2,
            message: "Discord did not respond with 200 (OK)",
            data: null
        }
    }
}

function discordNotBound() {
    return {
        status: 200,
        content: {
            code: 9001,
            message: "You don't have a Discord account bound",
            data: null
        }
    }
}

function discordAlreadyBound() {
    return {
        status: 200,
        content: {
            code: 9002,
            message: "You already have a Discord account bound",
            data: null
        }
    }
}
function insufficientCurrency() {
    return {
        status: 200,
        content: {
            code: 7001,  // You can pick any code number you want here
            message: `Insufficient bcubes to perform this action.`,
            data: null
        }
    };
}

function invalidNicknameFormat() {
    return {
        status: 400,
        content: {
            code: 2,
            success: false,
            message:"Nickname must be 3-20 characters and contain only letters, numbers, or underscores."
        }
    };
}

function NoEmailSet() {
    return {
        status: 400,
        content: {
            success: false,
            message:"No email has been set."
        }
    };
}

function sameNickname() {
    return {
        status: 400,
        content: {
            code: 2,
            success: false,
            message:"New nickname is the same as your current nickname."
        }
    };
}
function nicknameAlreadyUsed() {
    return {
        status: 400, // Conflict
        content: {
            code: 2,  // custom error code, you can pick your own
            message: "Nickname is already in use.",
            data: null
        }
    };
}


function error(message = "An error occurred", code = 500) {
    return {
        status: 500,
        content: {
            code: code,
            message: message,
            data: null
        }
    };
}
function tooManyRequests() {
    return {
        status: 429,
        content: {
            error: "Too Many Requests",
            message: "You have exceeded the request limit. Please try again later.",
            code: 429
        }
    };
}
function clanInsufficientCurrency() {
    return {
        status: 200,
        content: {
            code: 2,  // You can pick any code number you want here
            message: `You need at least 8000 gold to create a clan`,
            data: null
        }
    };
}  


function nicknameTooLong() {
    return {
        status: 200,
        content: {
            code: 2,
            message: 'Nickname cannot surpass the maximum length',
            data: null
        }
    };
}

function nicknameTooShort() {
    return {
        status: 200,
        content: {
            code: 2,
            message: 'Nickname cannot be below the minimum length',
            data: null
        }
    };
}

module.exports = {
    nicknameTooLong: nicknameTooLong,
    nicknameTooShort: nicknameTooShort,
    tooManyRequests: tooManyRequests,
    clanInsufficientCurrency: clanInsufficientCurrency,
    error: error,
    NoEmailSet: NoEmailSet,
    nicknameAlreadyUsed: nicknameAlreadyUsed,
    invalidNicknameFormat: invalidNicknameFormat,
    methodNotAllowed: methodNotAllowed,
    sameNickname: sameNickname,
    notFound: notFound,
    success: success,
    innerError: innerError,
    requiresUserAuthParams: requiresUserAuthParams,
    deviceAuthNotAllowed: deviceAuthNotAllowed,
    authFailed: authFailed,
    userNotExists: userNotExists,
    invalidPassword: invalidPassword,
    profileNotExists: profileNotExists,
    passwordAlreadySet: passwordSet,
    profileExists: profileExists,
    invalidSex: invalidSex,
    insufficientCurrency: insufficientCurrency,
    missingRegisterParams: missingRegisterParams,
    notValidUser: notValidUser,
    alreadyInClan: alreadyInClan,
    clanNotExists: clanNotExists,
    notEnoughPermissions: notEnoughPermissions,
    fileNotFound: fileNotFound,
    fileFound: fileFound,
    dressNotOwned: dressNotOwned,
    dispatchAuthFailed: dispatchAuthFailed,
    notEnoughWealth: notEnoughWealth,
    gameNotExists: gameNotExists,
    notInClan: notInClan,
    invalidDonateQuantity: invalidDonateQuantity,
    invalidCurrency: invalidCurrency,
    donationExceedsMax: donationExceedsMax,
    clanMessageNotFound: clanMessageNotFound,
    cannotLeaveClan: cannotLeaveClan,
    elderLimitReached: elderLimitReached,
    cannotChangeOwnRole: cannotChangeOwnRole,
    alreadyElder: alreadyElder,
    invalidType: invalidType,
    invalidMailStatus: invalidMailStatus,
    mailNotFound: mailNotFound,
    mailHasNoAttachments: mailHasNoAttachments,
    alreadyFriend: alreadyFriend,
    friendListFull: friendListFull,
    discordFailed: discordFailed,
    discordNotBound: discordNotBound,
    discordAlreadyBound: discordAlreadyBound
}
