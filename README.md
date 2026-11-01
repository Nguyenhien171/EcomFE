# E-commerce Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SERVER_URL=http://localhost:3000/api
```

## 🔐 Authentication System

### Test Users
The application includes mock authentication for testing:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@example.com | password123 | ADMIN | Full access |
| manager@example.com | password123 | MANAGER | Create STAFF, manage products |
| staff@example.com | password123 | STAFF | View only |

### Features
- **Role-based Access Control**: ADMIN > MANAGER > STAFF
- **Protected Routes**: Automatic redirect based on permissions
- **Token Management**: JWT with auto-refresh
- **Persistent Login**: Remember user session

## 🏗️ Architecture

### Components
- `AuthContext`: Global authentication state
- `ProtectedRoute`: Route protection with role checking
- `PublicRoute`: Redirect authenticated users
- `CreateUser`: Role-based user creation form

### Pages
- `/login` - Authentication (public)
- `/dashboard` - Admin/Manager only
- `/products` - All roles (create/edit for Manager+)
- `/users` - Admin/Manager only
- `/settings` - Admin only

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run prettier     # Check Prettier formatting
npm run prettier:fix # Fix Prettier formatting
```

### Tech Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Axios** for HTTP requests

## 📁 Project Structure
```
src/
├── contexts/          # Global state management
├── components/        # Reusable components
├── pages/            # Page components
├── schemas/          # Zod validation schemas
├── utils/            # Utilities and helpers
└── constants/        # App constants
```

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured
- ESLint integration

### Styling
- Tailwind CSS with PostCSS
- Custom color scheme
- Responsive design

## 🚨 Troubleshooting

### Common Issues
1. **Port already in use**: Change port in `vite.config.ts`
2. **TypeScript errors**: Run `npm run lint:fix`
3. **Styling issues**: Check Tailwind classes

### Mock Authentication
The app uses mock authentication for development. To integrate with real backend:
1. Update `VITE_SERVER_URL` in `.env`
2. Replace mock functions in `utils/mockAuth.ts`
3. Update axios interceptor in `utils/axios.http.ts`

## 📝 Notes
- All authentication is currently mocked
- Role hierarchy: STAFF < MANAGER < ADMIN
- Auto-logout on token expiry
- Persistent user data in localStorage
