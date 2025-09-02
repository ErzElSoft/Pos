import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const Layout = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'POS', href: '/pos', icon: ShoppingCartIcon },
    { name: 'Orders', href: '/orders', icon: DocumentTextIcon },
    ...(isAdmin() ? [
      { name: 'Products', href: '/products', icon: CubeIcon },
      { name: 'Users', href: '/users', icon: UsersIcon },
    ] : []),
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} location={location} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} location={location} user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />
              
              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-medium leading-6 text-gray-900 truncate">
                    Welcome back, {user?.name}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                >
                  <UserCircleIcon className="h-8 w-8" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, location, user, onLogout }) => {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-primary-600">POS System</h1>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                        ${isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          h-6 w-6 shrink-0
                          ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                        `}
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
              <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span aria-hidden="true">{user?.name}</span>
            </div>
            
            <Link
              to="/profile"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              <UserCircleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
              Profile
            </Link>
            
            <button
              onClick={onLogout}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Layout