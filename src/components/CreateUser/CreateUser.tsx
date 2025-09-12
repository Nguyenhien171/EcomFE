import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormData } from '../../schemas/userSchema'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../contexts/AuthContext'
import axios from 'axios'

type CreateUserProps = { onSaved?: () => void }

export default function CreateUser({ onSaved }: CreateUserProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  
  const { user, canCreateUser } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'STAFF',
      status: 'active'
    }
  })

  const onSubmit: SubmitHandler<CreateUserFormData> = async (values) => {
    setIsLoading(true)
    setError("")

    try {
      // Check if user can create the target role
      if (!canCreateUser(values.role)) {
        setError("Bạn không có quyền tạo user với role này")
        return
      }

      // TODO: Call API to create user
      // console.log('Create User Data:', values)
      
      // // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000))
      

      await axios.post('/users', values)
      
      onSaved?.()
      closeModal()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Create user error:", error)
      setError(error.response?.data?.message || "Tạo user thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setError("")
    reset()
    setIsOpen(false)
  }

  // Get available roles based on current user's role
  const getAvailableRoles = (): UserRole[] => {
    if (!user) return []
    
    if (user.role === 'ADMIN') {
      return ['MANAGER', 'STAFF']
    }
    
    if (user.role === 'MANAGER') {
      return ['STAFF']
    }
    
    return []
  }

  const availableRoles = getAvailableRoles()

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-green-600 text-white px-4 py-2 rounded shadow-sm hover:opacity-95'
      >
        Create User +
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 overflow-y-auto'>
          <div className='mx-auto my-6 w-[98%] max-w-2xl rounded-2xl bg-white shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <div>
                <h2 className='text-2xl font-bold'>Create New User</h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Current user: {user?.role} - {user?.full_name}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button onClick={closeModal} className='px-4 py-2 rounded-full border hover:bg-gray-50'>
                  Cancel
                </button>
                <button
                  form='create-user-form'
                  type='submit'
                  disabled={isLoading}
                  className={`px-5 py-2 rounded-full text-white hover:opacity-95 ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            {/* Body */}
            <form id='create-user-form' onSubmit={handleSubmit(onSubmit)}>
              <div className='p-6 space-y-6'>
                {error && (
                  <div className='text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg'>
                    {error}
                  </div>
                )}

                {/* Basic Information */}
                <section className='space-y-4'>
                  <h3 className='font-semibold text-lg'>Basic Information</h3>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>Username *</label>
                      <input
                        {...register('username')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Enter username'
                      />
                      {errors.username && (
                        <p className='text-xs text-red-500 mt-1'>{errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-1'>Full Name *</label>
                      <input
                        {...register('full_name')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Enter full name'
                      />
                      {errors.full_name && (
                        <p className='text-xs text-red-500 mt-1'>{errors.full_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>Email *</label>
                      <input
                        type='email'
                        {...register('email')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Enter email'
                      />
                      {errors.email && (
                        <p className='text-xs text-red-500 mt-1'>{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-1'>Phone *</label>
                      <input
                        {...register('phone')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Enter phone number'
                      />
                      {errors.phone && (
                        <p className='text-xs text-red-500 mt-1'>{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-1'>Password *</label>
                    <input
                      type='password'
                      {...register('password')}
                      className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Enter password'
                    />
                    {errors.password && (
                      <p className='text-xs text-red-500 mt-1'>{errors.password.message}</p>
                    )}
                  </div>
                </section>

                {/* Role and Status */}
                <section className='space-y-4'>
                  <h3 className='font-semibold text-lg'>Role & Status</h3>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>Role *</label>
                      <select
                        {...register('role')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {availableRoles.map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className='text-xs text-red-500 mt-1'>{errors.role.message}</p>
                      )}
                      <p className='text-xs text-gray-500 mt-1'>
                        Available roles: {availableRoles.join(', ')}
                      </p>
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-1'>Status</label>
                      <select
                        {...register('status')}
                        className='w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
