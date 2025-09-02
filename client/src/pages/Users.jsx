import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { usersAPI, authAPI, handleAPIError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Users = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create') // create, edit, view, delete
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: 'true',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery(
    ['users', currentPage, filters],
    () =>
      usersAPI.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      }),
    {
      select: (response) => response.data.data,
      keepPreviousData: true,
    }
  )

  // Fetch user statistics
  const { data: userStats } = useQuery(
    ['userStats'],
    () => usersAPI.getUserStats(),
    {
      select: (response) => response.data.data,
    }
  )

  // Create user mutation
  const createUserMutation = useMutation(
    (userData) => authAPI.register(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users'])
        queryClient.invalidateQueries(['userStats'])
        toast.success('User created successfully')
        setShowModal(false)
        reset()
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ id, data }) => usersAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users'])
        toast.success('User updated successfully')
        setShowModal(false)
        setSelectedUser(null)
        reset()
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (id) => usersAPI.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users'])
        queryClient.invalidateQueries(['userStats'])
        toast.success('User deleted successfully')
        setShowModal(false)
        setSelectedUser(null)
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation(
    (id) => usersAPI.toggleUserStatus(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users'])
        queryClient.invalidateQueries(['userStats'])
        toast.success('User status updated successfully')
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm()

  const onSubmit = (data) => {
    if (modalType === 'create') {
      createUserMutation.mutate(data)
    } else if (modalType === 'edit') {
      const updateData = { ...data }
      delete updateData.password // Don't send password in update
      updateUserMutation.mutate({ id: selectedUser._id, data: updateData })
    }
  }

  const openModal = (type, user = null) => {
    setModalType(type)
    setSelectedUser(user)
    setShowModal(true)

    if (type === 'edit' && user) {
      // Populate form with user data
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('role', user.role)
      setValue('isActive', user.isActive)
    } else {
      reset()
      setValue('isActive', true)
    }
  }

  const handleDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id)
    }
  }

  const handleToggleStatus = (user) => {
    toggleUserStatusMutation.mutate(user._id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their access levels</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-md">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-md">
                <UserCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-md">
                <UserCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.adminUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-md">
                <UserCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cashiers</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.cashierUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData?.users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {user._id === currentUser._id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={user._id === currentUser._id}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer disabled:cursor-not-allowed ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy')
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', user)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user._id !== currentUser._id && (
                        <button
                          onClick={() => openModal('delete', user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {usersData?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, usersData.pagination.totalUsers)}
            {' '}of {usersData.pagination.totalUsers} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!usersData.pagination.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-primary-50 text-primary-600 border border-primary-200 rounded-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!usersData.pagination.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          type={modalType}
          user={selectedUser}
          onClose={() => {
            setShowModal(false)
            setSelectedUser(null)
            reset()
          }}
          onSubmit={modalType === 'delete' ? handleDelete : handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          isLoading={
            createUserMutation.isLoading ||
            updateUserMutation.isLoading ||
            deleteUserMutation.isLoading
          }
        />
      )}
    </div>
  )
}

export default Users