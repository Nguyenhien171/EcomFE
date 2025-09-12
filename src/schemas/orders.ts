import { z } from 'zod'
import { decimalRequired, decimalOptional } from './productSchema'

/** 
Table orders {
  id int [pk, increment]
  order_number varchar(50) [not null, unique]
  customer_id int [not null] // cross-service
  staff_id int [not null]    // cross-service
  total_amount decimal(15,2) [not null]
  discount_amount decimal(15,2) [default: 0.00]
  final_amount decimal(15,2) [not null]
  status varchar(20) [default: 'pending']
  created_at timestamp []
}
*/

const idSchema = z.number().int().positive()
const statusSchema = z
  .string()
  .min(1, 'Trạng thái là bắt buộc')
  .max(20, 'Trạng thái tối đa 20 ký tự')
  .default('pending')

export const createOrderSchema = z
  .object({
    id: idSchema.optional(),
    order_number: z.string().min(1, 'Mã đơn hàng là bắt buộc').max(50, 'Mã đơn hàng tối đa 50 ký tự'),

    customer_id: idSchema,
    staff_id: idSchema,

    total_amount: decimalRequired(15, 2, 0),
    discount_amount: decimalOptional(15, 2, 0).default(0),
    final_amount: decimalRequired(15, 2, 0),

    status: statusSchema,

    created_at: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date()).optional()
  })
  .superRefine((data, ctx) => {
    const expected = Number(data.total_amount) - Number(data.discount_amount ?? 0)
    const diff = Math.abs(Number(data.final_amount) - expected)
    if (diff > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['final_amount'],
        message: 'final_amount phải bằng total_amount - discount_amount'
      })
    }
  })

export const updateOrderSchema = createOrderSchema.partial()

export type CreateOrderInput = z.input<typeof createOrderSchema>
export type CreateOrderData = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.input<typeof updateOrderSchema>
export type UpdateOrderData = z.infer<typeof updateOrderSchema>
