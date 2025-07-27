const multer = require("multer");
const path = require("path");
const fs = require("fs");

const hostConfig = require("@config/host");
const dbConfig = require("@config/database");
const constants = require("@common/constants");
const responses = require("@common/responses");

const storage = multer.diskStorage({
    destination: dbConfig.storage,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Date.now()}${extension}`;
        callback(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: { 
       fileSize: 1024 * 1024
    }
});

function getFullPath(fileName) {
    return `${hostConfig.baseHost}:${hostConfig.apiPort}/${dbConfig.storage}/${fileName}`;
}

function getFile(fileName) {
    const filePath = `${constants.ROOT_DIRECTORY}/${dbConfig.storage}/${fileName}`;
    if (!fs.existsSync(filePath)) {
        return responses.fileNotFound();
    }
    
    return responses.fileFound(fs.readFileSync(filePath));
}

module.exports = {
    upload: upload,
    getFullPath: getFullPath,
    getFile: getFile
}