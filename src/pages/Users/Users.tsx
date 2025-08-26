import React, { useState, useEffect } from 'react'
import { FaSearch, FaDownload } from 'react-icons/fa'
import { TfiReload } from 'react-icons/tfi'
import { BsArrowRightCircle, BsArrowLeftCircle } from 'react-icons/bs'
import { useAuth } from '../../contexts/AuthContext'
import CreateUser from '../../components/CreateUser'

interface User {
  id: string
  username: string
  full_name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  status: 'active' | 'inactive'
  created_at: string
}

export default function Users() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, hasPermission } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Mock data - replace with API call
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        full_name: 'Administrator',
        email: 'admin@example.com',
        phone: '+1234567890',
        role: 'ADMIN',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'manager1',
        full_name: 'John Manager',
        email: 'manager@example.com',
        phone: '+1234567891',
        role: 'MANAGER',
        status: 'active',
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        username: 'staff1',
        full_name: 'Jane Staff',
        email: 'staff@example.com',
        phone: '+1234567892',
        role: 'STAFF',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z'
      }
    ]
    
    setUsers(mockUsers)
    setFiltered(mockUsers)
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return setFiltered(users)

    setFiltered(users.filter((u) => 
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    ))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setFiltered(users)
    setCurrentPage(1)
  }

  const handleUserCreated = () => {
    // TODO: Refresh user list
    console.log('User created, refresh list')
  }

  const itemsPerPage = 10
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  return (
    <div>
      {/* Title */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Users Management</h1>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>{time.toLocaleString('en-US')}</div>
          <button
            type='button'
            onClick={() => {
              // TODO: gọi API refresh
            }}
            className='flex items-center justify-center px-4 border-l-2 cursor-pointer'
          >
            <TfiReload className='mr-2' />
            Data Refresh
          </button>
        </div>
      </div>

      {/* Actions and Search */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-3'>
          {/* Only show Create User for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && (
            <CreateUser onSaved={handleUserCreated} />
          )}
          <button className='flex justify-center items-center border-blue-400 border px-4 py-2 rounded gap-2 text-blue-600 font-semibold'>
            Export CSV <FaDownload />
          </button>
        </div>
        <form onSubmit={handleSearch}>
          <div className='flex flex-1 justify-end ml-10'>
            <div className='flex items-center border-2 rounded px-3 py-2 w-[300px]'>
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search users...'
                className='flex-1 outline-none'
              />
              <FaSearch className='text-gray-500' />
            </div>
          </div>
        </form>
      </div>

      {/* Filter chips */}
      <div className='flex gap-5 flex-wrap my-6'>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Filter by Role</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Staff</option>
        </select>
        <select className='border rounded px-3 py-2 text-sm'>
          <option>Filter by Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className='px-4 py-2 bg-indigo-600 text-white rounded' onClick={() => handleSearch()}>
          Apply
        </button>
        <button type='button' onClick={clearFilters} className='px-4 py-2 border rounded'>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className='overflow-x-auto bg-white border rounded'>
        <table className='min-w-full table-auto text-sm'>
          <thead>
            <tr className='bg-blue-50 text-left text-xs text-blue-600'>
              <th className='px-6 py-3'>USER</th>
              <th className='px-6 py-3'>EMAIL</th>
              <th className='px-6 py-3'>PHONE</th>
              <th className='px-6 py-3'>ROLE</th>
              <th className='px-6 py-3'>STATUS</th>
              <th className='px-6 py-3'>CREATED</th>
              <th className='px-6 py-3'>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u.id} className='border-t hover:bg-gray-50 align-top'>
                <td className='px-6 py-4'>
                  <div className='font-medium text-gray-800'>{u.full_name}</div>
                  <div className='text-xs text-gray-400'>@{u.username}</div>
                </td>
                <td className='px-6 py-4 text-gray-600'>{u.email}</td>
                <td className='px-6 py-4 text-gray-600'>{u.phone}</td>
                <td className='px-6 py-4'>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-gray-500'>{formatDate(u.created_at)}</td>
                <td className='px-6 py-4'>
                  <div className='flex gap-2'>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>Edit</button>
                    <button className='text-red-600 hover:text-red-800 text-sm'>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
        <div>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} users
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
            const pageButtons: React.ReactNode[] = []
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



