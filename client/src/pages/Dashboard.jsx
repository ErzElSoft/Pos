import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { format, startOfDay, endOfDay } from 'date-fns'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { useAuth } from '../contexts/AuthContext'
import { ordersAPI, productsAPI, usersAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Redirect cashiers to POS interface for order taking
  useEffect(() => {
    if (user && user.role === 'cashier') {
      navigate('/pos')
    }
  }, [user, navigate])

  // Fetch daily sales data
  const { data: dailySales, isLoading: salesLoading } = useQuery(
    ['dailySales', selectedDate],
    () => ordersAPI.getDailySales({ date: selectedDate }),
    {
      select: (response) => response.data.data,
    }
  )

  // Fetch order statistics
  const { data: orderStats, isLoading: statsLoading } = useQuery(
    ['orderStats'],
    () => ordersAPI.getOrderStats({
      startDate: startOfDay(new Date()).toISOString(),
      endDate: endOfDay(new Date()).toISOString(),
    }),
    {
      select: (response) => response.data.data,
    }
  )

  // Fetch product statistics (admin only)
  const { data: productStats, isLoading: productStatsLoading } = useQuery(
    ['productStats'],
    () => productsAPI.getProductStats(),
    {
      enabled: isAdmin(),
      select: (response) => response.data.data,
    }
  )

  // Fetch user statistics (admin only)
  const { data: userStats, isLoading: userStatsLoading } = useQuery(
    ['userStats'],
    () => usersAPI.getUserStats(),
    {
      enabled: isAdmin(),
      select: (response) => response.data.data,
    }
  )

  // Fetch low stock products
  const { data: lowStockProducts } = useQuery(
    ['lowStockProducts'],
    () => productsAPI.getLowStockProducts(),
    {
      enabled: isAdmin(),
      select: (response) => response.data.data.products,
    }
  )

  const isLoading = salesLoading || statsLoading || (isAdmin() && (productStatsLoading || userStatsLoading))

  // Sample data for charts (in real app, this would come from API)
  const weeklyData = [
    { day: 'Mon', sales: 1200, orders: 15 },
    { day: 'Tue', sales: 1800, orders: 23 },
    { day: 'Wed', sales: 1500, orders: 18 },
    { day: 'Thu', sales: 2200, orders: 28 },
    { day: 'Fri', sales: 2800, orders: 35 },
    { day: 'Sat', sales: 3200, orders: 42 },
    { day: 'Sun', sales: 2100, orders: 26 },
  ]

  const topProducts = orderStats?.topProducts || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your POS system overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <Link
            to="/pos"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            New Sale
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Today's Sales"
              value={`$${dailySales?.totalSales?.toFixed(2) || '0.00'}`}
              icon={CurrencyDollarIcon}
              color="blue"
              subtitle={`${dailySales?.totalOrders || 0} orders`}
            />
            
            <StatCard
              title="Avg Order Value"
              value={`$${dailySales?.averageOrderValue?.toFixed(2) || '0.00'}`}
              icon={ChartBarIcon}
              color="green"
              subtitle={`${dailySales?.totalItems || 0} items sold`}
            />
            
            {isAdmin() && (
              <>
                <StatCard
                  title="Total Products"
                  value={productStats?.totalProducts || 0}
                  icon={CubeIcon}
                  color="purple"
                  subtitle={`${productStats?.activeProducts || 0} active`}
                />
                
                <StatCard
                  title="Total Users"
                  value={userStats?.totalUsers || 0}
                  icon={UsersIcon}
                  color="orange"
                  subtitle={`${userStats?.activeUsers || 0} active`}
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'sales' ? `$${value}` : value, name === 'sales' ? 'Sales' : 'Orders']} />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Quantity Sold']} />
                    <Bar dataKey="totalQuantitySold" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <span className="text-sm font-semibold">${dailySales?.totalSales?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium">Orders Processed</span>
                  </div>
                  <span className="text-sm font-semibold">{dailySales?.totalOrders || 0}</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <CubeIcon className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium">Items Sold</span>
                  </div>
                  <span className="text-sm font-semibold">{dailySales?.totalItems || 0}</span>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            {isAdmin() && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts</h3>
                <div className="space-y-3">
                  {lowStockProducts && lowStockProducts.length > 0 ? (
                    <>
                      <div className="flex items-center p-3 bg-orange-50 rounded-md">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            Low Stock Alert
                          </p>
                          <p className="text-xs text-orange-700">
                            {lowStockProducts.length} products running low
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Link
                          to="/products?filter=lowStock"
                          className="text-sm text-primary-600 hover:text-primary-500"
                        >
                          View low stock products →
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No alerts at this time
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard