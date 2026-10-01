import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// Needed only on networks that block Atlas lookups. Never on the live server.
if (env.nodeEnv !== "production") dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log(
    `MongoDB connected: ${mongoose.connection.host} / ${mongoose.connection.name}`,
  );
}
