import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  ADMIN_ADDRESS: str({ devDefault: "0xc4c23FFCfa9952c59b37e7ce4FbC9468B3A18150" }),
  CORS_ORIGIN: str(),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  COOKIE_SECRET: str(),
  COOKIE_EXPIRY: num(), // in hours
  BACKEND_DOMAIN: str(),
  REDIS_URL: str(),
  REDIS_USERNAME: str(),
  REDIS_PASSWORD: str(),
});
