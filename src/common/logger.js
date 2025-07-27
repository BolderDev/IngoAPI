const chalk = require("chalk");
const https = require("https");
const { URL } = require("url");

// 🔧 Webhook URL
const WEBHOOK_URL = process.env.LOG_WEBHOOK_URL || "https://discord.com/api/webhooks/1388855847400116244/cCMVpnKRtGxLUwxPbkKDO97fwEwqP3QduJDE-wqRS4_vXGdEoHeQZPtOLmuv5-aGo3JW";

function getLogColors(type) {
switch (type.toLowerCase()) {
case "debug": return { type: chalk.green.bold, message: chalk.greenBright };
case "info": return { type: chalk.blue.bold, message: chalk.white };
case "warn": return { type: chalk.yellow.bold, message: chalk.yellowBright };
case "error": return { type: chalk.red.bold, message: chalk.red };
case "fatal": return { type: chalk.bgRed.white.bold, message: chalk.bgRed.white };
default: return { type: chalk.white.bold, message: chalk.white };
}
}

function log(type, message, additionalData = {}) {
const now = new Date();
const colors = getLogColors(type);
const dateStr = chalk.gray(now.toLocaleString());
const typeStr = colors.type(`[${type.toUpperCase()}]`);
const msgStr = colors.message(message);

console.log(`${dateStr} ${typeStr} ${msgStr}`);  

let webhookPayload = {};  

// If res or response is passed in additionalData  
if (additionalData?.res) {  
    const res = additionalData.res;  
    webhookPayload.response = {  
        status: res.statusCode || res.status,  
        headers: res.getHeaders ? res.getHeaders() : undefined  
    };  
} else if (additionalData?.response) {  
    const resp = additionalData.response;  
    webhookPayload.response = {  
        status: resp.status,  
        content: resp.content  
    };  
}  

// Remove the response object to avoid logging whole stream  
const filteredData = { ...additionalData };  
delete filteredData.res;  
delete filteredData.response;  

if (Object.keys(filteredData).length > 0) {  
    console.log(chalk.gray(JSON.stringify(filteredData, null, 2)));  
    webhookPayload.extra = filteredData;  
}  

sendToWebhook(type, message, webhookPayload);

}

function debug(value, data = {}) {
log("debug", formatMessage(value), data);
}

function info(value, data = {}) {
log("info", formatMessage(value), data);
}

function warn(value, data = {}) {
log("warn", formatMessage(value), data);
}

function error(value, data = {}) {
const { message, stack } = parseError(value);
log("error", message, { ...data, stack });
}

function fatal(value, data = {}) {
const { message, stack } = parseError(value);
log("fatal", message, { ...data, stack });
}

function parseError(value) {
let message = value;
let stack = null;

if (typeof value === "object" && value.message) {  
    message = value.message;  
    stack = value.stack || null;  
} else if (typeof value === "object") {  
    message = JSON.stringify(value);  
}  

return { message, stack };

}

function formatMessage(value) {
return typeof value === "object" ? JSON.stringify(value) : value;
}

function sendToWebhook(level, message, payload = {}) {
if (!WEBHOOK_URL) return;

const url = new URL(WEBHOOK_URL);  
const body = JSON.stringify({  
    username: "Logger",  
    content: `**[${level.toUpperCase()}]** ${message}` +  
        (payload.response ? `\n\n**Response:**\n\`\`\`json\n${JSON.stringify(payload.response, null, 2)}\n\`\`\`` : "") +  
        (payload.extra ? `\n\n**Extra:**\n\`\`\`json\n${JSON.stringify(payload.extra, null, 2)}\n\`\`\`` : "")  
});  

const options = {  
    hostname: url.hostname,  
    port: 443,  
    path: url.pathname + url.search,  
    method: "POST",  
    headers: {  
        "Content-Type": "application/json",  
        "Content-Length": Buffer.byteLength(body)  
    }  
};  

const req = https.request(options, (res) => {  
    res.on("data", () => {}); // noop  
});  

req.on("error", (err) => {  
    console.error("[LOGGER] Webhook error:", err.message);  
});  

req.write(body);  
req.end();

}

module.exports = {
debug,
info,
warn,
error,
fatal
};