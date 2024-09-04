import { z } from "zod";

export const commonValidations = {
  address: z.string().regex(new RegExp(/^(0x)?[0-9a-fA-F]{40}$/)),
  nonce: z.string().length(24),
  // ... other common validations
};
