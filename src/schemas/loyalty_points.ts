import {z} from "zod"

export const createLoyaltyPointSchema = z.object({
  customer_id: z
      .number()
      .int()
      .min(1),

  points: z
      .number()
      .int()
      .default(0),

  source: z
      .string()
      .min(1)
      .max(50),

  reference_id: z
      .number()
      .int()
      .min(1)
      .optional()
})

export const updateLoyaltySchema = createLoyaltyPointSchema.partial();