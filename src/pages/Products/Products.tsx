import { TfiReload } from 'react-icons/tfi'
import { FaSearch } from 'react-icons/fa'
import { FaDownload } from 'react-icons/fa6'
import React, { useState, useEffect } from 'react'
import { BsArrowRightCircle, BsArrowLeftCircle } from 'react-icons/bs'
import { SAMPLE_PRODUCTS } from '../../data/products'
import { updateProductSchema } from '../../schemas/productSchema'
import type { z } from 'zod'
import ActionMenu from '../../components/ActionMenu'
import ProductImage from '../../components/ProductImage'
import AddNewProduct from '../../components/AddNewProduct'
import { useAuth } from '../../contexts/AuthContext'

// // Lấy type từ Zod schema
type Product = z.infer<typeof updateProductSchema>

// Dạng lưu trong localStorage
type StoredProduct = Omit<Product, 'created_at' | 'updated_at' | 'image'> & {
  created_at?: string
  updated_at?: string
  image?: string
}

// Helpers
const KEY = 'products'

const e: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}

console.log(e)

const fmtDate = (d?: Date) => (d ? d.toLocaleString('en-US', e) : '—')
const fmtVND = (n?: number) => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VND' : '—')

//LocalStoge
const parseJSON = <T,>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const toProduct = (p: StoredProduct | Product): Product => ({
  ...p,
  created_at: p.created_at ? new Date(p.created_at as unknown as string) : (p.created_at as Date | undefined),
  updated_at: p.updated_at ? new Date(p.updated_at as unknown as string) : (p.updated_at as Date | undefined)
})

const loadLS = (): StoredProduct[] => {
  const raw = localStorage.getItem(KEY)
  return raw ? parseJSON<StoredProduct[]>(raw, []) : []
}

const saveLS = (list: Product[]) => {
  const stored: StoredProduct[] = list.map((p) => ({
    ...p,
    created_at: p.created_at ? p.created_at.toISOString() : undefined,
    updated_at: p.updated_at ? p.updated_at.toISOString() : undefined,
    image: typeof p.image === 'string' ? p.image : undefined
  }))
  localStorage.setItem(KEY, JSON.stringify(stored))
}

//Sample + local lại(api thì sẽ bỏ cái sample đi tại nó thay thế cho api)
const mergeProducts = (sample: Product[], ls: Product[]) => {
  const map = new Map<number | string, Product>()
  for (const p of sample) map.set(p.id as number | string, p)
  for (const p of ls) map.set(p.id as number | string, p) // override sample nếu trùng id
  const merged = Array.from(map.values())
  merged.sort((a, b) => {
    const ta = (a.updated_at ?? a.created_at)?.getTime?.() ?? 0
    const tb = (b.updated_at ?? b.created_at)?.getTime?.() ?? 0
    return tb - ta
  })
  return merged
}

//Apply
const applyQuery = (arr: Product[], q: string) => {
  const s = q.trim().toLowerCase()
  return !s ? arr : arr.filter((p) => (p.name ?? '').toLowerCase().includes(s))
}

export default function Products() {
  const { hasPermission } = useAuth()
  const [query, setQuery] = useState('')
  //   const parsedProducts: Product[] = SAMPLE_PRODUCTS.map((p) => ({
  //     ...p,
  //     created_at: p.created_at ? new Date(p.created_at) : undefined,
  //     updated_at: p.updated_at ? new Date(p.updated_at) : undefined
  //   }))
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [time, setTime] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const sampleParsed: Product[] = SAMPLE_PRODUCTS.map((p) => ({
      ...p,
      created_at: p.created_at ? new Date(p.created_at) : undefined,
      updated_at: p.updated_at ? new Date(p.updated_at) : undefined
    }))
    const stored = loadLS().map(toProduct)
    const merged = mergeProducts(sampleParsed, stored)
    setProducts(merged)
    setFiltered(applyQuery(merged, ''))
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return setFiltered(products)

    setFiltered(products.filter((p) => (p.name ?? '').toLowerCase().includes(q)))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setFiltered(products)
    setCurrentPage(1)
  }

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
  const handleSaved = (saved: Product) => {
    const next = [saved, ...products]
    setProducts(next)
    setFiltered(applyQuery(next, query))
    saveLS(next)
    setCurrentPage(1)
  }

  const itemsPerPage = 10

  // tổng trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  // Cắt trang
  const currentProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      {/* Title */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Products management</h1>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>{time.toLocaleString('en-US', e)}</div>
          <button
            type='button'
            onClick={() => {
              // TODO: gọi API refresh
            }}
            className='flex items-center justify-center px-4 border-l-2 cursor-pointer'
          >
            <TfiReload className='mr-2' />
            Data Refresh
          </button>
        </div>
      </div>
      {/* Modal và Search */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-3'>
          {/* Only show Add New Product for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && (
            <AddNewProduct onSaved={handleSaved} />
          )}
          <button className='flex justify-center items-center border-blue-400 border px-4 py-2 rounded gap-2 text-blue-600 font-semibold'>
            Export CSV <FaDownload />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            handleSearch(e)
          }}
        >
          <div className='flex flex-1 justify-end ml-10'>
            <div className='flex items-center border-2 rounded px-3 py-2 w-[300px]'>
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search'
                className='flex-1 outline-none'
              />
              <FaSearch className='text-gray-500' />
            </div>
          </div>
        </form>
      </div>
      <div className='hidden md:flex items-center gap-2 text-sm text-gray-600'>
        <span>Products:</span>
        <strong className='text-gray-800'>All ({products.length})</strong>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Published <strong className='text-gray-800'>(1025)</strong>
        </span>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Drafts <strong className='text-gray-800'>(125)</strong>{' '}
        </span>
        <span className='text-blue-600 border-l-2 border-gray-400 px-2'>
          Trash <strong className='text-gray-800'>(45)</strong>
        </span>
      </div>
      {/* Filter chips */}
      <div className='flex gap-5 flex-wrap my-6'>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Filter by Stock Status</option>
          <option>In Stock</option>
          <option>Stock Out</option>
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Product Category</option>
          <option>Electronics</option>
          <option>Beauty</option>
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Best Seller</option>
          <option>Top Rated</option>
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Product Type</option>
          <option>Top Rated</option>
        </select>
        <button className='px-4 py-2 bg-indigo-600 text-white rounded' onClick={() => handleSearch()}>
          Apply
        </button>
        <button type='button' onClick={clearFilters} className='px-4 py-2 border rounded'>
          Clear
        </button>
      </div>
      {/* Table */}
      <div className='overflow-x-auto bg-white border rounded'>
        <table className='min-w-full table-auto text-sm'>
          <thead>
            <tr className='bg-blue-50 text-left text-xs text-blue-600'>
              <th className='px-6 py-3'>PRODUCT NAME</th>
              <th className='px-6 py-3'>SKU</th>
              {/* <th className='px-6 py-3'>CATEGORIES</th> */}
              <th className='px-6 py-3'>WEIGHT</th>
              <th className='px-6 py-3'>GOLD PRICE AT TIME</th>
              <th className='px-6 py-3'>Labor & Stone</th>
              <th className='px-6 py-3'>SELLING</th>
              <th className='px-6 py-3'>MARKUP RATE</th>
              <th className='px-6 py-3'>WARRANTY</th>
              <th className='px-6 py-3'>IMAGE</th>
              <th className='px-6 py-3'>DATE</th>
              <th className='px-6 py-3'>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <tr key={p.id} className='border-t hover:bg-gray-50 align-top'>
                <td className='px-6 py-4 max-w-[360px]'>
                  <div className='font-medium text-gray-800'>{p.name ?? '(No name)'}</div>
                  <div className='text-xs text-gray-400'>ID: {p.id}</div>
                </td>
                <td className='px-6 py-4 text-gray-600'>{p.code}</td>
                {/* <td className='px-6 py-4 text-gray-600'>{p.category_id}</td> */}
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
                  <div className='text-xs text-gray-400'>Last Edited: {fmtDate(p.updated_at)}</div>
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
          View profile: {currentPage}/{totalPages}
        </div>
        <div className='space-x-2 flex items-center'>
          <button
            className='px-3 py-1 rounded-full'
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <BsArrowLeftCircle className='text-2xl' />
          </button>

          {(() => {
            const pageButtons: React.ReactNode[] = []
            const startPage = Math.max(1, currentPage - 2)
            const endPage = Math.min(totalPages, currentPage + 2)

            if (startPage > 1) {
              pageButtons.push(
                <button
                  key={1}
                  className={`px-3 py-1 rounded-full ${currentPage === 1 ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
              )
              if (startPage > 2) {
                pageButtons.push(<span key='start-ellipsis'>...</span>)
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pageButtons.push(
                <button
                  key={i}
                  className={`px-3 py-1 rounded-full ${currentPage === i ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i}
                </button>
              )
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pageButtons.push(<span key='end-ellipsis'>...</span>)
              }
              pageButtons.push(
                <button
                  key={totalPages}
                  className={`px-3 py-1 rounded-full ${currentPage === totalPages ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              )
            }

            return pageButtons
          })()}

          <button
            className='px-3 py-1 rounded-full'
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <BsArrowRightCircle className='text-2xl' />
          </button>
        </div>
      </div>
    </div>
  )
}
