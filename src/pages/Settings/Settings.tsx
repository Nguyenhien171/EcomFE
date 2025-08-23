import { useState } from 'react'

export default function Settings() {
  const [language, setLanguage] = useState('English')
  const [btn, setBtn] = useState(true)

  // handle xữ lí logic (task mới)
  const handleLogout = () => {
    alert('Đăng xuất thành công.....')
  }

  const handleChangePass = () => {
    alert('Đổi mật khẩu....')
  }

  return (
    <div className='min-h-screen w-full bg-slate-50 p-6 text-slate-900'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Settings</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* General */}
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <h2 className='mb-4 text-sm font-semibold text-slate-700'>General</h2>

          <label className='mb-2 block text-sm text-slate-600'>Language</label>
          <div className='relative max-w-xs'>
            <select
              className='w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Tiếng Việt</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <h2 className='mb-4 text-sm font-semibold text-slate-700'>Security</h2>

          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>Two-factor authentication</p>
              <p className='text-xs text-slate-500'>Protect your account with an extra layer.</p>
            </div>

            {/* Toggle viết trực tiếp */}
            <button
              onClick={() => setBtn((v) => !v)}
              className='relative h-8 w-14 rounded-full bg-slate-200 transition focus:outline-none border-2 border-black'
              aria-pressed={btn}
              aria-label='Toggle'
            >
              <span
                className='absolute left-0 top-0 z-10 m-1 h-5 w-5 rounded-full bg-white shadow transition-transform'
                style={{ transform: btn ? 'translateX(20px)' : 'translateX(0)' }}
              />
              <span
                className='absolute inset-0 rounded-full transition'
                style={{
                  background: btn ? '#ff2d00ff' : '#e2e8f0',
                  opacity: 1
                }}
              />
            </button>
          </div>

          <div className='mt-4 flex flex-row gap-3'>
            <button
              onClick={handleChangePass}
              className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
            >
              Change password
            </button>
            <button
              onClick={handleLogout}
              className='rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700'
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
