import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import cafeRoutes from "./modules/cafes/cafe.routes.js";
import deviceRoutes from "./modules/devices/device.routes.js";
import pricingRoutes from "./modules/pricing/pricing.routes.js";
import sessionRoutes from "./modules/sessions/session.routes.js";
import billRoutes from "./modules/bills/bill.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../frontend/dist");
const hasFrontend = fs.existsSync(path.join(distDir, "index.html"));

const app = express();

// The host sits behind a proxy. Without this, every visitor looks like the same IP
// and they would all share one login rate limit.
app.set("trust proxy", env.trustProxy);

// "upgrade-insecure-requests" would break testing on plain http://localhost
const csp = {};
if (!env.useHttps) csp["upgrade-insecure-requests"] = null;

app.use(
  helmet({ contentSecurityPolicy: { useDefaults: true, directives: csp } }),
);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    exposedHeaders: ["X-Subscription-Status"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (env.nodeEnv !== "test")
  app.use(morgan(env.nodeEnv === "production" ? "tiny" : "dev"));

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    data: { status: "ok", time: new Date().toISOString() },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cafe", cafeRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/pricing", pricingRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/admin", adminRoutes);

// The website. Only active when the frontend has been built (npm run build in /frontend).
if (hasFrontend) {
  // Built files have a fingerprint in their name, so browsers can keep them for a year
  app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.use(express.static(distDir, { index: false, maxAge: "1h" }));

  // Any address without a file extension and outside /api gets the app (/dashboard, /setup...)
  app.get(/^\/(?!api(?:\/|$))[^.]*$/, (req, res) => {
    res.set("Cache-Control", "no-cache"); // always fetch the latest index.html
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
