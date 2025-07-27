const fs = require("fs");
const path = require("path");
const util = require("util");
const constants = require("@common/constants");
const clanConfig = require("@config/clan");
const Currencies = require("@constants/Currencies");
const Clan = require("@models/Clan");
const Page = require("@models/Page");
const Vip = require("@models/Vip");
const Model = require("@schemas/model");

const options = {
  testResetDate: true,
  dateReset: false 
};

const CACHE_FILE_PATH = path.join(__dirname, "donationCache.json");

const donationCache = global.__donationCache__ = global.__donationCache__ || {
  [Currencies.GOLD]: {},
  [Currencies.DIAMOND]: {},
  task: {}
};

function getKey(userId, clanId, type) {
  if (type === Currencies.TASK || type === 2) {
    return util.format(constants.CACHE_USER_DONATION_TASK, userId);
  }
  return util.format(constants.CACHE_USER_DONATION_CURRENCY, userId, clanId);
}

function loadCacheFromFile() {
  if (!fs.existsSync(CACHE_FILE_PATH)) return;
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, "utf8"));
    donationCache[Currencies.GOLD] = data[Currencies.GOLD] || {};
    donationCache[Currencies.DIAMOND] = data[Currencies.DIAMOND] || {};
    donationCache.task = data.task || {};
    console.log("[ClanDonation] ✅ Cache loaded");
  } catch (e) {
    console.error("[ClanDonation] ❌ Failed loading cache:", e);
  }
}

function saveCacheToFile() {
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(donationCache, null, 2));
  console.log("[ClanDonation] 💾 Cache saved");
}

async function flushCacheToDatabase() {
  const docs = [];

  const pushDocs = (obj, type) => {
    for (const [key, amount] of Object.entries(obj)) {
      const keyParts = key.match(/\d+/g);
      const [userId, clanId] = keyParts || [null, null];
      if (userId && clanId) {
        docs.push({
          modelName: "ClanDonation",
          userId,
          clanId,
          type,
          amount,
          creationTime: Date.now()
        });
      }
    }
  };

  pushDocs(donationCache[Currencies.GOLD], Currencies.GOLD);
  pushDocs(donationCache[Currencies.DIAMOND], Currencies.DIAMOND);
  pushDocs(donationCache.task, Currencies.TASK);

  if (docs.length) {
    console.log(`[ClanDonation] 📤 Flushing ${docs.length} cache entries to DB...`);
    await Model.insertMany(docs).catch(err => console.error("[ClanDonation] ❌ DB flush error:", err));
  }
}

function resetDonationCache() {
  donationCache[Currencies.GOLD] = {};
  donationCache[Currencies.DIAMOND] = {};
  donationCache.task = {};
  saveCacheToFile();
  console.log("[ClanDonation] 🔄 Cache reset");
}

(function scheduleReset() {
  if (!options.testResetDate && !options.dateReset) return;

  if (options.testResetDate) {
    setInterval(resetDonationCache, 60 * 1000);
    console.log("[ClanDonation] ⏱ Test reset every 1 min enabled");
  }

  if (options.dateReset) {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(24, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    const delay = next - now;

    setTimeout(() => {
      resetDonationCache();
      setInterval(resetDonationCache, 86400000);
    }, delay);
  }
})();

process.on("SIGINT", async () => {
  saveCacheToFile();
  await flushCacheToDatabase();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  saveCacheToFile();
  await flushCacheToDatabase();
  process.exit(0);
});

function cacheGet(userId, clanId, type) {
  const key = getKey(userId, clanId, type);
  if (type === Currencies.GOLD) return donationCache[Currencies.GOLD][key] || 0;
  if (type === Currencies.DIAMOND) return donationCache[Currencies.DIAMOND][key] || 0;
  if (type === Currencies.TASK || type === 2) return donationCache.task[key] || 0;
  return 0;
}

function cacheAdd(userId, clanId, type, amount = 1) {
  const key = getKey(userId, clanId, type);
  if (type === Currencies.GOLD) {
    donationCache[Currencies.GOLD][key] = (donationCache[Currencies.GOLD][key] || 0) + amount;
  } else if (type === Currencies.DIAMOND) {
    donationCache[Currencies.DIAMOND][key] = (donationCache[Currencies.DIAMOND][key] || 0) + amount;
  } else if (type === Currencies.TASK || type === 2) {
    donationCache.task[key] = (donationCache.task[key] || 0) + 1;
  }
  saveCacheToFile();
}

loadCacheFromFile();

module.exports = class ClanDonation {
  constructor(userId) {
    this.userId = userId;
    this.clanId = 0;
    this.nickName = "";
    this.type = 0;
    this.amount = 0;
    this.expReward = 0;
    this.clanGoldReward = 0;
    this.creationTime = 0;
  }

  static fromJson(json) {
    const d = new ClanDonation(json.userId);
    d.clanId = json.clanId ?? 0;
    d.nickName = json.nickName ?? "";
    d.type = json.type ?? 0;
    d.amount = json.amount ?? 0;
    d.expReward = json.expReward ?? 0;
    d.clanGoldReward = json.clanGoldReward ?? 0;
    d.creationTime = json.creationTime ?? 0;
    return d;
  }

  toJson() {
    return {
      modelName: "ClanDonation",
      userId: this.userId,
      clanId: this.clanId,
      nickName: this.nickName,
      type: this.type,
      amount: this.amount,
      expReward: this.expReward,
      clanGoldReward: this.clanGoldReward,
      creationTime: this.creationTime
    };
  }

  static async historyFromClanId(clanId, pageNo, pageSize) {
    const all = await Model.find({ modelName: "ClanDonation", clanId }).lean();
    const sorted = all.sort((a, b) => b.creationTime - a.creationTime);
    const totalSize = sorted.length;
    const startIndex = Page.getStartIndex(pageNo, pageSize);
    const pageData = sorted.slice(startIndex, startIndex + pageSize).map(ClanDonation.fromJson).map(d => d.response());
    return new Page(pageData, totalSize, pageNo, pageSize);
  }

  async getInfo() {
    if (!this.clanId) return;
    const vip = await Vip.fromUserId(this.userId);
    const clan = await Clan.fromClanId(this.clanId);
    const cfg = clanConfig.levels[clan.level];
    const boost = clanConfig.vipBoosts[vip.getLevel()] || { maxGoldDonate: 1, maxDiamondDonate: 1 };

    return {
      currentGold: cacheGet(this.userId, this.clanId, Currencies.GOLD),
      currentDiamond: cacheGet(this.userId, this.clanId, Currencies.DIAMOND),
      currentTask: cacheGet(this.userId, this.clanId, Currencies.TASK),
      currentExperience: clan.experience,
      clanId: clan.clanId,
      level: clan.level,
      maxDiamond: cfg.maxDiamondDonate * boost.maxDiamondDonate,
      maxExperience: cfg.upgradeExperience,
      maxGold: cfg.maxGoldDonate * boost.maxGoldDonate,
      maxTask: cfg.personalTaskCount + cfg.clanTaskCount
    };
  }

  async save() {
    this.creationTime = Date.now();
    await Model.create(this.toJson());
    cacheAdd(this.userId, this.clanId, this.type, this.amount);
  }

  response() {
    return {
      date: this.creationTime,
      experienceGot: this.expReward,
      nickName: this.nickName,
      quantity: this.amount,
      tribeCurrencyGot: this.clanGoldReward,
      type: this.type,
      userId: this.userId
    };
  }

  setUserId(id) { this.userId = id; } getUserId() { return this.userId; }
  setClanId(id) { this.clanId = id; } getClanId() { return this.clanId; }
  setNickname(name) { this.nickName = name; } getNickname() { return this.nickName; }
  setType(t) { this.type = t; } getType() { return this.type; }
  setAmount(a) { this.amount = a; } getAmount() { return this.amount; }
  setExpReward(r) { this.expReward = r; } getExpReward() { return this.expReward; }
  setClanGoldReward(g) { this.clanGoldReward = g; } getClanGoldReward() { return this.clanGoldReward; }
  setCreationTime(t) { this.creationTime = t; } getCreationTime() { return this.creationTime; }
};
