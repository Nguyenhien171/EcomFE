import React from 'react'
import http from '../../utils/axios.http'
import { isAxiosError } from 'axios'
// --- Types ---
export type NewUserInput = {
  username: string
  password: string
  confirmPassword: string
  full_name: string
  email?: string
  phone?: string
  role: 'Admin' | 'Manager' | 'Staff'
  status: 'active' | 'inactive'
}

type ApiEnvelope<T = unknown> = { result: T; message?: string }

// --- Maps ---
const ROLE_UPPER: Record<NewUserInput['role'], string> = {
  Admin: 'ADMIN',
  Manager: 'MANAGER',
  Staff: 'STAFF'
}

// --- Constants ---
const initialForm: NewUserInput = {
  username: '',
  password: '',
  confirmPassword: '',
  full_name: '',
  email: '',
  phone: '',
  role: 'Staff',
  status: 'active'
}

type Props = {
  open: boolean
  onClose: () => void
}

const INPUT_CLS =
  'w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'

export default function CreateAccount({ open, onClose }: Props) {
  const [form, setForm] = React.useState<NewUserInput>(initialForm)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // UI extras
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    // --- validate ---
    const v: Record<string, string> = {}
    if (!form.username.trim()) v.username = 'Username is required'
    else if (form.username.length > 50) v.username = 'Max 50 chars'

    if (!form.full_name.trim()) v.full_name = 'Full name is required'

    if (!form.password) v.password = 'Password is required'
    else if (form.password.length < 6) v.password = 'Min 6 characters'

    if (form.confirmPassword !== form.password) v.confirmPassword = 'Passwords do not match'

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) v.email = 'Invalid email'
    if (form.phone && !/^[+0-9 ()-]{6,20}$/.test(form.phone)) v.phone = 'Invalid phone'

    setErrors(v)
    if (Object.keys(v).length) return

    // --- payload chuẩn cho BE ---
    const payload = {
      username: form.username.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
      role: ROLE_UPPER[form.role], // ADMIN | MANAGER | STAFF
      isActive: form.status === 'active' // boolean
    }

    setSubmitting(true)
    try {
      const res = await http.post<ApiEnvelope>('/v1/users', payload)
      setMessage({ type: 'success', text: res.data?.message || 'Account created successfully' })
      setForm(initialForm)
      setErrors({})
      onClose()
    } catch (err: unknown) {
      // catch (err: any) {
      //   const status: number | undefined = err?.response?.status
      //   const beMsg: string | undefined = err?.response?.data?.message || err?.response?.data?.error || err?.message

      //   let text = beMsg || 'Failed to create account'
      //   if (status === 409) {
      //     text = beMsg || 'Username or email already exists'
      //   } else if (status === 400 || status === 422) {
      //     text = beMsg || 'Validation failed'
      //   } else if (status === 401 || status === 403) {
      //     text = beMsg || 'Unauthorized. Your session may have expired.'
      //   }

      //   setMessage({ type: 'error', text })
      // }
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string; error?: string } | undefined
        const beMsg = data?.message || data?.error
        let text = beMsg || err.message || 'Failed to create account'

        const status = err.response?.status
        if (status === 409) {
          text = beMsg || 'Username or email already exists'
        } else if (status === 400 || status === 422) {
          text = beMsg || 'Validation failed'
        } else if (status === 401 || status === 403) {
          text = beMsg || 'Unauthorized. Your session may have expired.'
        }

        setMessage({ type: 'error', text })
      } else if (err instanceof Error) {
        setMessage({ type: 'error', text: err.message })
      } else {
        setMessage({ type: 'error', text: 'Unknown error' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      aria-modal='true'
      role='dialog'
      aria-labelledby='create-account-title'
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* modal */}
      <div
        className={`relative z-10 w-[92vw] max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* header */}
        <div className='flex items-center justify-between gap-3 border-b border-slate-100 p-5'>
          <div>
            <h2 id='create-account-title' className='text-lg font-semibold text-slate-900'>
              Create Account
            </h2>
            <p className='mt-0.5 text-xs text-slate-500'>
              Add a new user to your workspace. Fields marked * are required.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-2 text-sm hover:bg-slate-50'
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        {/* body */}
        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-4 p-5 md:grid-cols-2'>
          {/* Username */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Username *</span>
            <input
              className={INPUT_CLS}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder='johndoe'
              required
              autoFocus
            />
            {errors.username && <span className='mt-1 block text-xs text-rose-600'>{errors.username}</span>}
          </label>

          {/* Full name */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Full name *</span>
            <input
              className={INPUT_CLS}
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder='John Doe'
              required
            />
            {errors.full_name && <span className='mt-1 block text-xs text-rose-600'>{errors.full_name}</span>}
          </label>

          {/* Email */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Email</span>
            <input
              className={INPUT_CLS}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder='name@example.com'
              type='email'
            />
            {errors.email && <span className='mt-1 block text-xs text-rose-600'>{errors.email}</span>}
          </label>

          {/* Phone */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Phone</span>
            <input
              className={INPUT_CLS}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder='(+84) 912 345 678'
            />
            {errors.phone && <span className='mt-1 block text-xs text-rose-600'>{errors.phone}</span>}
          </label>

          {/* Password */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Password *</span>
            <div className='relative'>
              <input
                className={`${INPUT_CLS} pr-24`}
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder='••••••••'
                required
              />
              <button
                type='button'
                onClick={() => setShowPwd((s) => !s)}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50'
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className='mt-1 block text-xs text-rose-600'>{errors.password}</span>}
          </label>

          {/* Confirm password */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Confirm password *</span>
            <div className='relative'>
              <input
                className={`${INPUT_CLS} pr-24`}
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder='••••••••'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirm((s) => !s)}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50'
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='mt-1 block text-xs text-rose-600'>{errors.confirmPassword}</span>
            )}
          </label>

          {/* Role */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Role</span>
            <select
              className={INPUT_CLS}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as NewUserInput['role'] }))}
            >
              <option value='Admin'>Admin</option>
              <option value='Manager'>Manager</option>
              <option value='Staff'>Staff</option>
            </select>
          </label>

          {/* Status */}
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-slate-600'>Status</span>
            <select
              className={INPUT_CLS}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NewUserInput['status'] }))}
            >
              <option value='active'>active</option>
              <option value='inactive'>inactive</option>
            </select>
          </label>

          {/* Footer */}
          <div className='col-span-full mt-2 flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              className='rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </div>

          {message && (
            <div className='col-span-full -mt-1'>
              <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {message.text}
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
