import React, { useState, useMemo, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { z } from 'zod'
import { updateProductSchema } from '../../schemas/productSchema'
import http from '../../utils/axios.http'

// Kiểu từ schema (trước khi parse)
type Product = z.infer<typeof updateProductSchema>
type UpdateProductFormInput = z.input<typeof updateProductSchema>

// Kiểu dữ liệu giá vàng từ API
interface GoldPrice {
  id: string
  date: string
  goldType: string
  buyPrice: number
  sellPrice: number
}

// Kiểu dữ liệu danh mục từ API
interface Category {
  id: number
  name: string
}

type AddNewProductProps = { onSaved?: (p: Product) => void }

export default function AddNewProduct({ onSaved }: AddNewProductProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Quản lý ảnh từ thiết bị + preview
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // State cho giá vàng
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedGoldTypeId, setSelectedGoldTypeId] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<UpdateProductFormInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: undefined,
      name: '',
      code: ''
    }
  })

  // Lấy giá trị các trường để tính toán tự động
  const [weight, goldPrice, laborCost, stoneCost, markupRate] = watch([
    'weight',
    'gold_price_at_time',
    'labor_cost',
    'stone_cost',
    'markup_rate'
  ])

  // Fetch giá vàng khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setDataLoading(true)
        try {
          const [goldPricesRes, categoriesRes] = await Promise.all([
            http.get<{ goldPrices: GoldPrice[] }>('/v1/latest-gold-prices'),
            http.get<{ categories: Category[] }>('/v1/product-categories')
          ])
          setGoldPrices(goldPricesRes.data.goldPrices)
          setCategories(categoriesRes.data.categories)
        } catch (err) {
          console.error('Không thể tải dữ liệu:', err)
        } finally {
          setDataLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen])

  // Tự động tính giá bán
  useEffect(() => {
    const [w, gp, lc, sc, mr] = [weight, goldPrice, laborCost, stoneCost, markupRate].map((v) => {
      if (v === undefined || v === null || v === '') return 0
      const num = parseFloat(String(v).replace(',', '.'))
      return isNaN(num) ? 0 : num
    })

    const basePrice = w * gp + lc + sc
    const finalPrice = basePrice * (1 + mr / 100)
    setValue('selling_price', finalPrice, { shouldValidate: true })
  }, [weight, goldPrice, laborCost, stoneCost, markupRate, setValue])

  // Dọn dẹp URL preview ảnh
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file_data', file)

    try {
      const response = await http.post<{ file_url: string }>('/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setUploadedImageUrl(response.data.file_url)
    } catch (err: any) {
      console.error('Lỗi tải ảnh lên:', err)
      setUploadError(err.response?.data?.message || 'Không thể tải ảnh lên.')
      // Clear preview if upload fails
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
      setImageFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset previous upload state
    setUploadedImageUrl(null)
    setUploadError(null)
    setImageFile(file)

    // Create and set preview
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    const url = URL.createObjectURL(file)
    setImagePreview(url)

    // Upload the file
    handleFileUpload(file)
  }

  const onSubmit: SubmitHandler<UpdateProductFormInput> = async (formValues) => {
    if (isUploading) {
      alert('Vui lòng chờ ảnh tải lên xong.')
      return
    }

    const payload = {
      name: formValues.name,
      code: formValues.code,
      category_id: formValues.category_id ? Number(formValues.category_id) : undefined,
      weight: formValues.weight ? parseFloat(String(formValues.weight).replace(',', '.')) : undefined,
      labor_cost: formValues.labor_cost ? parseFloat(String(formValues.labor_cost).replace(',', '.')) : undefined,
      stone_cost: formValues.stone_cost ? parseFloat(String(formValues.stone_cost).replace(',', '.')) : 0,
      markup_rate: formValues.markup_rate ? parseFloat(String(formValues.markup_rate).replace(',', '.')) / 100 : undefined,
      warranty_period: formValues.warranty_period ? Number(formValues.warranty_period) : undefined,
      gold_type: selectedGoldTypeId ? Number(selectedGoldTypeId) : undefined,
      image: uploadedImageUrl
    }

    try {
      const response = await http.post('/v1/products', payload)
      const apiProduct = response.data.product || response.data

      const recordForUI: Product = {
        ...apiProduct,
        category_id: apiProduct.categoryId,
        gold_price_at_time: apiProduct.goldPriceAtTime,
        labor_cost: apiProduct.laborCost,
        stone_cost: apiProduct.stoneCost,
        markup_rate: apiProduct.markupRate,
        selling_price: apiProduct.sellingPrice,
        warranty_period: apiProduct.warrantyPeriod,
        created_at: apiProduct.createdAt ? new Date(apiProduct.createdAt) : undefined,
        updated_at: apiProduct.updatedAt ? new Date(apiProduct.updatedAt) : undefined
      }

      onSaved?.(recordForUI)
      closeModal()
    } catch (err: any) {
      console.error('Lỗi tạo sản phẩm:', err)
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể tạo sản phẩm.'}`)
    }
  }

  const closeModal = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setImageFile(null)
    setUploadedImageUrl(null)
    setUploadError(null)
    setSelectedGoldTypeId('')
    reset()
    setIsOpen(false)
  }

  const previewSrc = useMemo(() => imagePreview, [imagePreview])

  const handleGoldTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const goldId = e.target.value
    setSelectedGoldTypeId(goldId)
    const selectedGold = goldPrices.find((p) => p.id === goldId)
    if (selectedGold) {
      // Sử dụng giá bán cho tính toán
      setValue('gold_price_at_time', selectedGold.sellPrice, { shouldValidate: true })
    } else {
      setValue('gold_price_at_time', 0, { shouldValidate: true })
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:opacity-95'
      >
        Thêm sản phẩm mới +
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 overflow-y-auto'>
          <div className='mx-auto my-6 w-[98%] max-w-6xl rounded-2xl bg-white shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <div>
                <h2 className='text-2xl font-bold'>Thêm sản phẩm mới</h2>
              </div>
              <div className='flex items-center gap-2'>
                <button type='button' onClick={closeModal} className='px-4 py-2 rounded-full border hover:bg-gray-50'>
                  Hủy
                </button>
                <button
                  form='add-product-form'
                  type='submit'
                  className='px-5 py-2 rounded-full bg-indigo-600 text-white hover:opacity-95 disabled:opacity-50'
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>

            {/* Body */}
            <form id='add-product-form' onSubmit={handleSubmit(onSubmit)}>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 p-6'>
                {/* LEFT COLUMN */}
                <div className='space-y-6 lg:col-span-1'>
                  {/* Thumbnail */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Ảnh thu nhỏ</h3>
                    <div className='rounded-2xl border bg-gray-50 p-4 flex flex-col items-center'>
                      <div className='w-56 h-56 rounded-2xl bg-white border flex items-center justify-center overflow-hidden'>
                        {isUploading ? (
                          <div className='flex flex-col items-center gap-2 text-gray-500'>
                            <FaSpinner className='animate-spin text-2xl' />
                            <span>Đang tải lên...</span>
                          </div>
                        ) : uploadError ? (
                          <div className='flex flex-col items-center gap-2 p-2 text-center text-red-500'>
                            <FaExclamationTriangle className='text-2xl' />
                            <span className='text-xs'>{uploadError}</span>
                          </div>
                        ) : previewSrc ? (
                          <img src={previewSrc} alt='preview' className='w-full h-full object-contain' />
                        ) : (
                          <span className='text-gray-400 text-sm'>Chưa chọn ảnh</span>
                        )}
                      </div>

                      <div className='mt-4 flex flex-col gap-2 w-full'>
                        <label className='text-sm text-gray-600'>Chọn ảnh từ thiết bị</label>
                        <input
                          type='file'
                          accept='image/png,image/jpeg,image/jpg'
                          onChange={onPickFile}
                          className='block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:opacity-95'
                        />
                        <p className='text-xs text-gray-500'>Chỉ chấp nhận ảnh *.png, *.jpg & *.jpeg</p>
                      </div>

                      <div className='mt-3 flex items-center gap-2 text-xs text-gray-500'>
                        {isUploading ? (
                          <>
                            <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500' />
                            Đang tải...
                          </>
                        ) : uploadError ? (
                          <>
                            <span className='inline-block h-2 w-2 rounded-full bg-red-500' />
                            Tải lên thất bại
                          </>
                        ) : uploadedImageUrl ? (
                          <>
                            <span className='inline-block h-2 w-2 rounded-full bg-green-500' />
                            Tải lên thành công
                          </>
                        ) : (
                          <span className='text-gray-400'>Chưa có ảnh</span>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Status */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Trạng thái</h3>
                    <select className='w-full rounded-xl border px-3 py-2 text-sm'>
                      <option>Đã xuất bản</option>
                      <option>Bản nháp</option>
                      <option>Lưu trữ</option>
                    </select>
                  </section>

                  {/* Product details (Phần lấy api backend hoặc nhập tay => Sửa lại sau) */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Chi tiết sản phẩm</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='text-xs text-gray-500'>Mã sản phẩm</label>
                        <input {...register('code')} className='w-full rounded-xl border px-3 py-2' />
                        {errors.code && <p className='text-xs text-red-500 mt-1'>{errors.code.message as string}</p>}
                      </div>
                      <div>
                        <label className='text-xs text-gray-500'>Danh mục</label>
                        <select
                          {...register('category_id', {
                            setValueAs: (v) => (v === '' ? undefined : Number(v))
                          })}
                          className='w-full rounded-xl border px-3 py-2'
                          disabled={dataLoading}
                        >
                          <option value=''>{dataLoading ? 'Đang tải...' : 'Chọn danh mục'}</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {errors.category_id && <p className='text-xs text-red-500 mt-1'>{String(errors.category_id.message)}</p>}
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className='space-y-6 lg:col-span-2'>
                  {/* General */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Thông tin chung</h3>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium'>Tên sản phẩm</label>
                        <input {...register('name')} className='mt-1 w-full rounded-xl border px-3 py-2' />
                        {errors.name && <p className='text-xs text-red-500 mt-1'>{errors.name.message as string}</p>}
                      </div>

                      {/* Description có thẻ có hoặc không (Nếu có làm trang show sản phẩm thì sử dụng còn không thì ẩn dòng này)*/}
                      {/* <div>
                        <label className='block text-sm font-medium'>Description</label>
                        <div className='mt-1 rounded-xl border'>
                          <div className='flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border-b'>
                            <select className='rounded-md border px-2 py-1 text-xs'>
                              <option>Normal</option>
                              <option>Highlight</option>
                            </select>
                            <div className='ml-auto flex gap-2'>
                              <button type='button' className='px-2 py-1 rounded hover:bg-gray-100'>
                                B
                              </button>
                              <button type='button' className='px-2 py-1 rounded hover:bg-gray-100'>
                                I
                              </button>
                              <button type='button' className='px-2 py-1 rounded hover:bg-gray-100'>
                                H
                              </button>
                            </div>
                          </div>
                          <textarea
                            className='w-full resize-none p-3 outline-none rounded-b-xl'
                            rows={4}
                            placeholder='Write product description...'
                          />
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          A product name is required and recommended to be unique.
                        </p>
                      </div> */}
                    </div>
                  </section>

                  {/* Price */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Chi tiết giá sản phẩm</h3>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium'>Loại vàng</label>
                        <select
                          value={selectedGoldTypeId}
                          onChange={handleGoldTypeChange}
                          className='mt-1 w-full rounded-xl border px-3 py-2'
                          disabled={dataLoading}
                        >
                          <option value=''>
                            {dataLoading ? 'Đang tải...' : 'Chọn loại vàng'}
                          </option>
                          {goldPrices.map((price) => (
                            <option key={price.id} value={price.id}>
                              {price.goldType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>Giá vàng tại thời điểm</label>
                        <input
                          {...register('gold_price_at_time')}
                          readOnly
                          className='mt-1 w-full rounded-xl border bg-gray-100 px-3 py-2'
                        />
                        {errors.gold_price_at_time && (
                          <p className='text-xs text-red-500 mt-1'>{String(errors.gold_price_at_time?.message)}</p>
                        )}
                      </div>
                      {[
                        { name: 'weight', label: 'Trọng lượng (gram)' },
                        { name: 'labor_cost', label: 'Tiền công' },
                        { name: 'stone_cost', label: 'Tiền đá' },
                        { name: 'markup_rate', label: 'Tỉ lệ lợi nhuận (%)' }
                      ].map((f) => (
                        <div key={f.name}>
                          <label className='block text-sm font-medium'>{f.label}</label>
                          <input
                            {...register(f.name as keyof UpdateProductFormInput, {
                              // '' -> undefined để schema .optional() bỏ qua
                              setValueAs: (v) => (v === '' ? undefined : String(v).replace(',', '.'))
                            })}
                            className='mt-1 w-full rounded-xl border px-3 py-2'
                          />
                          {errors[f.name as keyof UpdateProductFormInput] && (
                            <p className='text-xs text-red-500 mt-1'>
                              {String(errors[f.name as keyof UpdateProductFormInput]?.message)}
                            </p>
                          )}
                        </div>
                      ))}

                      <div>
                        <label className='block text-sm font-medium'>Giá bán</label>
                        <input
                          {...register('selling_price')}
                          readOnly
                          className='mt-1 w-full rounded-xl border bg-gray-100 px-3 py-2'
                        />
                        {errors.selling_price && (
                          <p className='text-xs text-red-500 mt-1'>{String(errors.selling_price?.message)}</p>
                        )}
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>Thời gian bảo hành (tháng)</label>
                        <input
                          type='number'
                          {...register('warranty_period', {
                            setValueAs: (v) => (v === '' ? undefined : Number(v))
                          })}
                          className='mt-1 w-full rounded-xl border px-3 py-2'
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
