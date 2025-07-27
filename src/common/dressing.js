const multer = require("@common/multer");
const constants = require("@common/constants");
const logger = require("@common/logger");

const config = require("@config/host");

const dressingTypes = {
    "2": "hair",
    "3": "glasses",
    "4": "face",
    "5": "idle",
    "6": "skin",
    "7": "background",
    "8": "tops",
    "9": "pants",
    "10": "shoes",
    "11": "hat",
    "13": "scarf",
    "14": "wing",
    "15": "crown"
};

const dressesCategory = {
    "8":  1,
    "9":  1,
    "10": 1,
    "2":  2,
    "11": 3,
    "13": 3,
    "14": 3,
    "15": 3,
    "3":  3,
    "4":  4,
    "5":  5,
    "6":  6,
    "7":  7
};

const dressesGameType = {
    "2": "custom_hair",
    "3": "custom_glasses",
    "4": "custom_face",
    "5": "animation_idle",
    "6": "skin_color",
    "8": "clothes_tops",
    "9": "clothes_pants",
    "10": "custom_shoes",
    "11": "custom_hat",
    "13": "custom_scarf",
    "14": "custom_wing",
    "15": "custom_crown"
};

const decorationCategories = {};

/**
 * Loads decoration data from disk
 */
function init() {
    for (const typeId of Object.keys(dressesCategory)) {
        const categoryId = dressesCategory[typeId];
        const response = multer.getFile(`${constants.DECORATION_PATH}/${dressingTypes[typeId]}.json`);

        if (response.status !== 200) {
            logger.error(`DRESSING ERROR: FAILED AT OBJECT '${dressingTypes[typeId]}'`);
            break;
        }

        decorationCategories[categoryId] ??= [];

        const data = JSON.parse(response.content);
        for (let item of data) {
            item.iconUrl = item.iconUrl.replace(
                "{base}",
                `${config.cdnHost}/database/files/icons`
            );
        }

        decorationCategories[categoryId] = decorationCategories[categoryId].concat(data);
    }
}

/**
 * Returns list of dresses filtered by options (categoryId required)
 */
function getDresses(options) {
    const categoryList = decorationCategories[options.categoryId];
    if (!Array.isArray(categoryList)) {
        return [];
    }

    const userSex = Number(options.sex || 0);
    const allowedSex = [0];
    if (userSex === 1 || userSex === 2) {
        allowedSex.push(userSex);
    }

    return categoryList.filter((item) => {
        item.status = 0;

        if (options.usingFilter && options.usingFilter.includes(item.id)) {
            item.status = 1;
            return true;
        }

        if (options.ownerFilter && options.ownerType === 1) {
            return options.ownerFilter.includes(item.id);
        }

        if (options.hideClanDresses && item.clanLevel > 0) {
            return false;
        }

        if (options.hideFreeDresses && item.currency === 0) {
            return false;
        }

        const sexMatch = allowedSex.includes(Number(item.sex));
        const currencyMatch = item.currency === options.currency || options.currency === 0;

        if (options.ownerFilter && options.ownerType === 2 && options.ownerFilter.includes(item.id)) {
            item.hasPurchase = 1;
        }

        return sexMatch && currencyMatch;
    });
}

/**
 * Gets info for one dress by ID
 */
function getDressInfo(decorationId) {
    if (!decorationId || decorationId.toString().length <= 5) return null;

    const idStr = decorationId.toString();
    const typeId = idStr.substring(0, idStr.length - 5);
    const categoryId = dressesCategory[typeId];
    if (!categoryId || !decorationCategories[categoryId]) return null;

    return decorationCategories[categoryId].find(item => item.id.toString() === idStr) || null;
}

/**
 * Maps decoration IDs to game resource keys
 */
function getGameDresses(decorationIds = []) {
    const skin = {};

    for (const id of decorationIds) {
        const info = getDressInfo(id);
        if (!info || !dressesGameType[info.typeId]) continue;

        const key = dressesGameType[info.typeId];
        skin[key] = (info.typeId === 6)
            ? info.resourceId
            : info.resourceId.split(".")[1]; // Strip filename prefix
    }

    return skin;
}

module.exports = {
    init,
    getDresses,
    getDressInfo,
    getGameDresses
};