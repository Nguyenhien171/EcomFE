import {z} from "zod"

export const productCategorySchema = z.object({
  name: z.string().min(1).max
})

export const updateProductCategorySchema = productCategorySchema.partial();