import {z} from "zod"
import decimalSchema from "./productSchema"

export const createBuybackPolicySchema = z.object({
  product_type: z
      .string()
      .min(1)
      .max(100),

  buyback_rate: decimalSchema(5,2),

  description: z
      .string()
      .optional(),
})

export const updateBuybacktSchema = createBuybackPolicySchema.partial();