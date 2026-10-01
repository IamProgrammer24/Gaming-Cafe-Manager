import "dotenv/config";

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const useHttps = clientUrl.startsWith("https://");
const proxies =
  process.env.TRUST_PROXY === undefined ? 1 : Number(process.env.TRUST_PROXY);

if (process.env.NODE_ENV === "production") {
  const problems = [];
  if (!useHttps)
    problems.push("CLIENT_URL must start with https:// in production");
  if (process.env.JWT_ACCESS_SECRET.length < 32)
    problems.push("JWT_ACCESS_SECRET must be at least 32 characters");
  if (process.env.JWT_REFRESH_SECRET.length < 32)
    problems.push("JWT_REFRESH_SECRET must be at least 32 characters");
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET)
    problems.push("The two JWT secrets must be different");
  if (problems.length) {
    console.error(`Unsafe production settings:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl,
  useHttps,
  trustProxy: Number.isInteger(proxies) && proxies >= 0 ? proxies : 1,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  trialDays: 15,
  graceDays: 5,
};
