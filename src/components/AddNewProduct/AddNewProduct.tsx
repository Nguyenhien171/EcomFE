import React, { useState, useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateProductSchema } from '../../schemas/productSchema'

// Kiểu từ schema (trước khi parse)
type Product = z.infer<typeof updateProductSchema>
type UpdateProductFormInput = z.input<typeof updateProductSchema>

// Dạng dữ liệu lưu trong localStorage (dates là string, image là string)
type StoredProduct = Omit<Product, 'created_at' | 'updated_at' | 'image'> & {
  created_at?: string
  updated_at?: string
  image?: string
}

type AddNewProductProps = { onSaved?: (p: Product) => void }

export default function AddNewProduct({ onSaved }: AddNewProductProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Quản lý ảnh từ thiết bị + preview
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UpdateProductFormInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: undefined,
      name: '',
      code: ''
    }
  })

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }
  // helper chuyển File -> dataURL
  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  // parse JSON an toàn, không dùng any
  const parseJSON = <T,>(raw: string, fallback: T): T => {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  const onSubmit: SubmitHandler<UpdateProductFormInput> = async (values) => {
    const parsed = updateProductSchema.parse(values)
    console.log('Product Data (parsed):', parsed)
    console.log('Image:', imageFile)

    let imageString = ''
    if (imageFile) {
      imageString = await fileToDataURL(imageFile)
    } else if (typeof parsed.image === 'string') {
      imageString = parsed.image
    }

    const id = parsed.id ?? Date.now()
    const createdISO = (parsed.created_at ?? new Date()).toISOString()
    const updatedISO = new Date().toISOString()

    // Bản ghi để LƯU localStorage (string dates)
    const recordToStore: StoredProduct = {
      ...parsed,
      id,
      image: imageString,
      created_at: createdISO,
      updated_at: updatedISO
    }

    // Bản ghi để TRẢ lên UI (Date objects)
    const recordForUI: Product = {
      ...parsed,
      id,
      image: imageString,
      created_at: new Date(createdISO),
      updated_at: new Date(updatedISO)
    }

    // Lưu vào localStorage
    const KEY = 'products'
    const existingRaw = localStorage.getItem(KEY)
    const list = existingRaw ? parseJSON<StoredProduct[]>(existingRaw, []) : []
    list.push(recordToStore)
    localStorage.setItem(KEY, JSON.stringify(list))

    console.log('Save:', recordToStore)
    onSaved?.(recordForUI)

    closeModal()
  }

  const closeModal = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setImageFile(null)
    reset()
    setIsOpen(false)
  }

  const previewSrc = useMemo(() => imagePreview, [imagePreview])

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:opacity-95'
      >
        Add New Product +
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 overflow-y-auto'>
          <div className='mx-auto my-6 w-[98%] max-w-6xl rounded-2xl bg-white shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <div>
                <h2 className='text-2xl font-bold'>Add New Product</h2>
              </div>
              <div className='flex items-center gap-2'>
                <button onClick={closeModal} className='px-4 py-2 rounded-full border hover:bg-gray-50'>
                  Cancel
                </button>
                <button
                  form='add-product-form'
                  type='submit'
                  className='px-5 py-2 rounded-full bg-indigo-600 text-white hover:opacity-95'
                >
                  Save
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
                    <h3 className='font-semibold mb-3'>Thumbnail</h3>
                    <div className='rounded-2xl border bg-gray-50 p-4 flex flex-col items-center'>
                      <div className='w-56 h-56 rounded-2xl bg-white border flex items-center justify-center overflow-hidden'>
                        {previewSrc ? (
                          <img src={previewSrc} alt='preview' className='w-full h-full object-contain' />
                        ) : (
                          <span className='text-gray-400 text-sm'>No image selected</span>
                        )}
                      </div>

                      <div className='mt-4 flex flex-col gap-2 w-full'>
                        <label className='text-sm text-gray-600'>Select image from device</label>
                        <input
                          type='file'
                          accept='image/png,image/jpeg,image/jpg'
                          onChange={onPickFile}
                          className='block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:opacity-95'
                        />
                        <p className='text-xs text-gray-500'>Only *.png, *.jpg & *.jpeg are accepted</p>
                      </div>

                      <div className='mt-3 flex items-center gap-2 text-xs text-gray-500'>
                        <span className='inline-block h-2 w-2 rounded-full bg-green-500' />
                        Ready
                      </div>
                    </div>
                  </section>

                  {/* Status */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Status</h3>
                    <select className='w-full rounded-xl border px-3 py-2 text-sm'>
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </section>

                  {/* Product details (Phần lấy api backend hoặc nhập tay => Sửa lại sau) */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>Product Details</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='text-xs text-gray-500'>Product Code</label>
                        <input {...register('code')} className='w-full rounded-xl border px-3 py-2' />
                        {errors.code && <p className='text-xs text-red-500 mt-1'>{errors.code.message as string}</p>}
                      </div>
                      <div>
                        <label className='text-xs text-gray-500'>Category ID</label>
                        <input
                          type='number'
                          {...register('category_id', {
                            setValueAs: (v) => (v === '' ? undefined : Number(v))
                          })}
                          className='w-full rounded-xl border px-3 py-2'
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className='space-y-6 lg:col-span-2'>
                  {/* General */}
                  <section className='rounded-2xl border p-4'>
                    <h3 className='font-semibold mb-3'>General</h3>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium'>Product Name</label>
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
                    <h3 className='font-semibold mb-3'>Price Detail Product</h3>
                    <div className='grid md:grid-cols-2 gap-4'>
                      {[
                        { name: 'weight', label: 'Weight (grams)' },
                        { name: 'gold_price_at_time', label: 'Gold Price at Time' },
                        { name: 'labor_cost', label: 'Labor Cost' },
                        { name: 'stone_cost', label: 'Stone Cost' },
                        { name: 'markup_rate', label: 'Markup Rate (%)' },
                        { name: 'selling_price', label: 'Selling Price' }
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
                        <label className='block text-sm font-medium'>Warranty Period (months)</label>
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
