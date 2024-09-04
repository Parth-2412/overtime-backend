import { env } from "@/common/utils/envConfig";
import { createClient } from "redis";

export const client = createClient({
  url: env.REDIS_URL,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
});

client.on("error", (error) => {
  console.error("Redis client error:", error);
});

client.connect().then(() => console.log("Connected to Redis"));
