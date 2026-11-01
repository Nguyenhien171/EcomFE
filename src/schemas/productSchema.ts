import { z } from 'zod'

/** ---- Helpers ---- */
const toNumber = (v: unknown) => {
  if (typeof v === 'string') {
    const s = v.trim()
    if (s === '') return Number.NaN
    return parseFloat(s.replace(',', '.'))
  }
  return v
}

const decimalBase = (precision: number, scale: number, minValue?: number) =>
  z
    .preprocess(toNumber, z.number())
    .refine((val) => Number.isFinite(val), { message: 'Phải là số hợp lệ' })
    .refine((val) => new RegExp(`^\\d{1,${precision - scale}}(\\.\\d{1,${scale}})?$`).test(String(val)), {
      message: `Phải là số hợp lệ với tối đa ${precision - scale} số trước dấu thập phân và ${scale} số sau dấu thập phân`
    })
    .refine((val) => (minValue !== undefined ? val >= minValue : true), {
      message: `Giá trị phải lớn hơn hoặc bằng ${minValue}`
    })

// Bắt buộc
export const decimalRequired = (precision: number, scale: number, minValue?: number) =>
  decimalBase(precision, scale, minValue)

// Tuỳ chọn (được phép để trống)
export const decimalOptional = (precision: number, scale: number, minValue?: number) =>
  decimalBase(precision, scale, minValue).optional()

/** ---- Schemas ---- */
export const createProductSchema = z.object({
  id: z.number().int().positive().optional(),

  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(255, 'Tên sản phẩm không được vượt quá 255 ký tự'),
  code: z.string().min(1, 'Mã sản phẩm là bắt buộc').max(50, 'Mã sản phẩm không được vượt quá 50 ký tự'),
  category_id: z.number().int().positive().optional(),

  weight: decimalRequired(10, 2),
  gold_price_at_time: decimalRequired(15, 2),
  labor_cost: decimalRequired(15, 2),
  // dùng optional + default để khi người dùng để trống thì mặc định 0
  stone_cost: decimalOptional(15, 2).default(0),
  markup_rate: decimalRequired(5, 2),
  selling_price: decimalRequired(15, 2),

  warranty_period: z.number().int().nonnegative().default(0),

  // Định dạng ảnh lấy từ thiết bị
  image: z.union([
    z.instanceof(File).refine((f) => ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type), 'Ảnh phải là PNG/JPG'),
    z.string().url('Ảnh sản phẩm phải là một đường dẫn hợp lệ')
  ]),

  created_at: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date()).optional(),
  updated_at: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date()).optional()
})

export const updateProductSchema = createProductSchema.partial()

// Types
export type UpdateProductFormInput = z.input<typeof updateProductSchema>
export type UpdateProductData = z.infer<typeof updateProductSchema>
