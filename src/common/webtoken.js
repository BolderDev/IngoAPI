const crypto = require("crypto");
const authConfig = require("@config/auth");

function create(payload) {
    let salt = crypto.randomBytes(32).toString("base64")
                                     .replace(/=+$/, "");

    payload = JSON.stringify(payload);
    payload = Buffer.from(payload).toString("base64")
                                  .replace(/=+$/, "");
    
    const dbToken = `${salt}.${payload}`;
    const userToken = `${salt}.${payload}.${crypto.createHmac("sha256", authConfig.tokenSecretKey)
                                                  .update(`${salt}.${payload}`)
                                                  .digest("base64")}`;

    return {
      dbToken: dbToken,
      userToken: userToken
    };
}

function verify(userToken, dbToken) {
   if (!userToken || !dbToken) {
      return { isValid: false, err: "empty" }
   }

   let [ salt, payload, signature] = userToken.split('.');
   if (!salt || !signature) {
      return { isValid: false, err: "format" }
   }

   const userComputedSignature = crypto.createHmac("sha256", authConfig.tokenSecretKey)
                                       .update(`${salt}.${payload}`)
                                       .digest("base64");

   if (signature.length != userComputedSignature.length) {
      return { isValid: false, err: "user: token length doesn't match" }
   }

   if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(userComputedSignature))) {
      return { isValid: false, err: "user: token is invalid" }
   }

   const dbComputedToken = crypto.createHmac("sha256", authConfig.tokenSecretKey)
                                 .update(dbToken)
                                 .digest("base64");
   
   if (signature.length != dbComputedToken.length) {
      return { isValid: false, err: "server: token length doesn't match" }
   }

   let isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(dbComputedToken));
   return { isValid: isValid, payload: payload, err: isValid == false ? "server: token is invalid" : null }
}

module.exports = {
   create: create,
   verify: verify
}