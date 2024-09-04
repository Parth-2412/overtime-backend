import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  address: z.string(),
  role: z.union([z.literal("admin"), z.literal("worker")]),
});

export const SignInSchema = z.object({
  body: z.object({ address: commonValidations.address }),
});

export const VerifySchema = z.object({
  body: z.object({ address: commonValidations.address, signedNonce: z.string() }),
});
