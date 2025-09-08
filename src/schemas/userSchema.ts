import { z } from "zod";

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*[a-zA-Z][a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|vn|net|org|edu|gov|info|io|co)$/;

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;

export const createUserSchema = z.object({
  username: z.string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(50, "Username tối đa 50 ký tự"),
  password: z.string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(
        strongPasswordRegex,
        "Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
      ),
  full_name: z
    .string()
    .min(1, "Họ tên không được bỏ trống")
    .max(255, "Tối đa 50 ký tự"),
  email:
    z.string()
    .regex(emailRegex, "email không hợp lệ")
    .max(255),
  phone:
    z.string()
    .regex(/^\+?\d{7,15}$/, "Số điện thoại không hợp lệ")
    .max(20),
  role: 
    z.enum(["Staff", "Manager", "Admin"]),
  status:
    z.enum(["active", "inactive"]).optional(),
});

export const updateUserSchema = createUserSchema.partial();