const { dirname } = require("path");

const wealthTypes = {
    "0": "all",
    "1": "diamonds",
    "2": "golds",
    "3": "clanGolds"
}

module.exports = {
    ROOT_DIRECTORY: `${dirname(require.main.filename)}/..`,

    CACHE_USER_DONATION_CURRENCY: "cache.donation.%s.%s",
    CACHE_USER_DONATION_TASK: "cache.donation.task.%s",
    CACHE_ACTIVITY_FREE_WHEEL: "cache.activity.wheel.free.%s",
    CACHE_GAME_ACCOUNT: "cache.game.token.%s",

    DB_NOTICES_TABLE: "notices",
    DB_APP_CONFIG_TABLE: "appconfigs",
    DB_GAME_CONFIG_TABLE: "gameconfigs",
    DB_ACCOUNT_TABLE: "accounts",
    DB_LOCALIZATION_TABLE: "localization",
    DB_USER_TABLE: "users",
    DB_WEALTH_TABLE: "wealth",
    DB_WEALTH_RECORD_TABLE: "wealth/records",
    DB_FRIEND_TABLE: "friends",
    DB_FRIEND_REQUEST_TABLE: "friends/requests",
    DB_GAME_STATUS_TABLE: "game/status",
    DB_GAME_TOKEN_TABLE: "game/tokens",
    DB_GAME_LIKES_TABLE: "game/likes",
    DB_CLAN_TABLE: "clans",
    DB_CLAN_MEMBERS_TABLE: "clans/members",
    DB_CLAN_NOTICE_TABLE: "clans/noticeboards",
    DB_CLAN_REQUEST_TABLE: "clans/requests",
    DB_CLAN_MESSAGE_TABLE: "clans/messages",
    DB_CLAN_CONTRIBUTION_TABLE: "clans/contribution",
    DB_CLAN_HISTORY_TABLE: "clans/history",
    DB_MAIL_TABLE: "appmails",
    DB_MAIL_READ_TABLE: "appmails/read",
    DB_DECORATION_TABLE: "decorations",
    DB_DECORATION_USING_TABLE: "decorations/using",

    DB_MAIL_KEY: "all",
    
    DECORATION_PATH: "decorations",
    
    WEALTH_TYPES: wealthTypes
}