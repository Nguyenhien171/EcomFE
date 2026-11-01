import { z } from 'zod'
import { decimalRequired } from './productSchema'

const idSchema = z.number().int().positive()

/** 
Table order_items {
  id int [pk, increment]
  order_id int [not null]
  product_id int [not null] // cross-service
  quantity int [default: 1]
  unit_price decimal(15,2) [not null]
  total_price decimal(15,2) [not null]
}
*/
export const createOrderItemSchema = z
  .object({
    id: idSchema.optional(),
    order_id: idSchema,
    product_id: idSchema,

    quantity: z
      .number()
      .int({ message: 'Số lượng phải là số nguyên' })
      .positive({ message: 'Số lượng phải > 0' })
      .default(1),

    unit_price: decimalRequired(15, 2, 0),
    total_price: decimalRequired(15, 2, 0)
  })
  .superRefine((data, ctx) => {
    const expected = Number(data.unit_price) * Number(data.quantity)
    const diff = Math.abs(Number(data.total_price) - expected)
    if (diff > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['total_price'],
        message: 'total_price phải bằng unit_price × quantity'
      })
    }
  })

export const updateOrderItemSchema = createOrderItemSchema.partial()

export type CreateOrderItemInput = z.input<typeof createOrderItemSchema>
export type CreateOrderItemData = z.infer<typeof createOrderItemSchema>
export type UpdateOrderItemInput = z.input<typeof updateOrderItemSchema>
export type UpdateOrderItemData = z.infer<typeof updateOrderItemSchema>
