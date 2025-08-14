import {z} from "zod"


export const assignPermissionsToRoleSchema = z.object({
  role_id: z.number().int().positive(),
  permission_ids: z.array(z.number().int().positive()).min(1, "Phải có ít nhất 1 permission"),
});
