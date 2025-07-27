const { default: axios } = require("axios");
const discordConfig = require("@config/discord");
const responses = require("@common/responses");
const AccountBinding = require("@models/AccountBinding");

async function getDiscordProfile(userId, tokenType, accessToken) {
    const response = await axios.get(`${discordConfig.BASE_ENDPOINT}${discordConfig.USER_URL}`, {
        headers: { "Authorization": `${tokenType} ${accessToken}` }
    }).catch((err) => { return err.response });
    
    if (response.status != 200) {
        return responses.discordFailed();
    }

    const avatarUrl = `${discordConfig.CDN_BASE_ENDPOINT}/avatars/${response.data.id}/${response.data.avatar}.png`;

    return responses.success({
        nickName: response.data.global_name,
        avatar: avatarUrl
    });
}

async function bindDiscordAccount(userId, tokenType, accessToken) {
    const accountBinding = await AccountBinding.fromUserId(userId);
    if (accountBinding.getConnectId() != 0) {
        return responses.discordAlreadyBound();
    }
    
    const response = await axios.get(`${discordConfig.BASE_ENDPOINT}${discordConfig.USER_URL}`, {
        headers: { "Authorization": `${tokenType} ${accessToken}` }
    }).catch((err) => { return err.response });
    
    if (response.status != 200) {
        return responses.discordFailed();
    }

    accountBinding.setConnectId(response.data.id);
    await accountBinding.save();

    return responses.success();
}

async function cancelDiscordBinding(userId, accessToken) {
    const data =  new URLSearchParams({ 
        "client_id": discordConfig.CLIENT_ID,
        "client_secret": discordConfig.CLIENT_SECRET,
        "token": accessToken
    });

    const response = await axios.post(`${discordConfig.BASE_ENDPOINT}${discordConfig.TOKEN_REVOKE_URL}`, data)
                                .catch((err) => { return err.response });

    if (response.status != 200) {
        return responses.discordFailed();
    }

    return responses.success();
}


async function getDiscordBindingStatus(userId) {
    const accountBinding = await AccountBinding.fromUserId(userId);
    return responses.success(accountBinding.response());
}

async function removeDiscordBinding(userId) {
    const accountBinding = await AccountBinding.fromUserId(userId);
    if (accountBinding.getConnectId() == 0) {
        return responses.discordNotBound();
    }

    await accountBinding.delete();
    return responses.success();
}

module.exports = {
    getDiscordProfile: getDiscordProfile,
    bindDiscordAccount: bindDiscordAccount,
    cancelDiscordBinding: cancelDiscordBinding,
    getDiscordBindingStatus: getDiscordBindingStatus,
    removeDiscordBinding: removeDiscordBinding
}