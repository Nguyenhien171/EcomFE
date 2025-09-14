/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react'

// ================================
// Type definitions matching the backend API
//
// When creating an order the payload is defined by the gRPC/REST mapping of
// CreateOrderRequest in the order service. The JSON names correspond to the
// snake_case proto fields (e.g. customer_name rather than customerName).

export interface CreateOrderItem {
  product_id: number
  quantity: number
}

export interface CreateOrderPayload {
  customer_name: string
  customer_id?: string
  items: CreateOrderItem[]
  voucher_codes?: string[]
  shipping_cost?: number
}
export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export interface OrderStatusHistory {
  status: OrderStatus
  note: string
  at: string // ISO datetime string
}

export interface OrderItem {
  productId: number
  quantity: number
  unitPrice: number
  productName: string
  productImage: string
  lineTotal: number
}

export interface Order {
  orderId: number
  customerName: string
  staffId: string // e.g. ObjectId string
  items: OrderItem[]
  voucherCodes: string[]
  totalPrice: number
  discountAmount: number
  finalPrice: number
  shippingCost: number
  createdAt: string // ISO datetime string
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  customerId: string
}

export interface Pagination {
  total: number
  limit: number
  page: number
  hasNext: boolean
}

export interface ListOrdersResponse {
  orders: Order[]
  pagination: Pagination
}

// ================================
// Helper functions

// Format a number into Vietnamese Dong (VND) string. Defaults NaN to zero.
const VND = (n: number): string => {
  const value = Number(n) || 0
  return value.toLocaleString('vi-VN') + ' VND'
}

// Retrieve a JWT access token from localStorage. Try 'access_token' then 'token'.
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || null
}

// Build the Authorization header if a token exists.
function authHeaders(): HeadersInit {
  const t = getAccessToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// Perform a GET request against the gateway. Throws on non-2xx responses.
async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`http://localhost:8000${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    }
    // NOTE: credentials are intentionally omitted; the gateway expects JWT in Authorization header
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ============ Customer lookup ============
interface CustomerLookupResponse {
  customer: {
    id: number
    name: string
    phone: string
    email?: string
    address?: string
    createdAt: string
    updatedAt: string
  }
}

// GET /v1/customers/{phone}
async function apiGetCustomerByPhone(phone: string): Promise<CustomerLookupResponse> {
  // encode để an toàn với ký tự đặc biệt
  return apiGet<CustomerLookupResponse>(`/v1/customers/${encodeURIComponent(phone)}`)
}

// Perform a POST request against the gateway.
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`http://localhost:8000${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(body)
    // No credentials here either
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

// Perform a GET request for a single order. Provided separately for clarity.
async function apiGetOrder(id: number): Promise<Order> {
  return apiGet<Order>(`/v1/orders/${id}`)
}

// ================================
// Local product representation for UI (not sent to backend)

export type Product = { id: number; name: string; selling_price: number }

// Load products from localStorage. If none are stored, return empty array.
export async function loadProducts(limit = 100): Promise<Product[]> {
  try {
    const res = await fetch(`http://localhost:8000/v1/products?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // BỎ credentials; chỉ gắn Authorization nếu có token
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {})
      }
      // KHÔNG dùng: credentials: 'include'
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data: { products?: any[] } = await res.json()

    const products = (data.products ?? []).filter(Boolean).map((p) => ({
      id: Number(p.id),
      name: String(p.name ?? `SP-${p.id}`),
      // backend trả sellingPrice (camelCase) → map sang selling_price (snake_case) cho FE hiện tại
      selling_price: Number(p.sellingPrice ?? p.selling_price ?? 0)
    })) as Product[]

    // cache nhẹ nếu muốn dùng lại
    try {
      localStorage.setItem('products', JSON.stringify(products))
    } catch {}

    return products
  } catch (err) {
    console.error('loadProducts error:', err)
    // fallback: đọc cache cũ (nếu có) hoặc trả mảng rỗng
    try {
      const raw = localStorage.getItem('products')
      if (raw) {
        const cached = JSON.parse(raw)
        if (Array.isArray(cached)) return cached as Product[]
      }
    } catch {}
    return []
  }
}
// Default products for demonstration when localStorage has none.
// const FALLBACK_PRODUCTS: Product[] = [
//   { id: 301, name: 'Nhẫn Kim Cương', selling_price: 1_500_000 },
//   { id: 302, name: 'Dây Chuyền Vàng', selling_price: 2_000_000 },
//   { id: 401, name: 'Bông Tai', selling_price: 1_000_000 }
// ]

// Extract staff ID from JWT payload. Accept common keys: staff_id, user_id, id, sub, etc.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractStaffIdFromToken(): string | null {
  try {
    const token = getAccessToken()
    if (!token) return null
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const json = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')))
    const keys = ['staff_id', 'userId', 'user_id', 'id', 'sub', 'sid']
    for (const k of keys) {
      const v = json?.[k]
      if (typeof v === 'string' && v) return v
      if (typeof v === 'number' && !Number.isNaN(v)) return String(v)
    }
    return json?.email ?? null
  } catch {
    return null
  }
}

// ================================
// ItemsEditor component: allows selecting products and quantities.

interface ItemRow {
  product_id: number
  quantity: number
  name: string
  price: number
}

function ItemsEditor({
  value,
  onChange,
  products
}: {
  value: ItemRow[]
  onChange: (rows: ItemRow[]) => void
  products: Product[]
}) {
  const [open, setOpen] = useState(false)

  const addProduct = (p: Product) => {
    const exist = value.find((it) => it.product_id === p.id)
    if (exist) {
      const next = value.map((it) => (it.product_id === p.id ? { ...it, quantity: it.quantity + 1 } : it))
      onChange(next)
    } else {
      onChange([
        {
          product_id: p.id,
          quantity: 1,
          name: p.name,
          price: p.selling_price
        },
        ...value
      ])
    }
    setOpen(false)
  }

  const updateQty = (productId: number, qty: number) => {
    onChange(value.map((it) => (it.product_id === productId ? { ...it, quantity: qty } : it)))
  }

  const removeRow = (productId: number) => {
    onChange(value.filter((it) => it.product_id !== productId))
  }

  return (
    <div className='rounded-xl border p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Sản phẩm trong đơn</h3>
        <button
          className='rounded-xl bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700'
          onClick={() => setOpen(true)}
          type='button'
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
              <th className='border p-2'>Đơn giá (approx)</th>
              <th className='border p-2'>Thành tiền (approx)</th>
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
                <tr key={it.product_id} className='text-sm'>
                  <td className='border p-2'>{it.name}</td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      min={1}
                      className='w-24 rounded-md border p-1'
                      value={it.quantity}
                      onChange={(e) => updateQty(it.product_id, Math.max(1, Number(e.target.value)))}
                    />
                  </td>
                  <td className='border p-2'>{VND(it.price)}</td>
                  <td className='border p-2'>{VND(it.price * it.quantity)}</td>
                  <td className='border p-2'>
                    <button
                      className='rounded-md border px-2 py-1 text-xs'
                      onClick={() => removeRow(it.product_id)}
                      type='button'
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
              {products?.map((p) => (
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

// ================================
// CreateOrderForm component: collects input and posts new orders

function CreateOrderForm({ onCreated }: { onCreated: (order: Order) => void }) {
  const [items, setItems] = useState<ItemRow[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts().then((p) => setProducts(p))
  }, [])

  const [customerName, setCustomerName] = useState('') // tên hiển thị (tuỳ chọn)
  const [customerPhone, setCustomerPhone] = useState('') // nhập SĐT để tra cứu id
  const [voucher, setVoucher] = useState('') // "WELCOME10,ABC"
  // shipping_cost bỏ input, luôn = 0
  const SHIPPING_COST_FIXED = 0

  // Hiển thị tạm tính để UX tốt hơn (server vẫn tính lại)
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.quantity, 0), [items])

  const voucherList = useMemo(
    () =>
      voucher
        .split(',')
        .map((code) => code.trim())
        .filter((c) => c.length > 0),
    [voucher]
  )

  async function handleSubmit() {
    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm')
      return
    }

    // 1) Lookup customer theo phone (nếu có nhập)
    let customer_id: string | undefined = undefined
    let customer_name_final = customerName.trim()

    if (customerPhone.trim()) {
      try {
        const res = await apiGetCustomerByPhone(customerPhone.trim())
        customer_id = String(res.customer.phone)
        // nếu chưa nhập tên thì dùng tên từ backend
        if (!customer_name_final) customer_name_final = res.customer.name
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        alert(`Không tìm thấy khách hàng theo SĐT: ${msg}`)
        return
      }
    }

    // 2) Build payload snake_case theo contract
    const payload: CreateOrderPayload = {
      customer_id: customerPhone,
      customer_name: customer_name_final || 'Khách lẻ',
      items: items.map((it) => ({ product_id: it.product_id, quantity: it.quantity })),
      voucher_codes: voucherList.length ? voucherList : undefined,
      shipping_cost: SHIPPING_COST_FIXED
    }
    if (typeof customer_id === 'number') payload.customer_id = customer_id

    // 3) Gọi POST /v1/orders
    try {
      const res = await apiPost<{ order: Order }>('/v1/orders', payload)
      onCreated(res.order)
      // reset form
      setItems([])
      setCustomerName('')
      setCustomerPhone('')
      setVoucher('')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      alert(`Tạo đơn thất bại: ${msg}`)
    }
  }

  return (
    <div className='grid gap-3'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div>
          <label className='text-sm font-medium'>SĐT khách hàng (tra cứu ID)</label>
          <input
            className='w-full rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:ring'
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder='0912345678'
          />
          <p className='mt-1 text-xs text-gray-500'>Nhập SĐT để tự động lấy customer_id</p>
        </div>

        <div>
          <label className='text-sm font-medium'>Tên khách hàng (tuỳ chọn)</label>
          <input
            className='w-full rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:ring'
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder='Nguyen Van A'
          />
          <p className='mt-1 text-xs text-gray-500'>Nếu bỏ trống, sẽ dùng tên từ backend (nếu tìm thấy)</p>
        </div>

        <div>
          <label className='text-sm font-medium'>Mã voucher (cách nhau bởi dấu phẩy)</label>
          <input
            className='w-full rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:ring'
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            placeholder='WELCOME10, SPRING2025'
          />
        </div>

        <div className='grid items-end'>
          <div className='w-fit rounded-full border px-3 py-1 text-xs font-medium'>
            shipping_cost: {SHIPPING_COST_FIXED}
          </div>
        </div>
      </div>

      <ItemsEditor value={items} onChange={setItems} products={products} />

      <div className='mt-2 grid gap-1 text-right text-sm'>
        <div>
          Tạm tính (approx): <b>{VND(subtotal)}</b>
        </div>
        <div>
          Voucher: <b>{voucherList.join(', ') || '-'}</b>
        </div>
        <div>
          Vận chuyển: <b>{VND(SHIPPING_COST_FIXED)}</b>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={handleSubmit}
          className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
        >
          Tạo đơn hàng
        </button>
        <button type='button' onClick={() => setItems([])} className='rounded-xl border px-4 py-2 text-sm'>
          Reset Items
        </button>
      </div>
    </div>
  )
}

// ================================
// OrderDetailsModal component: displays details of a specific order

function OrderDetailsModal({ open, onClose, order }: { open: boolean; onClose: () => void; order: Order | null }) {
  if (!open || !order) return null
  return (
    <div className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4' onClick={onClose}>
      <div className='w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Chi tiết Order #{order.orderId}</h2>
          <button className='rounded-xl px-3 py-1 text-sm hover:bg-gray-100' onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className='mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2'>
          <div>
            Khách hàng: <b>{order.customerName || '-'}</b>
          </div>
          <div>
            Nhân viên: <b>{order.staffId || '-'}</b>
          </div>
          <div>
            Trạng thái: <b>{order.status}</b>
          </div>
          <div>
            Ngày tạo: <b>{new Date(order.createdAt).toLocaleString()}</b>
          </div>
          <div>
            Voucher: <b>{order?.voucherCodes?.join(', ') || '-'}</b>
          </div>
          <div>
            Phí vận chuyển: <b>{VND(order.shippingCost)}</b>
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
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.productId} className='text-sm'>
                  <td className='border p-2'>{it.productName}</td>
                  <td className='border p-2'>{it.quantity}</td>
                  <td className='border p-2'>{VND(it.unitPrice)}</td>
                  <td className='border p-2'>{VND(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='mt-4 grid gap-1 text-right text-sm'>
          <div>
            Tổng: <b>{VND(order.totalPrice)}</b>
          </div>
          <div>
            Giảm giá: <b>{VND(order.discountAmount)}</b>
          </div>
          <div className='text-base'>
            Phải thu: <b>{VND(order.finalPrice)}</b>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================
// Main OrdersPage component

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchOrders() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<ListOrdersResponse>('/v1/orders?page=0&limit=10')
      setOrders(data.orders || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(`Tải danh sách đơn thất bại: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCreated = (order: Order) => {
    // Prepend newly created order
    setOrders((prev) => [order, ...prev])
  }

  const openDetails = async (id: number) => {
    try {
      const ord = await apiGetOrder(id)
      setSelectedOrder(ord)
      setModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      alert(`Không thể lấy chi tiết đơn: ${msg}`)
    }
  }

  return (
    <div className='mx-auto max-w-6xl p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Orders</h1>
      <div className='rounded-2xl border bg-white p-4 shadow-sm'>
        <h2 className='mb-3 text-lg font-semibold'>Tạo Order (POST /v1/orders)</h2>
        <CreateOrderForm onCreated={handleCreated} />
      </div>
      <div className='mt-6 rounded-2xl border bg-white shadow-sm'>
        <div className='flex items-center justify-between p-3'>
          <h2 className='text-lg font-semibold'>Danh sách (GET /v1/orders)</h2>
          <button
            onClick={fetchOrders}
            className='rounded-xl border px-3 py-1 text-sm hover:bg-gray-50'
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>
        {error && <div className='px-3 pb-3 text-sm text-red-600'>{error}</div>}
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-50 text-left text-sm'>
                <th className='border p-2'>Order #</th>
                <th className='border p-2'>Khách hàng</th>
                <th className='border p-2'>Nhân viên</th>
                <th className='border p-2'>Voucher</th>
                <th className='border p-2'>Final</th>
                <th className='border p-2'>Status</th>
                <th className='border p-2'>Created</th>
                <th className='border p-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className='p-3 text-center text-sm text-gray-500'>
                    {loading ? 'Đang tải...' : 'Không có đơn hàng'}
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className='text-sm'>
                    <td className='border p-2'>#{o.orderId}</td>
                    <td className='border p-2'>{o.customerName || '-'}</td>
                    <td className='border p-2'>{o.staffId || '-'}</td>
                    <td className='border p-2'>{o?.voucherCodes?.join(', ') || '-'}</td>
                    <td className='border p-2'>{VND(o.finalPrice)}</td>
                    <td className='border p-2'>{o.status}</td>
                    <td className='border p-2'>{new Date(o.createdAt).toLocaleString()}</td>
                    <td className='border p-2'>
                      <div className='flex items-center gap-2'>
                        <button
                          className='rounded-xl bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700'
                          onClick={() => openDetails(o.orderId)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} order={selectedOrder} />
    </div>
  )
}
