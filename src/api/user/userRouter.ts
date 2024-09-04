import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { userMiddleware } from "@/common/middleware/checkUser";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { SignInSchema, UserSchema, VerifySchema } from "./userModel";

export const userRegistry = new OpenAPIRegistry();

export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
  method: "post",
  path: "/users/sign-in",
  tags: ["User"],
  responses: createApiResponse(z.object({ nonce: commonValidations.nonce }), "Success"),
});

userRegistry.registerPath({
  method: "post",
  path: "/users/verify",
  tags: ["User"],
  responses: createApiResponse(z.object({ user: UserSchema }), "Success"),
});

userRegistry.registerPath({
  method: "get",
  path: "/users/current",
  tags: ["User"],
  responses: createApiResponse(z.union([z.object({ user: UserSchema }), z.null()]), "Success"),
});

userRouter.use(userMiddleware);

userRouter.get("/current", userController.current);
userRouter.post("/verify", validateRequest(VerifySchema), userController.verifySign);

userRouter.post("/sign-in", validateRequest(SignInSchema), userController.signIn);
