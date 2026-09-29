#!/usr/bin/env node
/**
 * Research Publishing OS - Production Unified Hostinger Server
 * 
 * Boots all Fastify microservices on internal loopback interfaces
 * and serves the Next.js Web Portal + API Gateway on the single port
 * assigned by Hostinger Passenger (process.env.PORT).
 */

import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Auto-load root .env if present
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {
    console.warn("[Hostinger Server] Notice: Could not auto-load .env file:", e.message);
  }
}

// Config & Defaults
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "rpos-production-secret-must-be-at-least-16-chars";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "rpos-internal-shared-secret";
const NOTIFICATION_URL = "http://127.0.0.1:4004";

console.log("==================================================");
console.log("🚀 Starting Research Publishing OS for Hostinger");
console.log(`📡 Target Listen Port: ${PORT}`);
console.log("==================================================");

// Microservice imports
const { buildApp: buildAuth } = await import("../services/auth/dist/app.js");
const { PrismaUserStore } = await import("../services/auth/dist/prisma-store.js");

const { buildApp: buildSubmission } = await import("../services/submission/dist/app.js");
const { PrismaSubmissionStore } = await import("../services/submission/dist/prisma-store.js");

const { buildApp: buildReview } = await import("../services/review/dist/app.js");
const { PrismaReviewStore } = await import("../services/review/dist/prisma-store.js");

const { buildApp: buildNotification } = await import("../services/notification/dist/app.js");
const { PrismaNotificationStore } = await import("../services/notification/dist/prisma-store.js");

const { buildApp: buildJournal } = await import("../services/journal/dist/app.js");
const { PrismaJournalStore } = await import("../services/journal/dist/prisma-store.js");

const { buildApp: buildFiles } = await import("../services/file-storage/dist/app.js");
const { PrismaFileStore } = await import("../services/file-storage/dist/prisma-store.js");
const { DiskBlobStore } = await import("../services/file-storage/dist/blobs.js");

const { buildApp: buildGateway } = await import("../services/api-gateway/dist/app.js");
const { HttpNotifier } = await import("@rpos/shared");
const { ConsoleMailer } = await import("@rpos/email");

// 1. Boot Internal Microservices
console.log("📦 Booting internal microservices on loopback...");

const authApp = buildAuth({
  users: new PrismaUserStore(),
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  logger: false,
});
await authApp.listen({ port: 4001, host: "127.0.0.1" });
console.log("  ✓ Auth Service listening on 127.0.0.1:4001");

const submissionApp = buildSubmission({
  submissions: new PrismaSubmissionStore(),
  jwtSecret: JWT_SECRET,
  internalSecret: INTERNAL_API_SECRET,
  notificationUrl: NOTIFICATION_URL,
  logger: false,
});
await submissionApp.listen({ port: 4002, host: "127.0.0.1" });
console.log("  ✓ Submission Service listening on 127.0.0.1:4002");

const reviewApp = buildReview({
  reviews: new PrismaReviewStore(),
  jwtSecret: JWT_SECRET,
  notifier: new HttpNotifier(NOTIFICATION_URL, INTERNAL_API_SECRET),
  logger: false,
});
await reviewApp.listen({ port: 4003, host: "127.0.0.1" });
console.log("  ✓ Review Service listening on 127.0.0.1:4003");

const notifApp = buildNotification({
  notifications: new PrismaNotificationStore(),
  mailer: new ConsoleMailer(),
  jwtSecret: JWT_SECRET,
  internalSecret: INTERNAL_API_SECRET,
  logger: false,
});
await notifApp.listen({ port: 4004, host: "127.0.0.1" });
console.log("  ✓ Notification Service listening on 127.0.0.1:4004");

const journalApp = buildJournal({
  journals: new PrismaJournalStore(),
  jwtSecret: JWT_SECRET,
  logger: false,
});
await journalApp.listen({ port: 4005, host: "127.0.0.1" });
console.log("  ✓ Journal Service listening on 127.0.0.1:4005");

const fileApp = buildFiles({
  files: new PrismaFileStore(),
  blobs: new DiskBlobStore(process.env.STORAGE_DIR || path.join(rootDir, "storage/manuscripts")),
  jwtSecret: JWT_SECRET,
  logger: false,
});
await fileApp.listen({ port: 4006, host: "127.0.0.1" });
console.log("  ✓ File Storage Service listening on 127.0.0.1:4006");

// 2. Boot API Gateway
const gatewayApp = buildGateway({
  upstreams: {
    auth: "http://127.0.0.1:4001",
    submission: "http://127.0.0.1:4002",
    review: "http://127.0.0.1:4003",
    notification: "http://127.0.0.1:4004",
    journal: "http://127.0.0.1:4005",
    files: "http://127.0.0.1:4006",
    ai: "http://127.0.0.1:4007",
  },
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  logger: false,
});
await gatewayApp.listen({ port: 4000, host: "127.0.0.1" });
console.log("  ✓ API Gateway listening on 127.0.0.1:4000");

// 3. Initialize Next.js Web App
console.log("🌐 Initializing Next.js Web Portal...");
const nextModule = (await import("next")).default;
const nextApp = nextModule({
  dev: false,
  dir: path.join(rootDir, "apps/web"),
});
const handleNext = nextApp.getRequestHandler();
await nextApp.prepare();
console.log("  ✓ Next.js Web Portal ready");

// 4. Reverse Proxy Helper
function proxyToGateway(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: 4000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("[Gateway Proxy Error]", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "GATEWAY_UNAVAILABLE", message: err.message }));
    }
  });

  req.pipe(proxyReq, { end: true });
}

// 5. Unified HTTP Server for Hostinger Passenger
const server = http.createServer(async (req, res) => {
  // Direct API requests and health checks to API Gateway
  if (req.url.startsWith("/api/") || req.url === "/health" || req.url.startsWith("/health/")) {
    return proxyToGateway(req, res);
  }

  // All UI pages and assets handled by Next.js
  try {
    await handleNext(req, res);
  } catch (err) {
    console.error("[Next.js Error]", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log("==================================================");
  console.log(`✅ Research Publishing OS is LIVE on Hostinger!`);
  console.log(`🔗 URL: http://${HOST}:${PORT}`);
  console.log("==================================================");
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\n🛑 Gracefully shutting down services...");
  server.close();
  await Promise.allSettled([
    authApp.close(),
    submissionApp.close(),
    reviewApp.close(),
    notifApp.close(),
    journalApp.close(),
    fileApp.close(),
    gatewayApp.close(),
  ]);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
