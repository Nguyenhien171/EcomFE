import {z} from "zod"
import decimalSchema from "./productSchema"

export const createPaymentSchema = z.object({
  order_id: z
  .number()
  .int()
  .min(1),

  payment_method: z
  .string()
  .min(1)
  .max(50),

  amount: decimalSchema(15,2),

  status: z
  .string()
  .min(1)
  .max(20)
  .default("completed")
})

export const updatePaymentSchema = createPaymentSchema.partial();