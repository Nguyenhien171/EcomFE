import { NavLink } from 'react-router-dom'
import path from '../../constants/path'
import { RiAppsLine } from 'react-icons/ri'
import { IoIosApps } from 'react-icons/io'
import { LuShoppingBag } from 'react-icons/lu'
import { FaRegChartBar, FaRegStar, FaRegUser, FaUsers } from 'react-icons/fa'
import { GrGroup } from 'react-icons/gr'
import { VscArrowSwap } from 'react-icons/vsc'
import { IoSettingsOutline } from 'react-icons/io5'
import { useAuth } from '../../contexts/AuthContext'

export default function SideBar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, hasPermission } = useAuth()

  return (
    <aside className='min-w-[70px] max-w-[260px] bg-gray-100' aria-label='Sidebar'>
      <div className='h-full overflow-y-auto bg-gray-100 py-4 px-3 shadow-lg'>
        <ul className='space-y-2'>
          {/* Dashboard - Only for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && (
            <li>
              <NavLink
                to={path.dashboard}
                end
                style={({ isActive }) => ({
                  fontWeight: isActive ? 700 : undefined,
                  color: isActive ? '#2563eb' : undefined
                })}
                className={({ isActive }) => {
                  const activeClass = isActive ? 'bg-blue-200' : ''
                  return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
                }}
              >
                <RiAppsLine className='text-2xl' />
                <span className='ml-3'>Dashboard</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to={path.products}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <IoIosApps className='text-2xl' />
              <span className='ml-3'>Products</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={path.orders}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <LuShoppingBag className='text-2xl' />
              <span className='ml-3'>Orders</span>
            </NavLink>
          </li>
          {/* Statistics - Only for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && (
            <li>
              <NavLink
                to={path.statistics}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 500 : undefined,
                  color: isActive ? '#2563eb' : undefined
                })}
                className={({ isActive }) => {
                  const activeClass = isActive ? 'bg-blue-200' : ''
                  return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
                }}
              >
                <FaRegChartBar className='text-2xl' />
                <span className='ml-3'>Statistics</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to={path.reviews}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <FaRegStar className='text-2xl' />
              <span className='ml-3'>Reviews</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={path.customers}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <GrGroup className='text-2xl' />
              <span className='ml-3'>Customers</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={path.transactions}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <VscArrowSwap className='text-2xl' />
              <span className='ml-3'>Transactions</span>
            </NavLink>
          </li>
          
          {/* Users - Only for ADMIN and MANAGER */}
          {hasPermission('MANAGER') && (
            <li>
              <NavLink
                to={path.users}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 500 : undefined,
                  color: isActive ? '#2563eb' : undefined
                })}
                className={({ isActive }) => {
                  const activeClass = isActive ? 'bg-blue-200' : ''
                  return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
                }}
              >
                <FaUsers className='text-2xl' />
                <span className='ml-3'>Users</span>
              </NavLink>
            </li>
          )}
          {/* Settings - Only for ADMIN */}
          {hasPermission('ADMIN') && (
            <li>
              <NavLink
                to={path.settings}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 500 : undefined,
                  color: isActive ? '#2563eb' : undefined
                })}
                className={({ isActive }) => {
                  const activeClass = isActive ? 'bg-blue-200' : ''
                  return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
                }}
              >
                <IoSettingsOutline className='text-2xl' />
                <span className='ml-3'>Settings</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to={path.profile}
              style={({ isActive }) => ({
                fontWeight: isActive ? 500 : undefined,
                color: isActive ? '#2563eb' : undefined
              })}
              className={({ isActive }) => {
                const activeClass = isActive ? 'bg-blue-200' : ''
                return `flex items-center rounded-lg ${activeClass} p-2 text-base font-normal text-gray-900 hover:bg-blue-200`
              }}
            >
              <FaRegUser className='text-2xl' />
              <span className='ml-3'>Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  )
}
