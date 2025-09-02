import React from 'react'
import { XMarkIcon, ExclamationTriangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import { format } from 'date-fns'

const UserModal = ({
  type,
  user,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
}) => {
  const modalTitles = {
    create: 'Add New User',
    edit: 'Edit User',
    view: 'User Details',
    delete: 'Delete User',
  }

  const isReadOnly = type === 'view'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {modalTitles[type]}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {type === 'delete' ? (
              <DeleteConfirmation
                user={user}
                onConfirm={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
              />
            ) : type === 'view' ? (
              <UserDetails user={user} />
            ) : (
              <UserForm
                type={type}
                user={user}
                onSubmit={onSubmit}
                register={register}
                errors={errors}
                isLoading={isLoading}
                onCancel={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const UserForm = ({
  type,
  onSubmit,
  register,
  errors,
  isLoading,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters',
              },
            })}
            type="text"
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.name ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            disabled={type === 'edit'} // Don't allow email changes in edit mode
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.email ? 'border-red-300' : 'border-gray-300'}
              ${type === 'edit' ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
          {type === 'edit' && (
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed after user creation
            </p>
          )}
        </div>

        {/* Password (only for create) */}
        {type === 'create' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                },
              })}
              type="password"
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                ${errors.password ? 'border-red-300' : 'border-gray-300'}
              `}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        )}

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            {...register('role', {
              required: 'Role is required',
            })}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.role ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="flex items-center mt-2">
            <input
              {...register('isActive')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Active (user can log in and access the system)
            </label>
          </div>\n        </div>
      </div>

      {type === 'create' && (
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• At least 6 characters long</li>
            <li>• Must contain at least one uppercase letter</li>
            <li>• Must contain at least one lowercase letter</li>
            <li>• Must contain at least one number</li>
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
            }
          `}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              {type === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            type === 'create' ? 'Create User' : 'Update User'
          )}
        </button>
      </div>
    </form>
  )
}

const UserDetails = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* User Avatar and Basic Info */}
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-xl font-medium text-primary-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center mt-1">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span
              className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.isActive ? 'Active' : 'Inactive'}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Activity Information</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.lastLogin
                  ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm:ss')
                  : 'Never logged in'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm:ss')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm:ss')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Additional Information */}
      {user.createdBy && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
          <p className="text-sm text-gray-600">
            This user was created by an administrator and has been granted {user.role} access to the system.
          </p>
        </div>
      )}
    </div>
  )
}

const DeleteConfirmation = ({ user, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the user account.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{user?.name}</h4>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Warning</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>All user data will be permanently deleted</li>
                <li>The user will no longer be able to access the system</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`
            px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
            }
          `}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Deleting...
            </>
          ) : (
            'Delete User'
          )}
        </button>
      </div>
    </div>
  )
}

export default UserModal