import React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createOrderSchema, type CreateOrderInput } from '../../schemas/orders'
import { createOrderItemSchema } from '../../schemas/oder_item'

// ===== Types =====
export type OrderRow = z.infer<typeof createOrderSchema>
export type OrderItemRow = z.infer<typeof createOrderItemSchema>

// ===== Helpers =====
const VND = (n: number) => n.toLocaleString('vi-VN') + ' VND'

const genOrderNumber = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0')
  return `ORD-${y}${m}${day}-${rand}`
}

// Lấy staff info (id + email) từ token (JWT) trong localStorage
function getStaffFromToken(): { id: number | null; email: string | null } {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (!token) return { id: null, email: null }
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return { id: null, email: null }
    const json = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')))
    const possibleIdKeys = ['staff_id', 'userId', 'user_id', 'id', 'sub']
    let id: number | null = null
    for (const k of possibleIdKeys) {
      if (json && typeof json[k] === 'number') {
        id = json[k]
        break
      }
      if (json && typeof json[k] === 'string' && !Number.isNaN(Number(json[k]))) {
        id = Number(json[k])
        break
      }
    }
    const email = typeof json?.email === 'string' ? json.email : null
    return { id, email }
  } catch {
    return { id: null, email: null }
  }
}

// ✅ Log thực tế (trước đây in ra function)
console.log('Token parsed:', getStaffFromToken())

// ===== Products from localStorage =====
export type Product = { id: number; name: string; selling_price: number }

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem('products')
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .filter((p) => p && typeof p.id === 'number')
      .map((p) => ({ id: p.id, name: p.name ?? `SP-${p.id}`, selling_price: Number(p.selling_price ?? 0) }))
  } catch {
    return []
  }
}

// Fallback demo
const FALLBACK_PRODUCTS: Product[] = [
  { id: 301, name: 'Nhẫn Kim Cương', selling_price: 1_500_000 },
  { id: 302, name: 'Dây Chuyền Vàng', selling_price: 2_000_000 },
  { id: 401, name: 'Bông Tai', selling_price: 1_000_000 }
]

// ===== Items Editor (chọn sản phẩm bằng nút + từ list) =====
function ItemsEditor({
  value,
  onChange,
  products
}: {
  value: OrderItemRow[]
  onChange: (rows: OrderItemRow[]) => void
  products: Product[]
}) {
  const [open, setOpen] = useState(false)

  const addProduct = (p: Product) => {
    const exist = value.find((it) => it.product_id === p.id)
    if (exist) {
      const updated = value.map((it) =>
        it.product_id === p.id
          ? { ...it, quantity: it.quantity + 1, total_price: (it.quantity + 1) * Number(it.unit_price) }
          : it
      )
      onChange(updated)
    } else {
      const row: OrderItemRow = {
        id: Math.floor(Math.random() * 10_000),
        order_id: 0,
        product_id: p.id,
        quantity: 1,
        unit_price: p.selling_price,
        total_price: p.selling_price
      }
      onChange([row, ...value])
    }
    setOpen(false)
  }

  const updateQty = (id: number, qty: number) => {
    onChange(
      value.map((it) => (it.id === id ? { ...it, quantity: qty, total_price: Number(it.unit_price) * qty } : it))
    )
  }

  const removeRow = (id: number) => {
    onChange(value.filter((it) => it.id !== id))
  }

  return (
    <div className='rounded-xl border p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Sản phẩm trong đơn</h3>
        <button
          className='rounded-xl bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700'
          onClick={() => setOpen(true)}
        >
          + Thêm sản phẩm
        </button>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-50 text-left text-sm'>
              <th className='border p-2'>Sản phẩm</th>
              <th className='border p-2'>Số lượng</th>
              <th className='border p-2'>Đơn giá</th>
              <th className='border p-2'>Thành tiền</th>
              <th className='border p-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {value.length === 0 ? (
              <tr>
                <td className='p-3 text-center text-sm text-gray-500' colSpan={5}>
                  Chưa có sản phẩm
                </td>
              </tr>
            ) : (
              value.map((it) => (
                <tr key={it.id} className='text-sm'>
                  <td className='border p-2'>{products.find((p) => p.id === it.product_id)?.name ?? it.product_id}</td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      min={1}
                      className='w-24 rounded-md border p-1'
                      value={it.quantity}
                      onChange={(e) => updateQty(it.id!, Math.max(1, Number(e.target.value)))}
                    />
                  </td>
                  <td className='border p-2'>{VND(Number(it.unit_price))}</td>
                  <td className='border p-2'>{VND(Number(it.total_price))}</td>
                  <td className='border p-2'>
                    <button className='rounded-md border px-2 py-1 text-xs' onClick={() => removeRow(it.id!)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chọn sản phẩm */}
      {open && (
        <div className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4' onClick={() => setOpen(false)}>
          <div
            className='max-h-[80vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-4 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-2 flex items-center justify-between'>
              <h4 className='text-base font-semibold'>Chọn sản phẩm</h4>
              <button onClick={() => setOpen(false)} className='rounded-xl px-3 py-1 text-sm hover:bg-gray-100'>
                Đóng
              </button>
            </div>
            <ul className='divide-y'>
              {products.map((p) => (
                <li key={p.id} className='flex items-center justify-between gap-3 py-2'>
                  <div>
                    <div className='font-medium'>{p.name}</div>
                    <div className='text-xs text-gray-500'>
                      #{p.id} • {VND(p.selling_price)}
                    </div>
                  </div>
                  <button
                    className='rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700'
                    onClick={() => addProduct(p)}
                  >
                    Thêm
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Create Order Form (status chỉ "pending" khi tạo) =====
function CreateOrderForm({ onCreated }: { onCreated: (o: OrderRow, items: OrderItemRow[]) => void }) {
  const staff = useMemo(() => getStaffFromToken(), [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      order_number: genOrderNumber(),
      staff_id: (staff.id ?? 0) as any,
      total_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      status: 'pending'
    }
  })

  // Items state
  const [items, setItems] = useState<OrderItemRow[]>([])

  // Load products
  const products = useMemo(() => {
    const fromLS = loadProducts()
    return fromLS.length ? fromLS : FALLBACK_PRODUCTS
  }, [])

  // Tính total từ items
  useEffect(() => {
    const total = items.reduce((sum, it) => sum + Number(it.total_price), 0)
    setValue('total_amount', Number(total.toFixed(2)) as any)
    const discount = Number(watch('discount_amount') || 0)
    setValue('final_amount', Number(Math.max(0, total - discount).toFixed(2)) as any)
  }, [items, setValue, watch])

  // Khi discount đổi, cập nhật final
  const discount = watch('discount_amount')
  const total = watch('total_amount')
  useEffect(() => {
    const t = Number(total || 0)
    const d = Number(discount || 0)
    setValue('final_amount', Number(Math.max(0, t - d).toFixed(2)) as any)
  }, [discount, total, setValue])

  // const statusOptions = ['pending', 'paid', 'completed', 'cancelled', 'refunded'] // ❌ Không dùng ở form tạo

  const input = 'w-full rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:ring'
  const label = 'text-sm font-medium'
  const err = (k: keyof CreateOrderInput) => (
    <p className='text-xs text-red-600'>{(errors[k]?.message as string) || ''}</p>
  )

  const onSubmit = (data: CreateOrderInput) => {
    // Always force status to 'pending' at creation
    const payload: CreateOrderInput = { ...data, status: 'pending' as any }

    // Validate items
    const validItems: OrderItemRow[] = []
    for (const it of items) {
      const result = createOrderItemSchema.safeParse({ ...it, order_id: 0 })
      if (!result.success) {
        alert('Item không hợp lệ. Vui lòng kiểm tra lại.')
        return
      }
      validItems.push(result.data)
    }

    const created: OrderRow = { ...payload, id: Math.floor(Math.random() * 10_000), created_at: new Date() }
    onCreated(created, validItems)

    // Reset
    reset({
      order_number: genOrderNumber(),
      staff_id: (getStaffFromToken().id ?? 0) as any,
      total_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      status: 'pending'
    })
    setItems([])
  }

  return (
    <form className='grid gap-3' onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {/* Mã đơn hàng (disabled – tự sinh) */}
        <div>
          <label className={label}>Mã đơn hàng (auto)</label>
          <input className={input} disabled {...register('order_number')} />
          {err('order_number')}
        </div>

        {/* Staff từ token (hiển thị email nếu có) + hidden staff_id để submit */}
        <div>
          <label className={label}>Nhân viên</label>
          <input className={input} disabled value={staff.email ?? staff.id ?? ''} />
          <input type='hidden' {...register('staff_id', { valueAsNumber: true })} />
          {err('staff_id')}
        </div>

        {/* Discount */}
        <div>
          <label className={label}>Giảm giá (discount_amount)</label>
          <input
            type='number'
            step='0.01'
            className={input}
            {...register('discount_amount', { valueAsNumber: true })}
          />
          {err('discount_amount')}
        </div>

        {/* Status khi tạo: cố định là pending */}
        <div>
          <label className={label}>Trạng thái</label>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium'>pending</span>
          </div>
          {/* Hidden field để gửi lên API */}
          <input type='hidden' value={'pending'} {...register('status')} />
        </div>
      </div>

      {/* Items picker */}
      <ItemsEditor value={items} onChange={setItems} products={products} />

      {/* Tính tiền */}
      <div className='mt-2 grid gap-1 text-right text-sm'>
        <div>
          Tổng tiền: <b>{VND(Number(watch('total_amount') || 0))}</b>
        </div>
        <div>
          Giảm giá: <b>{VND(Number(watch('discount_amount') || 0))}</b>
        </div>
        <div className='text-base'>
          Phải thu: <b>{VND(Number(watch('final_amount') || 0))}</b>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='submit'
          className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
        >
          Tạo đơn hàng
        </button>
        <button
          type='button'
          onClick={() => {
            setItems([])
          }}
          className='rounded-xl border px-4 py-2 text-sm'
        >
          Reset Items
        </button>
      </div>
    </form>
  )
}

// ===== Modal xem/sửa items của một order đã tạo =====
function ItemsModal({
  open,
  onClose,
  order,
  items,
  products,
  onSave
}: {
  open: boolean
  onClose: () => void
  order: OrderRow | null
  items: OrderItemRow[]
  products: Product[]
  onSave: (updatedItems: OrderItemRow[], updatedOrder: OrderRow) => void
}) {
  if (!open || !order) return null

  const [draft, setDraft] = useState<OrderItemRow[]>(items.map((i) => ({ ...i })))
  const [status, setStatus] = useState<OrderRow['status']>(order.status)

  useEffect(() => {
    setDraft(items.map((i) => ({ ...i })))
  }, [items])

  // Cho phép đổi status khi sửa/xem
  const statusOptions: OrderRow['status'][] = ['pending', 'paid', 'completed', 'cancelled', 'refunded'] as any

  const updateQty = (id: number, qty: number) => {
    setDraft(
      draft.map((it) => (it.id === id ? { ...it, quantity: qty, total_price: Number(it.unit_price) * qty } : it))
    )
  }
  const removeRow = (id: number) => setDraft(draft.filter((it) => it.id !== id))

  const handleSave = () => {
    const newTotal = draft.reduce((s, it) => s + Number(it.total_price), 0)
    const updatedOrder: OrderRow = {
      ...order,
      status,
      total_amount: Number(newTotal.toFixed(2)) as any,
      final_amount: Number(Math.max(0, newTotal - Number(order.discount_amount || 0)).toFixed(2)) as any
    }
    onSave(draft, updatedOrder)
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4' onClick={onClose}>
      <div className='w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Chi tiết Order #{order.order_number}</h2>
          <div className='flex items-center gap-2'>
            <button className='rounded-xl px-3 py-1 text-sm hover:bg-gray-100' onClick={onClose}>
              Đóng
            </button>
            <button
              className='rounded-xl bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700'
              onClick={handleSave}
            >
              Lưu
            </button>
          </div>
        </div>

        <div className='mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2'>
          <div>
            Nhân viên: <b>{order.staff_id}</b>
          </div>
          <div className='flex items-center gap-2'>
            <span>Trạng thái:</span>
            <select
              className='rounded-lg border px-2 py-1 text-sm'
              value={status as any}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            Ngày tạo: <b>{new Date(order.created_at!).toLocaleString()}</b>
          </div>
        </div>

        <div className='mt-4 overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100 text-left text-sm'>
                <th className='border p-2'>Sản phẩm</th>
                <th className='border p-2'>Số lượng</th>
                <th className='border p-2'>Đơn giá</th>
                <th className='border p-2'>Thành tiền</th>
                <th className='border p-2'>Action</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((it) => (
                <tr key={it.id} className='text-sm'>
                  <td className='border p-2'>{products.find((p) => p.id === it.product_id)?.name ?? it.product_id}</td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      min={1}
                      className='w-24 rounded-md border p-1'
                      value={it.quantity}
                      onChange={(e) => updateQty(it.id!, Math.max(1, Number(e.target.value)))}
                    />
                  </td>
                  <td className='border p-2'>{VND(Number(it.unit_price))}</td>
                  <td className='border p-2'>{VND(Number(it.total_price))}</td>
                  <td className='border p-2'>
                    <button className='rounded-md border px-2 py-1 text-xs' onClick={() => removeRow(it.id!)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 grid gap-1 text-right text-sm'>
          <div>
            Tổng: <b>{VND(draft.reduce((s, it) => s + Number(it.total_price), 0))}</b>
          </div>
          <div>
            Giảm giá: <b>{VND(Number(order.discount_amount ?? 0))}</b>
          </div>
          <div className='text-base'>
            Phải thu:{' '}
            <b>
              {VND(
                Math.max(0, draft.reduce((s, it) => s + Number(it.total_price), 0) - Number(order.discount_amount || 0))
              )}
            </b>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Main Page =====
export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [itemsByOrder, setItemsByOrder] = useState<Record<number, OrderItemRow[]>>({})
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null)
  const [open, setOpen] = useState(false)

  // Seed demo ban đầu
  useEffect(() => {
    const staff = getStaffFromToken()
    const demoOrder: OrderRow = {
      id: 1,
      order_number: genOrderNumber(),
      staff_id: (staff.id ?? 201) as any,
      total_amount: 4_500_000,
      discount_amount: 500_000,
      final_amount: 4_000_000,
      status: 'pending',
      created_at: new Date()
    } as any
    setRows([demoOrder])
    setItemsByOrder({
      1: [
        { id: 11, order_id: 1, product_id: 301, quantity: 2, unit_price: 1_500_000, total_price: 3_000_000 },
        { id: 12, order_id: 1, product_id: 302, quantity: 1, unit_price: 1_000_000, total_price: 1_000_000 }
      ]
    })
  }, [])

  const products = useMemo(() => {
    const fromLS = loadProducts()
    return fromLS.length ? fromLS : FALLBACK_PRODUCTS
  }, [])

  const onCreated = (o: OrderRow, items: OrderItemRow[]) => {
    const id = o.id || Math.floor(Math.random() * 10_000)
    const withId = { ...o, id }
    setRows((prev) => [withId, ...prev])
    setItemsByOrder((prev) => ({ ...prev, [id]: items.map((it) => ({ ...it, order_id: id })) }))
  }

  const openItems = (o: OrderRow) => {
    setViewOrder(o)
    setOpen(true)
  }

  const saveItemsForOrder = (updatedItems: OrderItemRow[], updatedOrder: OrderRow) => {
    const id = updatedOrder.id!
    setItemsByOrder((prev) => ({ ...prev, [id]: updatedItems }))
    setRows((prev) => prev.map((r) => (r.id === id ? updatedOrder : r)))
  }

  return (
    <div className='mx-auto max-w-6xl p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Orders</h1>

      <div className='rounded-2xl border bg-white p-4 shadow-sm'>
        <h2 className='mb-3 text-lg font-semibold'>Tạo Order</h2>
        <CreateOrderForm onCreated={onCreated} />
      </div>

      <div className='mt-6 overflow-x-auto rounded-2xl border bg-white shadow-sm'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-50 text-left text-sm'>
              <th className='border p-2'>Order #</th>
              <th className='border p-2'>Staff (email / id)</th>
              <th className='border p-2'>Final</th>
              <th className='border p-2'>Status</th>
              <th className='border p-2'>Created</th>
              <th className='border p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className='text-sm'>
                <td className='border p-2'>{o.order_number}</td>
                <td className='border p-2'>{getStaffFromToken().email ?? o.staff_id}</td>
                <td className='border p-2'>{VND(Number(o.final_amount))}</td>
                <td className='border p-2'>{o.status}</td>
                <td className='border p-2'>{new Date(o.created_at!).toLocaleString()}</td>
                <td className='border p-2'>
                  <div className='flex items-center gap-2'>
                    <button
                      className='rounded-xl bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700'
                      onClick={() => openItems(o)}
                    >
                      Xem/Sửa items
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ItemsModal
        open={open}
        onClose={() => setOpen(false)}
        order={viewOrder}
        items={viewOrder ? itemsByOrder[viewOrder.id!] || [] : []}
        products={products}
        onSave={saveItemsForOrder}
      />
    </div>
  )
}
