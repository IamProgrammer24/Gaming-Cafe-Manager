import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    data: { status: "ok", time: new Date().toISOString() },
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
