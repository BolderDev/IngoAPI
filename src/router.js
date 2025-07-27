const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dashboardRouter = require("@common/dashboard");
const logger = require("@common/logger");
const responses = require("@common/responses");
const multer = require("@common/multer");
const middlewares = require("@common/middlewares");
const modules = require("@config/modules");
const requirements = require("@config/requirements");

// ✅ Strict User-Agent validation middleware
function validateUserAgent(req, res, next) {
  const userAgent = req.headers["user-agent"];
  if (!userAgent || userAgent.length < 10) {
    logger.warn(`[UA] Blocked empty/short UA: ${req.ip}`);
    return res.status(403).json({
      code: 403,
      message: "Invalid User-Agent"
    });
  }

  const isAllowedUA = /Mozilla\/|okhttp|Dalvik|Android|iPhone|iPad|Safari\/|Chrome\/|Edge\/|MyGameClient/i.test(userAgent);
  if (!isAllowedUA) {
    logger.warn(`[UA] Blocked disallowed UA: ${userAgent} from ${req.ip}`);
    return res.status(403).json({
      code: 403,
      message: "User-Agent not allowed"
    });
  }

  next();
}

// ✅ Custom rate limiter with IP+UA-based key
function getRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req => {
      const ua = req.headers['user-agent'] || "unknown";
      return `${req.ip}-${ua}`; // IP + UA pair to prevent spoofing
    },
    handler: (req, res) => {
      logger.warn(`⛔ Rate limit exceeded for ${req.ip} at ${req.originalUrl}`);
      const response = responses.tooManyRequests();
      res.status(response.status).json(response.content);
    },
    message
  });
}

function init(app) {
  app.use(helmet());
  app.use(require("@common/debugSchemas"));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use("/", dashboardRouter);

  // ✅ Upload rate limiter (20 per 30min)
  const uploadLimiter = getRateLimiter({
    windowMs: 30 * 60 * 1000,
    max: 20,
    message: "Upload rate limit exceeded"
  });

  // ✅ Download rate limiter (2 per 30min)
  const downloadLimiter = getRateLimiter({
    windowMs: 30 * 60 * 1000,
    max: 2,
    message: "Download limit exceeded"
  });

  // Static file APIs
  createStaticEndpoints(app, uploadLimiter, downloadLimiter);

  
  // Module-based endpoints
  for (const mod of modules) {
    const endpoints = require(`@${mod}-service/controller`);
    endpoints.forEach(endpoint => createEndpoint(app, endpoint));
  }

  // 404 fallback
  app.all("*", (req, res) => {
    const notFound = responses.notFound();
    logger.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(notFound.status).json(notFound.content);
  });
}

function createStaticEndpoints(app, uploadLimiter, downloadLimiter) {
  app.post("/user/api/v1/file", uploadLimiter, multer.upload.any(), (req, res) => {
    if (!req.files?.length) {
      const error = responses.innerError();
      return res.status(error.status).json(error.content);
    }

    const fullPath = multer.getFullPath(req.files[0].filename);
    const success = responses.success(fullPath);
    res.status(success.status).json(success.content);
  });

  app.get("/database/files/*", downloadLimiter, validateUserAgent, (req, res) => {
    const response = multer.getFile(req.params[0]);
    res.status(response.status).send(response.content);
  });
}

function createEndpoint(app, endpoint) {
  app.all(endpoint.path, async (req, res) => {
    const start = Date.now();
    try {
      if (!endpoint.methods.includes(req.method)) {
        const error = responses.methodNotAllowed();
        return res.status(error.status).json(error.content);
      }

      // Auth and profile check
      if (!requirements.bypassAuthCheck.includes(endpoint.path)) {
        const auth = await middlewares.userAuthentication(req);
        if (!auth.hasSucceeded) return res.status(auth.response.status).json(auth.response.content);

        if (!requirements.bypassProfileCheck.includes(endpoint.path)) {
          const prof = await middlewares.checkForUserProfile(req);
          if (!prof.hasProfile) return res.status(prof.response.status).json(prof.response.content);
        }
      }

      const response = await endpoint.functions[endpoint.methods.indexOf(req.method)](req);
      res.status(response.status).json(response.content);
      logger.info(`[${req.method}] ${req.originalUrl} → ${Date.now() - start}ms`);
    } catch (e) {
      logger.error(`❌ API error on ${req.originalUrl}:`, e);
      const error = responses.innerError();
      res.status(error.status).json(error.content);
    }
  });
}


function getActiveEndpoints(app) {
  const routes = [];

  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      routes.push({ path: layer.route.path, methods });
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach((r) => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase());
          routes.push({ path: r.route.path, methods });
        }
      });
    }
  });

  return routes;
}

module.exports = init;