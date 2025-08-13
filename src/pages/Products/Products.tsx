import { TfiReload } from 'react-icons/tfi'
import { FaSearch } from 'react-icons/fa'
import { FaDownload } from 'react-icons/fa6'
import React, { useState, useEffect } from 'react'
import { BsArrowRightCircle } from 'react-icons/bs'
import { BsArrowLeftCircle } from 'react-icons/bs'
import type { Product } from '../../@types/products.type'
import { SAMPLE_PRODUCTS } from '../../data/products'
const e = new Date().toLocaleString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
})
console.log(e)

export default function Products() {
  const [query, setQuery] = useState('')
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [filtered, setFiltered] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [time, setTime] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return setFiltered(products)

    setFiltered(products.filter((p) => p.title.toLowerCase().includes(q)))
  }

  const clearFilters = () => {
    setQuery('')
    setFiltered(products)
  }

  const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
    if (stock <= 0) {
      return <span className='text-red-600 font-medium'>Stock Out ({stock})</span>
    }
    if (stock < 10) {
      return <span className='text-orange-600 font-medium'>Stock Low ({stock})</span>
    }
    return <span className='text-green-600 font-medium'>In Stock ({stock})</span>
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
          <div className='text-sm'>
            {time.toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
          <div className='flex items-center justify-center px-4 border-l-2 cursor-pointer'>
            <TfiReload className='mr-2' />
            Data Refresh
          </div>
        </div>
      </div>
      {/* Modal và Search */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-3'>
          <button className='bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:opacity-95'>
            Add New Product +
          </button>
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
        <strong className='text-gray-800'>All (1254)</strong>
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
        <button className='px-4 py-2 bg-indigo-600 text-white rounded'>Apply</button>
        <button type='button' onClick={clearFilters} className='px-4 py-2 border rounded'>
          Clear
        </button>
      </div>
      {/* Table */}
      <div className='overflow-x-auto bg-white border rounded'>
        <table className='min-w-full table-auto text-sm'>
          <thead>
            <tr className='bg-blue-50 text-left text-xs text-blue-600'>
              <th className='px-6 py-3'>PRODUCT TITLE</th>
              <th className='px-6 py-3'>SKU</th>
              <th className='px-6 py-3'>STOCK</th>
              <th className='px-6 py-3'>PRICE</th>
              <th className='px-6 py-3'>CATEGORIES</th>
              <th className='px-6 py-3'>TYPE</th>
              <th className='px-6 py-3'>TAGS</th>
              <th className='px-6 py-3'>RATE</th>
              <th className='px-6 py-3'>DATE</th>
              <th className='px-6 py-3'>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <tr key={p.id} className='border-t hover:bg-gray-50 align-top'>
                <td className='px-6 py-4 max-w-[360px]'>
                  <div className='font-medium text-gray-800'>{p.title}</div>
                </td>
                <td className='px-6 py-4 text-gray-600'>{p.sku}</td>
                <td className='px-6 py-4'>
                  <StockBadge stock={p.stock} />
                </td>
                <td className='px-6 py-4'>{p.price}</td>
                <td className='px-6 py-4 text-blue-600'>{p.category}</td>
                <td className='px-6 py-4 text-gray-600'>{p.type}</td>
                <td className='px-6 py-4 text-xs text-gray-600'>
                  <div className='flex gap-2 flex-wrap'>
                    {p.tags.map((t, i) => (
                      <span key={i} className='px-2 py-1 bg-gray-100 rounded'>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-orange-400'>★</span>
                    <span>{p.rating}</span>
                  </div>
                </td>
                <td className='px-6 py-4 text-gray-500'>
                  <div>{p.date}</div>
                  <div className='text-xs text-gray-400'>Last Edited</div>
                </td>
                <td className='px-6 py-4'>
                  <button className='p-2 rounded hover:bg-gray-100'>⋮</button>
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
            const pageButtons = []
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
