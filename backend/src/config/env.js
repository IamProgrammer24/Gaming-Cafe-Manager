import "dotenv/config";

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  trialDays: 15,
  graceDays: 5,
};
