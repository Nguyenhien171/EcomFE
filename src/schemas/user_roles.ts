import {z} from "zod"

export const assignRolesToUserSchema = z.object({
  user_id: z.number().int().positive(),
  role_ids: z.array(z.number().int().positive()).min(1, "Phải có ít nhất 1 role"),
});