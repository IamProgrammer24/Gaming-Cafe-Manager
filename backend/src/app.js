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

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    exposedHeaders: ["X-Subscription-Status"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (env.nodeEnv !== "test") app.use(morgan("dev"));

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

app.use(notFound);
app.use(errorHandler);

export default app;
