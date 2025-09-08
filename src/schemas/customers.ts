import {z} from "zod"

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*[a-zA-Z][a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|vn|net|org|edu|gov|info|io|co)$/;

export const createCustomerSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(255),

    phone: z
        .string()
        .min(1)
        .max(20)
        .regex(/^\+?\d{7,15}$/, "Số điện thoại không hợp lệ"),

    email: z
        .string()
        .max(255)
        .regex(emailRegex, "email không hợp lệ"),

    address: z
        .string()
})

export const updateCustomerSchema = createCustomerSchema.partial();