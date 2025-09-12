import { useEffect, useState } from 'react'
import ActionUser from '../../components/ActionUser'
import { BsArrowRightCircle, BsArrowLeftCircle } from 'react-icons/bs'
import { listUsers, type UserRow } from '../../api/users'
import { TfiReload } from 'react-icons/tfi'
import http from '../../utils/axios.http'
import CreateAccount from '../../components/CreateAccount'
import { isAxiosError } from 'axios'

export default function Customer() {
  // Hardcode token
  const ADMIN_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE2OWNjNmM3YmQ1ZGJlYTA2Mzc1YmEiLCJkaWQiOiI2OGM0NmNiODM2NGRjNTU5NTdiMzkyMTIiLCJyb2xlIjoiQURNSU4iLCJpc3MiOiJhdXRoLXNlcnZpY2UiLCJhdWQiOlsianNzLWFwaSJdLCJleHAiOjE3NTc3MDQyNTMsIm5iZiI6MTc1NzcwMzMyMywiaWF0IjoxNzU3NzAzMzUzLCJqdGkiOiI2OGM0NmNiOTM2NGRjNTU5NTdiMzkyMTMifQ.8IpCb-3xVEyPU8IeEgB6Xm_nWyi37hxNOBAkWZc5c2Q'

  useEffect(() => {
    http.defaults.headers.common.Authorization = `Bearer ${ADMIN_TOKEN}`
  }, [])
  console.log('token:', ADMIN_TOKEN)
  //Sử dụng khi login
  // useEffect(() => {
  //   const token = localStorage.getItem('token')
  //   if (token) {
  //     http.defaults.headers.common.Authorization = `Bearer ${token}`
  //   }
  // }, [])

  // Server-side paging
  const [rows, setRows] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)

  // UI state
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'' | UserRow['role']>('')
  const [status, setStatus] = useState<'' | UserRow['status']>('')
  const [sort, setSort] = useState<{ key: keyof UserRow; dir: 'asc' | 'desc' } | null>(null)
  const [open, setOpen] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 5
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // gọi API mỗi khi filter/sort/page thay đổi
  useEffect(() => {
    let ignore = false
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await listUsers({
          page,
          limit: pageSize,
          q: query.trim() || undefined,
          role: role || undefined,
          status: status || undefined,
          sort_key: sort?.key,
          sort_dir: sort?.dir
        })
        if (ignore) return
        setRows(result.items)
        setTotal(result.total)
      } catch (err: unknown) {
        // catch (err: any) {
        //   if (ignore) return
        //   setError(err?.response?.data?.message || err.message || 'Failed to load users')
        // }
        if (ignore) return

        if (isAxiosError(err)) {
          // TS hiểu err là AxiosError<any>
          setError(err.response?.data?.message || err.message)
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Unknown error')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      ignore = true
    }
  }, [page, pageSize, query, role, status, sort])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  function toggleSort(key: keyof UserRow) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
    setPage(1)
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString()
  }

  const badgeByRole = (r: UserRow['role']) => {
    switch (r) {
      case 'Admin':
        return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
      case 'Manager':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      default:
        return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
    }
  }

  const Header = (key: keyof UserRow, label: string) => {
    const active = sort?.key === key
    return (
      <th
        key={String(key)}
        className='select-none p-4 hover:cursor-pointer hover:text-slate-700'
        onClick={() => {
          toggleSort(key)
        }}
        title='Click to sort'
      >
        <div className='flex items-center gap-1'>
          <span>{label}</span>
          {active && <span>{sort!.dir === 'asc' ? '▲' : '▼'}</span>}
        </div>
      </th>
    )
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Users</h1>
        <div className='flex flex-wrap items-center gap-3 mt-4'>
          <input
            className='w-56 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Search name, email, role...'
            value={query}
            onChange={(e) => {
              setPage(1)
              setQuery(e.target.value)
            }}
          />
          <select
            className='rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
            value={role}
            onChange={(e) => {
              setPage(1)
              setRole(e.target.value as UserRow['role'] | '')
            }}
          >
            <option value=''>All roles</option>
            <option value='Admin'>Admin</option>
            <option value='Manager'>Manager</option>
            <option value='Staff'>Staff</option>
          </select>
          <select
            className='rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500'
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value as UserRow['status'] | '')
            }}
          >
            <option value=''>All status</option>
            <option value='active'>active</option>
            <option value='inactive'>inactive</option>
          </select>
          <button
            type='button'
            onClick={() => {
              // refetch nhanh
              setPage((p) => p)
            }}
            className='flex items-center justify-center px-4 border-l-2 cursor-pointer'
          >
            <TfiReload className='mr-2' />
            Data Refresh
          </button>
          <button
            onClick={() => setOpen(true)}
            className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
          >
            + Create user
          </button>

          <CreateAccount open={open} onClose={() => setOpen(false)} />
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100'>
        <table className='min-w-full divide-y divide-slate-100'>
          <thead className='text-left text-xs uppercase bg-blue-50 text-blue-600'>
            <tr>
              {Header('username', 'Username')}
              {Header('full_name', 'Full Name')}
              {Header('email', 'Email')}
              {Header('phone', 'Phone')}
              {Header('role', 'Role')}
              {Header('status', 'Status')}
              {Header('created_at', 'Created')}
              <th className='p-4'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 text-sm'>
            {loading && (
              <tr>
                <td className='p-6 text-center text-slate-500' colSpan={8}>
                  Loading…
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td className='p-6 text-center text-rose-600' colSpan={8}>
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((u) => (
                <tr key={u.id} className='hover:bg-slate-50'>
                  <td className='p-4 font-medium text-slate-700'>{u.username}</td>
                  <td className='p-4'>{u.full_name}</td>
                  <td className='p-4 text-slate-600'>{u.email || '—'}</td>
                  <td className='p-4 text-slate-600'>{u.phone || '—'}</td>
                  <td className='p-4'>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeByRole(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className='p-4 text-slate-600'>{formatDate(u.created_at)}</td>
                  <td className='p-4'>
                    <ActionUser />
                  </td>
                </tr>
              ))}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td className='p-6 text-center text-sm text-slate-500' colSpan={8}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='mt-4 flex items-center justify-between text-sm text-slate-600'>
        <div>
          Showing page: {page} / {pageCount} — Total: {total}
        </div>
        <div className='space-x-2 flex items-center'>
          <button
            className='px-3 py-1 rounded-full'
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            title='Prev'
          >
            <BsArrowLeftCircle className='text-2xl' />
          </button>

          {(() => {
            const pageButtons: React.ReactNode[] = []
            const startPage = Math.max(1, page - 2)
            const endPage = Math.min(pageCount, page + 2)

            if (startPage > 1) {
              pageButtons.push(
                <button
                  key={1}
                  className={`px-3 py-1 rounded-full ${page === 1 ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setPage(1)}
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
                  className={`px-3 py-1 rounded-full ${page === i ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i}
                </button>
              )
            }

            if (endPage < pageCount) {
              if (endPage < pageCount - 1) {
                pageButtons.push(<span key='end-ellipsis'>...</span>)
              }
              pageButtons.push(
                <button
                  key={pageCount}
                  className={`px-3 py-1 rounded-full ${page === pageCount ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setPage(pageCount)}
                >
                  {pageCount}
                </button>
              )
            }

            return pageButtons
          })()}

          <button
            className='px-3 py-1 rounded-full'
            onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
            disabled={page === pageCount}
            title='Next'
          >
            <BsArrowRightCircle className='text-2xl' />
          </button>
        </div>
      </div>
    </div>
  )
}
