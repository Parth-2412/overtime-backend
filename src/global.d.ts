import type { Request } from "express";
import type { User } from "./api/user/userModel";

declare global {
  interface ExpressRequest extends Request {
    user?: User | null;
  }
}
