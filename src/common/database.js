const fs = require("fs");
const path = require("path");

const { ROOT_DIRECTORY } = require("@common/constants");
const dbConfig = require("@config/database");

function init() {
  const databasePath = path.join(ROOT_DIRECTORY, dbConfig.localPath);

  try {
    if (!fs.existsSync(databasePath)) {
      fs.mkdirSync(databasePath, { recursive: true });
    }
  } catch (err) {
    console.error(`Failed to initialize database directory: ${err.message}`);
    throw err;
  }
}

function keyExists(tableName, subKey) {
  try {
    return fs.existsSync(getDatabasePath(tableName, subKey));
  } catch {
    return false;
  }
}

function getKey(tableName, subKey) {
  const keyPath = getDatabasePath(tableName, subKey);
  try {
    if (!fs.existsSync(keyPath)) return null;

    const data = fs.readFileSync(keyPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read key ${tableName}/${subKey}: ${err.message}`);
    return null;
  }
}

function getAllKeys(tableName) {
  const tablePath = path.join(ROOT_DIRECTORY, dbConfig.localPath, tableName);
  try {
    if (!fs.existsSync(tablePath)) {
      return [];
    }

    return fs.readdirSync(tablePath).map(file =>
      file.endsWith(".json") ? file.slice(0, -5) : file
    );
  } catch (err) {
    console.error(`Failed to list keys in table ${tableName}: ${err.message}`);
    return [];
  }
}

function setKey(tableName, subKey, newData, overwrite = false) {
  const keyPath = getDatabasePath(tableName, subKey);
  const keyDir = path.dirname(keyPath);

  try {
    if (!fs.existsSync(keyDir)) {
      fs.mkdirSync(keyDir, { recursive: true });
    }

    if (!fs.existsSync(keyPath) || overwrite) {
      fs.writeFileSync(keyPath, JSON.stringify(newData, null, 2));
      return;
    }

    // Merge existing and new data
    let keyData = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

    if (Array.isArray(keyData) && Array.isArray(newData)) {
      keyData = newData.concat(keyData);
      keyData = Array.from(new Set(keyData));
    } else if (typeof keyData === 'object' && typeof newData === 'object') {
      Object.assign(keyData, newData);
    } else {
      // If types mismatch or primitive, overwrite
      keyData = newData;
    }

    fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
  } catch (err) {
    console.error(`Failed to set key ${tableName}/${subKey}: ${err.message}`);
  }
}

function removeKey(tableName, subKey) {
  const keyPath = getDatabasePath(tableName, subKey);
  try {
    if (fs.existsSync(keyPath)) {
      fs.unlinkSync(keyPath);
    }
  } catch (err) {
    console.error(`Failed to remove key ${tableName}/${subKey}: ${err.message}`);
  }
}

function getDatabasePath(tableName, subKey) {
  return path.join(ROOT_DIRECTORY, dbConfig.localPath, tableName, `${subKey}.json`);
}

module.exports = {
  init,
  keyExists,
  getKey,
  getAllKeys,
  setKey,
  removeKey,
};
