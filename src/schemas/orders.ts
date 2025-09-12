import {z} from "zod"
import decimalSchema from "./productSchema"


export const createOrderSchema = z.object({
  order_number: z
      .string()
      .min(1)
      .max(50),

  customer_id: z
      .number()
      .int(),

  staff_id: z
      .number()
      .int(),

  total_amount: decimalSchema(15,2),

  discount_amount: decimalSchema(15,2).default(0),

  final_amount: decimalSchema(15,2),

  status: z
      .string()
      .min(1)
      .max(20)
      .default("pending")
})

export const updateOrderSchema = createOrderSchema.partial();