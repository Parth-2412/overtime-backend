import type { User } from "@/api/user/userModel";
import type { RequestHandler } from "express";
import { env } from "../utils/envConfig";

export const userMiddleware: RequestHandler = (req: ExpressRequest, res, next) => {
  const authCookie = req.signedCookies.auth;
  console.log(authCookie);
  let user: User | null;
  if (!authCookie) user = null;
  else {
    const [address, timeCreated] = authCookie.split(":");
    console.log(Date.now() >= timeCreated + env.COOKIE_EXPIRY * 60 * 60 * 1000);
    if (Date.now() >= timeCreated + env.COOKIE_EXPIRY * 60 * 60 * 1000) user = null;
    else {
      user = {
        address,
        role: address === env.ADMIN_ADDRESS ? "admin" : "worker",
      };
    }
  }
  req.user = user;
  next();
};
