import http from '../utils/axios.http'

// Kiểu dữ liệu profile
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'

export type UserProfile = {
  id: string | number
  email: string
  username: string
  full_name: string
  role: UserRole
  status: 'active' | 'inactive'
  first_name?: string
  last_name?: string
  dob?: string // 'YYYY-MM-DD'
  phone?: string
  country?: string
  city?: string
  postal?: string
  location?: string
  avatar?: string
}

// ==== API CALLS ====

// Lấy thông tin cá nhân
export async function getProfile(): Promise<UserProfile> {
  const { data } = await http.get('/v1/users/me')
  return data.result ?? data
}

// Cập nhật profile theo id số (Kong đang match /v1/users/:id)
export type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | 'first_name'
    | 'last_name'
    | 'full_name'
    | 'dob'
    | 'phone'
    | 'country'
    | 'city'
    | 'postal'
    | 'location'
    | 'avatar'
    | 'role'
  >
>

export async function updateProfile(userId: string | number, payload: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await http.put(`/v1/users/${userId}`, payload)
  return data.result ?? data
}

// Nếu bạn có API riêng update avatar
export async function updateAvatar(userId: string | number, avatarUrl: string): Promise<UserProfile> {
  const { data } = await http.put(`/v1/users/${userId}`, { avatar: avatarUrl })
  return data.result ?? data
}
