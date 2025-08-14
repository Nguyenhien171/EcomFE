import {z} from "zod"

export const createPermissionSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(500, "Tối đa 500 ký tự"),
    description: z
        .string()
        .optional()
        .default(""),
    path: z
        .string()
        .min(1)
        .max(1000)
        .regex(/^\/[^\s]*$/, "Path phải bắt đầu bằng '/' và không chứa khoảng trắng"),
    method: z
        .enum(["GET", "POST", "PUT", "DELETE"]),
    module: z
        .string()
        .max(500)
        .default(""),
});

export const updatePermissionSchema = createPermissionSchema.partial();
