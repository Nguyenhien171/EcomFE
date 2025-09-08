import { z } from "zod";

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*[a-zA-Z][a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|vn|net|org|edu|gov|info|io|co)$/;

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;

// Đăng ký
export const registerSchema = z
  .object({
    email: z
      .string()
      .nonempty("Bạn chưa nhập email")
      .regex(emailRegex, "Email không hợp lệ"),
    username: z
      .string()
      .nonempty("Bạn chưa nhập username")
      .min(3, "Username phải có ít nhất 3 ký tự"),
    password: z
      .string()
      .trim()
      .nonempty("Bạn chưa nhập mật khẩu")
      .regex(
        strongPasswordRegex,
        "Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
      ),
    confirmPassword: z
      .string()
      .trim()
      .nonempty("Bạn chưa nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

// Đăng nhập
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty("Bạn chưa nhập email")
    .regex(emailRegex, "Email không hợp lệ"),
  password: z
    .string()
    .trim()
    .nonempty("Bạn chưa nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .refine((val) => val === val.trim(), {
      message: "Mật khẩu không được chứa khoảng trắng",
    }),
  staySignedIn: z.boolean().optional(),
});

