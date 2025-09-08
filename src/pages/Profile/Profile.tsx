import { useState } from 'react'
import { CiEdit, CiSaveDown1 } from 'react-icons/ci'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState({
    firstName: 'Tài',
    lastName: 'Đẹp Zai',
    dob: '12/1/2005',
    email: 'info@gmail.com',
    phone: '19001868',
    role: 'Admin',
    country: 'Việt Nam',
    city: 'Hồ Chí Minh',
    postal: '71000',
    location: 'Hồ Chí Minh',
    avatar: 'https://www.animedep.com/wp-content/uploads/2025/07/anh-kaoruko-waguri-6.webp'
  })

  const handleChange = <K extends keyof typeof user>(key: K, value: (typeof user)[K]) => {
    setUser((u) => ({ ...u, [key]: value }))
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Profile</h1>

      {/* Header Card (inline) */}
      <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
        <div className='flex items-center gap-4'>
          <img src={user.avatar} alt='avatar' className='h-16 w-16 rounded-full object-cover' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>{user.firstName + ' ' + user.lastName}</h3>
            <p className={`text-sm font-medium ${user.role === 'Admin' ? 'text-amber-600' : 'text-sky-600'}`}>
              {user.role}
            </p>

            <p className='text-xs text-slate-500'>{user.city}</p>
          </div>
          <button
            className='rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50'
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? <CiSaveDown1 className='text-xl text-green-600' /> : <CiEdit className='text-xl text-red-600' />}
          </button>
        </div>
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        {/* Information (inline) */}
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <h2 className='mb-4 text-sm font-semibold text-slate-700'>Information</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* First Name */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>First Name</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.firstName}</div>
              )}
            </label>

            {/* Last Name */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Last Name</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.lastName}</div>
              )}
            </label>

            {/* Date */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Date of Birth</span>
              {editing ? (
                <input
                  type='date'
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.dob}</div>
              )}
            </label>

            {/* Phone */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Phone Number</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.phone}</div>
              )}
            </label>

            {/* Email */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Email Address</span>
              {editing ? (
                <input
                  type='email'
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.email}</div>
              )}
            </label>

            {/* Role */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>User Role</span>
              {editing ? (
                <select
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Staff</option>
                </select>
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.role}</div>
              )}
            </label>
          </div>
        </div>

        {/* Address (inline) */}
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <h2 className='mb-4 text-sm font-semibold text-slate-700'>Address</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Country */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Country</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.country}</div>
              )}
            </label>

            {/* City */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>City</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.city}</div>
              )}
            </label>

            {/* Postal Code */}
            <label className='block'>
              <span className='mb-1 block text-xs text-slate-500'>Postal Code</span>
              {editing ? (
                <input
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
                  value={user.postal}
                  onChange={(e) => handleChange('postal', e.target.value)}
                />
              ) : (
                <div className='mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>{user.postal}</div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
