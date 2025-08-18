import {z} from "zod"
import decimalSchema from "./productSchema"

export const createVoucherSchema = z.object({
  code: z
      .string()
      .min(1)
      .max(50),

  description: z
      .string()
      .optional(),

  discount_type: z
      .string()
      .min(1)
      .max(20),

  discount_value: decimalSchema(15,2),

  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "start_date phải là ngày hợp lệ"
  }).transform((val) => new Date(val)),

  end_date: z.string().refine((val) => !isNaN(Date.parse(val)),{
    message: "end_date phải là ngày hợp lệ"
  }).transform((val) => new Date(val)),

  usage_limit: z
      .number()
      .int()
      .default(1),
})

export const updateVoucherSchema = createVoucherSchema.partial();