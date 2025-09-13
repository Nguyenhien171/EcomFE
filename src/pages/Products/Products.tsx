import { TfiReload } from 'react-icons/tfi'
import { FaSearch } from 'react-icons/fa'
import { FaDownload } from 'react-icons/fa6'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BsArrowRightCircle, BsArrowLeftCircle } from 'react-icons/bs'
import { updateProductSchema } from '../../schemas/productSchema'
import type { z } from 'zod'
import ActionMenu from '../../components/ActionMenu'
import ProductImage from '../../components/ProductImage'
import AddNewProduct from '../../components/AddNewProduct'
import { useAuth } from '../../contexts/AuthContext'
import http from '../../utils/axios.http'
import { isAxiosError } from 'axios'

// // Lấy type từ Zod schema
type Product = z.infer<typeof updateProductSchema>

// API response product type (camelCase)
interface ApiProduct {
  id: number
  name: string
  code: string
  categoryId: number
  weight: number
  goldPriceAtTime: number
  laborCost: number
  stoneCost: number
  markupRate: number
  sellingPrice: number
  warrantyPeriod: number
  image: string
  createdAt: string
  updatedAt: string
  stock: number
  buyTurn: number
}

// API response category type
interface Category {
  id: number
  name: string
}

// Helpers
const e: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}

const fmtDate = (d?: Date) => (d ? d.toLocaleString('en-US', e) : '—')
const fmtVND = (n?: number) => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VND' : '—')

export default function Products() {
  const { hasPermission } = useAuth()

  // UI State
  const [query, setQuery] = useState('')
  const [time, setTime] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const itemsPerPage = 5

  // Server State
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const cat of categories) {
      map.set(cat.id, cat.name)
    }
    return map
  }, [categories])

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch categories effect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await http.get<{ categories: Category[] }>('/v1/product-categories')
        setCategories(response.data.categories)
      } catch (err) {
        console.error('Failed to fetch product categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Data fetching effect
  useEffect(() => {
    const controller = new AbortController()

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await http.get<{ products: ApiProduct[] }>('/v1/products', {
          params: {
            page: currentPage - 1, // API is 0-indexed
            limit: itemsPerPage,
            q: query.trim() || undefined,
            categoryId: selectedCategoryId || undefined
            // TODO: Add sort params
          },
          signal: controller.signal
        })

        const { products: apiProducts } = response.data

        setHasNextPage(apiProducts.length === itemsPerPage)

        // Map API response (camelCase) to frontend Product type (snake_case)
        const mappedProducts: Product[] = apiProducts.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          category_id: p.categoryId,
          weight: p.weight,
          gold_price_at_time: p.goldPriceAtTime,
          labor_cost: p.laborCost,
          stone_cost: p.stoneCost,
          markup_rate: p.markupRate,
          selling_price: p.sellingPrice,
          warranty_period: p.warrantyPeriod,
          image: p.image,
          created_at: p.createdAt ? new Date(p.createdAt) : undefined,
          updated_at: p.updatedAt ? new Date(p.updatedAt) : undefined
        }))

        setProducts(mappedProducts)
      } catch (err) {
        if (isAxiosError(err) && err.name === 'CanceledError') {
          return // Request was cancelled
        }
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch products.')
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred.')
        }
        setHasNextPage(false)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      controller.abort()
    }
  }, [currentPage, itemsPerPage, query, refreshKey, selectedCategoryId])

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedCategoryId('')
    setCurrentPage(1)
  }

  const handleExportCsv = useCallback(() => {
    if (products.length === 0) {
      alert('Không có dữ liệu để xuất.')
      return
    }

    const headers = [
      'ID',
      'Name',
      'Code',
      'Category',
      'Weight',
      'Gold Price at Time',
      'Labor Cost',
      'Stone Cost',
      'Markup Rate',
      'Selling Price',
      'Warranty Period',
      'Image URL',
      'Created At',
      'Updated At'
    ]

    const escapeCsvCell = (cell: any): string => {
      if (cell === undefined || cell === null) {
        return ''
      }
      const str = String(cell)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvRows = [
      headers.join(','),
      ...products.map((p) =>
        [
          p.id, p.name, p.code, p.category_id, p.weight, p.gold_price_at_time, p.labor_cost, p.stone_cost,
          p.markup_rate, p.selling_price, p.warranty_period, p.image, p.created_at?.toISOString() ?? '',
          p.updated_at?.toISOString() ?? ''
        ].map(escapeCsvCell).join(',')
      )
    ]

    const csvString = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `products-page-${currentPage}-${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [products, currentPage, categoryMap])

  //   // const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  //   //   if (stock <= 0) {
  //   //     return <span className='text-red-600 font-medium'>Stock Out ({stock})</span>
  //   //   }
  //   //   if (stock < 10) {
  //   //     return <span className='text-orange-600 font-medium'>Stock Low ({stock})</span>
  //   //   }
  //   //   return <span className='text-green-600 font-medium'>In Stock ({stock})</span>
  //   // }

  // Lấy data thêm từ modal -> Local
  const handleSaved = useCallback((savedProduct: Product) => {
    console.log('Sản phẩm mới đã được lưu cục bộ, kích hoạt tải lại dữ liệu từ máy chủ.', savedProduct)
    setCurrentPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const currentProducts = products

  return (
    <div>
      {/* Title */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Quản lý sản phẩm</h1>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>{time.toLocaleString('en-US', e)}</div>
          <button
            type='button'
            onClick={() => setRefreshKey((k) => k + 1)}
            className='flex items-center justify-center px-4 border-l-2 cursor-pointer'
          >
            <TfiReload className='mr-2' />
            Làm mới dữ liệu
          </button>
        </div>
      </div>
      {/* Modal và Search */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-3'>
          {/* Only show Add New Product for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && <AddNewProduct onSaved={handleSaved} />}
          <button
            onClick={handleExportCsv}
            className='flex justify-center items-center border-blue-400 border px-4 py-2 rounded gap-2 text-blue-600 font-semibold'
          >
            Xuất CSV <FaDownload />
          </button>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className='flex flex-1 justify-end ml-10'>
            <div className='flex items-center border-2 rounded px-3 py-2 w-[300px]'>
              <input
                type='text'
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  handleSearch()
                }}
                placeholder='Tìm kiếm'
                className='flex-1 outline-none'
              />
              <FaSearch className='text-gray-500' />
            </div>
          </div>
        </form>
      </div>
      <div className='hidden md:flex items-center gap-2 text-sm text-gray-600'>
        <span>Sản phẩm:</span>
        <strong className='text-gray-800'>Sản phẩm</strong>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Đã đăng <strong className='text-gray-800'>(1025)</strong>
        </span>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Bản nháp <strong className='text-gray-800'>(125)</strong>{' '}
        </span>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Thùng rác <strong className='text-gray-800'>(45)</strong>
        </span>
      </div>
      {/* Filter chips */}
      <div className='flex gap-5 flex-wrap my-6'>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Lọc theo kho</option>
          <option>Còn hàng</option>
          <option>Hết hàng</option>
        </select>
        <select
          className='border rounded px-3 py-2 text-sm'
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value=''>Danh mục sản phẩm</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Bán chạy nhất</option>
          <option>Đánh giá cao</option>
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Loại sản phẩm</option>
          <option>Đánh giá cao</option>
        </select>
        <button className='px-4 py-2 bg-indigo-600 text-white rounded' onClick={handleSearch}>
          Áp dụng
        </button>
        <button type='button' onClick={clearFilters} className='px-4 py-2 border rounded'>
          Xóa
        </button>
      </div>
      {/* Table */}
      <div className={`overflow-x-auto bg-white border rounded-2xl ${loading && products.length > 0 ? 'opacity-50 transition-opacity' : ''}`}>
        <table className='min-w-full table-auto text-sm'>
          <thead>
            <tr className='bg-blue-50 text-left text-xs text-blue-600'>
              <th className='px-6 py-3'>TÊN SẢN PHẨM</th>
              <th className='px-6 py-3'>MÃ SKU</th>
              <th className='px-6 py-3'>DANH MỤC</th>
              <th className='px-6 py-3'>TRỌNG LƯỢNG</th>
              <th className='px-6 py-3'>GIÁ VÀNG (thời điểm)</th>
              <th className='px-6 py-3'>CÔNG & ĐÁ</th>
              <th className='px-6 py-3'>GIÁ BÁN</th>
              <th className='px-6 py-3'>TỶ LỆ LỢI NHUẬN</th>
              <th className='px-6 py-3'>BẢO HÀNH</th>
              <th className='px-6 py-3'>HÌNH ẢNH</th>
              <th className='px-6 py-3'>NGÀY TẠO</th>
              <th className='px-6 py-3'>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 && (
              <tr>
                <td colSpan={12} className='p-6 text-center text-gray-500'>
                  Đang tải...
                </td>
              </tr>
            )}
            {error && products.length === 0 && (
              <tr>
                <td colSpan={12} className='p-6 text-center text-red-500'>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && products.length === 0 && (
              <tr>
                <td colSpan={12} className='p-6 text-center text-gray-500'>
                  Không tìm thấy sản phẩm.
                </td>
              </tr>
            )}
            {products.length > 0 &&
              currentProducts.map((p) => (
                <tr key={p.id} className='border-t hover:bg-gray-50 align-top'>
                  <td className='px-6 py-4 max-w-[360px]'>
                    <div className='font-medium text-gray-800'>{p.name ?? '(Chưa có tên)'}</div>
                    <div className='text-xs text-gray-400'>ID: {p.id}</div>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{p.code}</td>
                  <td className='px-6 py-4 text-gray-600'>{categoryMap.get(p.category_id!) ?? p.category_id}</td>
                  <td className='px-6 py-4'>{p.weight}</td>
                  <td className='px-6 py-4 text-blue-600'>{fmtVND(p.gold_price_at_time)}</td>
                  <td className='px-8 py-4 text-gray-600'>
                    <div className='flex flex-col items-start'>
                      <span className='text-xs text-gray-400'>{fmtVND(p.labor_cost)}</span>
                      <span className='text-xs text-gray-400'>{fmtVND(p.stone_cost)}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{fmtVND(p.selling_price)}</td>
                  <td className='px-6 py-4 text-gray-600'>{p.markup_rate}</td>
                  <td className='px-6 py-4 text-gray-600'>{p.warranty_period}</td>
                  <td className='px-6 py-4 text-gray-600'>
                    <ProductImage
                      image={typeof p.image === 'string' ? p.image : undefined}
                      alt={p.name ?? 'product'}
                      className='w-16 h-16 object-cover rounded'
                    />
                  </td>
                  <td className='px-6 py-4 text-gray-500'>
                    <div>{fmtDate(p.created_at)}</div>
                    <div className='text-xs text-gray-400'>Sửa lần cuối: {fmtDate(p.updated_at)}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <ActionMenu />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Next page */}
      <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
        <div>
          Trang {currentPage}
        </div>
        <div className='space-x-2 flex items-center'>
          <button
            className='px-3 py-1 rounded-full disabled:opacity-50'
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            <BsArrowLeftCircle className='text-2xl' />
          </button>

          <span className='px-4 py-1 rounded-full bg-blue-500 text-white font-bold'>{currentPage}</span>

          <button
            className='px-3 py-1 rounded-full disabled:opacity-50'
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasNextPage || loading}
          >
            <BsArrowRightCircle className='text-2xl' />
          </button>
        </div>
      </div>
    </div>
  )
}
