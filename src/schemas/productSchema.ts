import { z } from "zod";

const decimalSchema = (precision: number, scale: number, minValue? : number) =>
  z
    .string()
    .regex(
      new RegExp(`^\\d{1,${precision - scale}}(\\.\\d{1,${scale}})?$`),
      `Phải là số hợp lệ với tối đa ${precision - scale} số trước dấu thập phân và ${scale} số sau dấu thập phân`
    )
    .transform((val) => parseFloat(val)) // chuyển sang number sau khi validate
    .refine((val) => (minValue !== undefined ? val >= minValue : true),{
      message: `Giá trị phải lớn hơn hoặc bằng ${minValue}`,
    });

export default decimalSchema;

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),

  code: z
    .string()
    .min(1, "Mã sản phẩm là bắt buộc")
    .max(50, "Mã sản phẩm không được vượt quá 50 ký tự"),

  category_id: z
    .number()
    .int()
    .positive(),

  weight: decimalSchema(10, 2),
  gold_price_at_time: decimalSchema(15, 2),
  labor_cost: decimalSchema(15, 2),
  stone_cost: decimalSchema(15, 2).default(0),
  markup_rate: decimalSchema(5, 2),
  selling_price: decimalSchema(15, 2),

  warranty_period: z
    .number()
    .int()
    .nonnegative()
    .default(0),

  image: z
    .string()
    .url("Ảnh sản phẩm phải là một đường dẫn hợp lệ"),

  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const updateProductSchema = createProductSchema.partial();
