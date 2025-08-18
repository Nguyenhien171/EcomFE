import {z} from "zod"


export const creatCustomerVoucherSchema = z.object({
  customer_id: z.number().int().positive(),
  voucher_id: z.number().int().positive(),
  status: z.enum(["unused", "used"]).optional().default("unused"),
  used_at: z.preprocess((val) => val ? new Date(val as string): undefined, z.date().optional() )
})

export const updateCustomerVoucher = creatCustomerVoucherSchema.partial()