import http from '../utils/axios.http'

export type UserRow = {
  id: number
  username: string
  full_name: string
  email?: string | null
  phone?: string | null
  role: 'Admin' | 'Manager' | 'Staff'
  status: 'active' | 'inactive'
  created_at?: string
}

export type ListUsersParams = {
  page?: number
  limit?: number
  q?: string
  role?: 'Admin' | 'Manager' | 'Staff'
  status?: 'active' | 'inactive'
  sort_key?: keyof UserRow
  sort_dir?: 'asc' | 'desc'
}

export type ListUsersResult = { items: UserRow[]; total: number }

// Kiểu dữ liệu raw từ BE
export type UserRaw = {
  id?: string | number
  username?: string
  full_name?: string
  email?: string | null
  phone?: string | null
  role?: string
  status?: string
  created_at?: string
}

function mapRole(r?: string): UserRow['role'] {
  switch ((r || '').toUpperCase()) {
    case 'ADMIN':
      return 'Admin'
    case 'MANAGER':
      return 'Manager'
    default:
      return 'Staff'
  }
}

function toUserRow(u: UserRaw): UserRow {
  return {
    id: Number(u.id),
    username: String(u.username ?? ''),
    full_name: String(u.full_name ?? u.username ?? ''),
    email: u.email ?? null,
    phone: u.phone ?? null,
    role: mapRole(u.role),
    status: u.status === 'inactive' ? 'inactive' : 'active',
    created_at: u.created_at
  }
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const res = await http.get('/v1/users', { params })

  const root = res.data?.result ?? res.data ?? {}
  const usersRaw: UserRaw[] =
    (Array.isArray(root.users) && root.users) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root.data) && root.data) ||
    []

  const items = usersRaw.map(toUserRow)
  const total = Number(root.total ?? root.count ?? root.pagination?.total ?? items.length)

  return { items, total }
}
