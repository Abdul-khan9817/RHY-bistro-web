import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

// Trust proxy header (required for accurate rate-limiting behind Nginx/Caddy)
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // SPA requires inline module scripts
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Enable HSTS in production (tells browsers to always use HTTPS)
    hsts: process.env["NODE_ENV"] === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// Remove X-Powered-By (already done by helmet, belt+suspenders)
app.disable("x-powered-by");

// Logging
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS configuration
const allowedOrigins = process.env["CORS_ORIGIN"]
  ? process.env["CORS_ORIGIN"].split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:5000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || process.env["NODE_ENV"] !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers — reduced limit (15 MB was too permissive for most endpoints)
// Upload endpoint handles its own sizing via base64 check
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Serve uploaded media with cache headers
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "30d",
    immutable: false, // uploads can change, so don't set immutable
    etag: true,
    lastModified: true,
  }),
);

// Mount all API endpoints under /api
app.use("/api", router);

// Serve frontend client in production or when client build is present
const clientDistCandidates = [
  path.resolve(process.cwd(), "client/dist/public"),
  path.resolve(process.cwd(), "../client/dist/public"),
  path.resolve(process.cwd(), "rhy-bistro-web/client/dist/public"),
];

const clientDistPath = clientDistCandidates.find((dir) => fs.existsSync(dir));

if (clientDistPath) {
  logger.info({ clientDistPath }, "Serving static frontend client assets");

  // Serve static files with aggressive caching for hashed assets
  app.use(
    express.static(clientDistPath, {
      maxAge: "1y",
      immutable: true,
      etag: true,
      lastModified: false,
      setHeaders(res, filePath) {
        // index.html and non-hashed files must NOT be cached aggressively
        const fileName = path.basename(filePath);
        const isHashedAsset = /\.[a-z0-9]{8,}\.(js|css|png|jpg|webp|svg|woff2?)$/.test(fileName);
        if (!isHashedAsset) {
          res.setHeader("Cache-Control", "no-cache");
          res.removeHeader("Surrogate-Control");
        }
      },
    }),
  );

  // SPA fallback — serve index.html for all non-API GET routes
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const indexPath = path.join(clientDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      // Never cache the SPA shell
      res.setHeader("Cache-Control", "no-cache");
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Central error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled server error");
  // Never leak internal error details to client
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default app;
