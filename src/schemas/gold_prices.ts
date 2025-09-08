import {z} from "zod"
import decimalSchema from "./productSchema"

export const createGoldPriceSchema = z.object({
  gold_type: z
      .string()
      .min(1)
      .max(50),

  buy_price: decimalSchema(15,2),

  sell_price: decimalSchema(15,2),

  date: z.string().refine((val) => !isNaN(Date.parse(val)),{
    message: "date không hợp lệ "
  }).transform((val) => new Date(val))

})

export const updateGoldPriceSchema = createGoldPriceSchema.partial();