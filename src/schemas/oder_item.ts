import {z} from "zod"
import decimalSchema from "./productSchema"

export const createOrderItemSchema = z.object({
  order_id: z
  .number()
  .min(1)
  .int(),

  product_id: z
  .number()
  .min(1)
  .int(),

  quantity: z
  .number()
  .int()
  .default(1),

  unit_price: decimalSchema(15,2),

  total_price: decimalSchema(15,2)

})
export const updateOrderItemSchema = createOrderItemSchema.partial();