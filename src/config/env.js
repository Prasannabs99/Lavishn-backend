import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set in environment variables.`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || "support@lavishn.com",
  adminSeed: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || "Admin",
  },
};
