import React, { useState } from 'react'

// Single-file React + TypeScript + Tailwind implementation of the Products Management page.
// Usage: drop this file into a React + TypeScript project configured with Tailwind CSS.
// Component: <ProductsDashboard />

type Product = {
  id: number
  title: string
  sku: string
  stock: number
  price: string
  category: string
  tags: string[]
  rating: number
  date: string
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'OnePlus Nord N30 5G | Unlocked Dual-SIM Android Smart Phone | 6.7" LCD Display',
    sku: 'HY5480',
    stock: 25,
    price: '$250',
    category: 'Electronics',
    tags: ['Top rated', 'Best', 'Popular', 'Phone'],
    rating: 4.2,
    date: '03/12/2023'
  },
  {
    id: 2,
    title: 'Socket Mobile Charging Dock',
    sku: 'E5480',
    stock: 25,
    price: '$50.50',
    category: 'Electronics',
    tags: ['Top rated', 'Popular'],
    rating: 4.2,
    date: '03/12/2023'
  },
  {
    id: 3,
    title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
    sku: 'XZ25',
    stock: 0,
    price: '$9.20',
    category: 'Beauty',
    tags: ['Natural'],
    rating: 4.2,
    date: '03/12/2023'
  }
  // add more if needed
]

function IconMenu() {
  return (
    <svg className='w-5 h-5 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className='w-5 h-5 text-gray-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z'
      />
    </svg>
  )
}

export default function Test() {
  const [query, setQuery] = useState('')
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [filtered, setFiltered] = useState<Product[]>(SAMPLE_PRODUCTS)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return setFiltered(products)
    setFiltered(products.filter((p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
  }

  const clearFilters = () => {
    setQuery('')
    setFiltered(products)
  }

  return (
    <div className='min-h-screen bg-blue-50 flex items-start justify-center p-6'>
      <div className='w-full max-w-[1200px] bg-white rounded shadow-lg overflow-hidden'>
        <div className='flex'>
          {/* Sidebar */}
          <aside className='w-64 border-r bg-white p-6'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold'>
                ★
              </div>
              <div className='text-lg font-semibold'>Starpath</div>
              <button className='ml-auto p-1 rounded hover:bg-gray-100'>
                <IconMenu />
              </button>
            </div>

            <nav className='space-y-2 text-sm text-gray-700'>
              <NavItem label='Dashboard' />
              <NavItem label='Products' active />
              <NavItem label='Orders' />
              <NavItem label='Statistics' />
              <NavItem label='Reviews' />
              <NavItem label='Customers' />
              <NavItem label='Transactions' />
              <NavItem label='Settings' />
              <NavItem label='Profile' />
            </nav>
          </aside>

          {/* Main */}
          <main className='flex-1 p-8'>
            {/* Top area */}
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-2xl font-semibold text-gray-800'>Products management</h1>
              <div className='flex items-center gap-4'>
                <div className='text-sm text-gray-500'>January 25, 2023, 15:25 PM</div>
                <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>A</div>
              </div>
            </div>

            {/* Controls */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
              <div className='flex items-center gap-3'>
                <button className='bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:opacity-95'>
                  Add New Product +
                </button>
                <button className='border px-4 py-2 rounded'>Export CSV</button>

                <div className='hidden md:flex items-center gap-2 text-sm text-gray-600'>
                  <span>Products:</span>
                  <strong className='text-gray-800'>All (1254)</strong>
                  <span className='text-blue-600'>Published (1025)</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  handleSearch(e)
                }}
                className='flex items-center gap-2'
              >
                <div className='relative'>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Search'
                    className='border rounded-full px-4 py-2 pl-10 w-72 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                  />
                  <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                    <IconSearch />
                  </div>
                </div>
                <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded'>
                  Search
                </button>
                <button type='button' onClick={clearFilters} className='px-4 py-2 border rounded'>
                  Clear
                </button>
              </form>
            </div>

            {/* Filter chips */}
            <div className='flex gap-3 flex-wrap mb-6'>
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
              <button className='px-4 py-2 bg-indigo-600 text-white rounded'>Apply</button>
            </div>

            {/* Table */}
            <div className='overflow-x-auto bg-white border rounded'>
              <table className='min-w-full table-auto text-sm'>
                <thead>
                  <tr className='bg-gray-50 text-left text-xs text-gray-600'>
                    <th className='px-6 py-3'>PRODUCT TITLE</th>
                    <th className='px-6 py-3'>SKU</th>
                    <th className='px-6 py-3'>STOCK</th>
                    <th className='px-6 py-3'>PRICE</th>
                    <th className='px-6 py-3'>CATEGORIES</th>
                    <th className='px-6 py-3'>TAGS</th>
                    <th className='px-6 py-3'>RATE</th>
                    <th className='px-6 py-3'>DATE</th>
                    <th className='px-6 py-3'>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
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

            {/* Pagination placeholder */}
            <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
              <div>
                Showing 1 to {filtered.length} of {products.length} entries
              </div>
              <div className='space-x-2'>
                <button className='px-3 py-1 border rounded'>Prev</button>
                <button className='px-3 py-1 border rounded'>1</button>
                <button className='px-3 py-1 border rounded'>2</button>
                <button className='px-3 py-1 border rounded'>Next</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-2 py-2 rounded ${active ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
    >
      <div className='w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs'>{label[0]}</div>
      <div className='truncate'>{label}</div>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className='text-red-600 font-medium'>Stock Out</span>
  }
  if (stock < 10) {
    return <span className='text-orange-600 font-medium'>Stock Low ({stock})</span>
  }
  return <span className='text-green-600 font-medium'>In Stock ({stock})</span>
}
