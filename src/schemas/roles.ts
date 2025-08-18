import {z} from "zod"

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên vai trò không được để trống")
    .max(500, "Tên vai trò quá dài"),
  description: z
    .string()
    .optional()
    .default(""),
  is_active: z.boolean().default(true),
});

export const updateRoleSchema = createRoleSchema.partial();