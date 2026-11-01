import React, { useState, useEffect } from 'react'
import { FaSpinner, FaExclamationTriangle, FaTimes, FaCoins } from 'react-icons/fa'

// Define the type for a single gold price entry
interface GoldPrice {
  id: string
  date: string
  goldType: string
  buyPrice: number
  sellPrice: number
}

// Helper to format numbers with commas
const formatCurrency = (value: number) => {
  if (value === 0) return '—'
  return new Intl.NumberFormat('vi-VN').format(value)
}

const GoldPricePopup = () => {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchGoldPrices = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('http://localhost:8000/v1/latest-gold-prices')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: { goldPrices: GoldPrice[] } = await response.json()
        setGoldPrices(data.goldPrices)
        if (data.goldPrices.length > 0) {
          setLastUpdated(new Date(data.goldPrices[0].date))
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch gold prices.')
      } finally {
        setLoading(false)
      }
    }

    fetchGoldPrices() // Initial fetch

    const oneHourInMs = 60 * 60 * 1000
    const intervalId = setInterval(fetchGoldPrices, oneHourInMs) // Refetch every hour

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, []) // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className='w-full max-w-7xl rounded-2xl bg-white p-8 shadow-2xl mx-auto'>
      <div className='mb-6 flex items-start justify-between border-b-2 border-yellow-300 pb-4'>
        <div className='flex items-center gap-4'>
          <FaCoins className='text-4xl text-yellow-400' />
          <div>
            <h4 className='text-3xl font-bold text-yellow-900'>Bảng giá vàng hôm nay</h4>
            {lastUpdated && (
              <p className='text-sm text-yellow-700 mt-1'>
                Cập nhật lúc: {lastUpdated.toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => window.close()}
          className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900'
        >
          <FaTimes />
          Đóng
        </button>
      </div>

      <div className='overflow-x-auto rounded-lg border border-yellow-200'>
        <table className='min-w-full divide-y divide-yellow-200'>
          <thead className='bg-yellow-100'>
            <tr className='text-left text-sm font-semibold uppercase tracking-wider text-yellow-900/80'>
              <th className='px-8 py-4'>Loại vàng</th>
              <th className='px-8 py-4 text-right'>Giá mua (VND)</th>
              <th className='px-8 py-4 text-right'>Giá bán (VND)</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-yellow-100 bg-white'>
            {loading && (
              <tr>
                <td colSpan={3} className='p-12 text-center'>
                  <div className='flex items-center justify-center gap-3 text-yellow-700'>
                    <FaSpinner className='animate-spin text-xl' />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={3} className='p-12 text-center'>
                  <div className='flex flex-col items-center justify-center gap-3 text-orange-600'>
                    <FaExclamationTriangle className='text-2xl' />
                    <span>Không thể tải dữ liệu giá vàng.</span>
                    <p className='text-sm text-gray-500'>{error}</p>
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && goldPrices.length === 0 && (
              <tr>
                <td colSpan={3} className='p-12 text-center text-gray-500'>
                  Không có dữ liệu để hiển thị.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              goldPrices.map((price) => (
                <tr key={price.id} className='text-base text-gray-800 hover:bg-yellow-50'>
                  <td className='px-8 py-5 font-medium text-gray-900'>{price.goldType}</td>
                  <td className='px-8 py-5 text-right font-mono'>{formatCurrency(price.buyPrice)}</td>
                  <td className='px-8 py-5 text-right font-mono text-amber-600 font-semibold'>
                    {formatCurrency(price.sellPrice)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GoldPricePopup
