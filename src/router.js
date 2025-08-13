// Core
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Common utilities
const dashboardRouter = require("@common/dashboard");
const logger = require("@common/logger");
const responses = require("@common/responses");
const multer = require("@common/multer");
const middlewares = require("@common/middlewares");

// Config
const modules = require("@config/modules");
const requirements = require("@config/requirements");

// ===== User-Agent Validation =====
function validateUserAgent(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  if (userAgent.length < 10) {
    logger.warn(`[UA] Blocked empty/short UA: ${req.ip}`);
    return res.status(403).json({ code: 403, message: "Invalid User-Agent" });
  }

  // Loosened pattern & configurable in future
  const allowedUA = /Mozilla\/|okhttp|Dalvik|Android|iPhone|iPad|Safari\/|Chrome\/|Edge\/|MyGameClient/i;
  if (!allowedUA.test(userAgent)) {
    logger.warn(`[UA] Blocked disallowed UA: ${userAgent} from ${req.ip}`);
    return res.status(403).json({ code: 403, message: "User-Agent not allowed" });
  }

  next();
}

// ===== Rate Limiter Factory =====
function getRateLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req => `${req.ip}-${req.headers['user-agent'] || 'unknown'}`,
    handler: (req, res) => {
      logger.warn(`⛔ Rate limit exceeded for ${req.ip} at ${req.originalUrl}`);
      const response = responses.tooManyRequests();
      res.status(response.status).json(response.content);
    }
  });
}

// ===== Initialize App =====
function init(app) {
  app.use(helmet());
  app.use(require("@common/debugSchemas"));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" })); // NEW
  app.use("/", dashboardRouter);

  // Rate limiters
  const uploadLimiter = getRateLimiter({ windowMs: 30 * 60 * 1000, max: 20 });
  const downloadLimiter = getRateLimiter({ windowMs: 30 * 60 * 1000, max: 2 });

  // Static endpoints
  createStaticEndpoints(app, uploadLimiter, downloadLimiter);

  // Dynamic module endpoints
  for (const mod of modules) {
    try {
      const endpoints = require(`@${mod}-service/controller`);
      if (!Array.isArray(endpoints)) {
        logger.error(`❌ Module ${mod} did not export an array`);
        continue;
      }
      endpoints.forEach(endpoint => createEndpoint(app, endpoint));
    } catch (err) {
      logger.error(`❌ Failed to load module ${mod}:`, err);
    }
  }

  // 404 fallback
  app.all("*", (req, res) => {
    logger.warn(`[404] ${req.method} ${req.originalUrl}`);
    const notFound = responses.notFound();
    res.status(notFound.status).json(notFound.content);
  });

  // Global error handler
  app.use((err, req, res, next) => {
    logger.error(`🔥 Unhandled error at ${req.method} ${req.originalUrl}:`, err);
    const error = responses.innerError();
    res.status(error.status).json(error.content);
  });
}

// ===== Static File APIs =====
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

// ===== Dynamic Endpoint Creator =====
function createEndpoint(app, endpoint) {
  app.all(endpoint.path, async (req, res) => {
    const start = Date.now();
    logger.debug(`[REQ] ${req.method} ${req.originalUrl} Body: ${JSON.stringify(req.body)}`);

    try {
      if (!endpoint.methods.includes(req.method)) {
        const error = responses.methodNotAllowed();
        return res.status(error.status).json(error.content);
      }

      // Auth / Profile checks
      if (!requirements.bypassAuthCheck.includes(endpoint.path)) {
        const auth = await middlewares.userAuthentication(req);
        if (!auth.hasSucceeded) return res.status(auth.response.status).json(auth.response.content);

        if (!requirements.bypassProfileCheck.includes(endpoint.path)) {
          const prof = await middlewares.checkForUserProfile(req);
          if (!prof.hasProfile) return res.status(prof.response.status).json(prof.response.content);
        }
      }

      const handlerIndex = endpoint.methods.indexOf(req.method);
      const response = await endpoint.functions[handlerIndex](req);
      res.status(response.status).json(response.content);
      logger.info(`[OK] ${req.method} ${req.originalUrl} → ${Date.now() - start}ms`);
    } catch (e) {
      logger.error(`❌ API error on ${req.originalUrl}:`, e);
      const error = responses.innerError();
      res.status(error.status).json(error.content);
    }
  });
}

module.exports = init;
