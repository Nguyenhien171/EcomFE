# Authentication & Role-Based Access Control System

## Tổng quan

Hệ thống đã được implement với đầy đủ các tính năng authentication và role-based access control theo yêu cầu:

### 🔐 Authentication Flow
- **Chưa login**: Chỉ được truy cập trang public (login/register)
- **Đã login**: Được truy cập vào hệ thống với quyền tương ứng

### 👥 Role Hierarchy
- **ADMIN** (Level 3): Quyền cao nhất
- **MANAGER** (Level 2): Quyền trung bình  
- **STAFF** (Level 1): Quyền thấp nhất

## 🛡️ Protected Routes

### Routes yêu cầu authentication:
- `/dashboard` - Chỉ ADMIN/MANAGER
- `/products` - Tất cả roles
- `/orders` - Tất cả roles
- `/statistics` - Chỉ ADMIN/MANAGER
- `/reviews` - Tất cả roles
- `/customers` - Tất cả roles
- `/transactions` - Tất cả roles
- `/users` - Chỉ ADMIN/MANAGER
- `/settings` - Chỉ ADMIN
- `/profile` - Tất cả roles

### Public Routes:
- `/login` - Chỉ cho user chưa đăng nhập
- `/register` - Chỉ cho user chưa đăng nhập

## 🎯 Role-Based Features

### ADMIN (Quyền cao nhất)
- ✅ Truy cập tất cả trang
- ✅ Tạo MANAGER và STAFF
- ✅ Quản lý Settings
- ✅ Xem Dashboard và Statistics

### MANAGER (Quyền trung bình)
- ✅ Truy cập Dashboard và Statistics
- ✅ Tạo STAFF (không tạo được MANAGER)
- ✅ Quản lý Products (thêm/sửa/xóa)
- ✅ Quản lý Users
- ❌ Không truy cập Settings

### STAFF (Quyền thấp nhất)
- ✅ Xem Products (không thêm/sửa/xóa)
- ✅ Xem Orders, Reviews, Customers, Transactions
- ✅ Truy cập Profile
- ❌ Không truy cập Dashboard
- ❌ Không truy cập Statistics
- ❌ Không tạo Users
- ❌ Không truy cập Settings

## 🏗️ Architecture

### Context API (`AuthContext`)
```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken, refreshToken, userData) => void
  logout: () => void
  hasPermission: (requiredRole: UserRole) => boolean
  canCreateUser: (targetRole: UserRole) => boolean
}
```

### Components
- `ProtectedRoute`: Bảo vệ routes cần authentication
- `PublicRoute`: Redirect authenticated users khỏi public pages
- `CreateUser`: Form tạo user với role-based dropdown

### Axios Interceptor
- Tự động thêm Authorization header
- Tự động refresh token khi hết hạn
- Tự động logout khi refresh token thất bại

## 🚀 Cách sử dụng

### 1. Login
```typescript
const { login } = useAuth()

// Call API login
const response = await http.post('/auth/login', { email, password })
const { accessToken, refreshToken, user_profile } = response.data.result

// Store in context
login(accessToken, refreshToken, user_profile)
```

### 2. Check Permissions
```typescript
const { hasPermission, canCreateUser } = useAuth()

// Check if user can access a page
if (hasPermission('MANAGER')) {
  // Show dashboard
}

// Check if user can create specific role
if (canCreateUser('STAFF')) {
  // Show create staff form
}
```

### 3. Protected Components
```typescript
// Route protection
<ProtectedRoute requiredRole="MANAGER">
  <Dashboard />
</ProtectedRoute>

// Component protection
{hasPermission('MANAGER') && (
  <AddNewProduct />
)}
```

## 📁 File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx          # Main auth context
│   └── index.ts                 # Context exports
├── components/
│   ├── ProtectedRoute/          # Route protection
│   ├── PublicRoute/             # Public route handling
│   ├── CreateUser/              # User creation form
│   ├── Headers/                 # Updated with user menu
│   └── SideBar/                 # Updated with role-based menu
├── pages/
│   ├── Users/                   # User management page
│   ├── login/                   # Updated login page
│   └── ...
└── utils/
    └── axios.http.ts            # Updated with auth interceptor
```

## 🔧 Configuration

### Environment Variables
```env
VITE_SERVER_URL=http://localhost:3000/api
```

### Local Storage Keys
- `accessToken`: JWT access token
- `refreshToken`: JWT refresh token  
- `user_data`: User profile data
- `savedEmail`: Email for "Stay signed in"

## 🧪 Testing

### Test Users (Mock Data)
```typescript
// ADMIN
{
  username: 'admin',
  role: 'ADMIN',
  email: 'admin@example.com'
}

// MANAGER  
{
  username: 'manager1',
  role: 'MANAGER', 
  email: 'manager@example.com'
}

// STAFF
{
  username: 'staff1',
  role: 'STAFF',
  email: 'staff@example.com'
}
```

## 🔄 Auto Logout

Hệ thống tự động logout khi:
- Access token hết hạn và refresh token thất bại
- User click logout button
- Browser refresh (nếu không có valid tokens)

## 📝 Notes

- Tất cả API calls đều được bảo vệ bởi axios interceptor
- Role hierarchy được implement theo level (STAFF < MANAGER < ADMIN)
- UI/UX được optimize cho từng role
- Error handling đầy đủ cho authentication flow
- Loading states cho tất cả async operations




