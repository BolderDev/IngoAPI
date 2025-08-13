const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomBytes } = require("crypto");

const hostConfig = require("@config/host");
const dbConfig = require("@config/database");
const constants = require("@common/constants");
const responses = require("@common/responses");

const storage = multer.diskStorage({
  destination: dbConfig.storage,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const randomPart = randomBytes(4).toString("hex");
    const fileName = `${Date.now()}-${randomPart}${extension}`;
    callback(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 // 1MB
  }
});

function getFullPath(fileName) {
  const base = `${hostConfig.baseHost}:${hostConfig.apiPort}`;
  // Use path.posix.join to ensure forward slashes in URL
  return new URL(path.posix.join(dbConfig.storage, fileName), base).toString();
}

function getFile(fileName) {
  const filePath = path.join(constants.ROOT_DIRECTORY, dbConfig.storage, fileName);
  try {
    if (!fs.existsSync(filePath)) {
      return responses.fileNotFound();
    }
    const content = fs.readFileSync(filePath);
    return responses.fileFound(content);
  } catch (err) {
    console.error(`Error reading file ${fileName}:`, err);
    return responses.innerError();
  }
}

module.exports = {
  upload,
  getFullPath,
  getFile
};
