import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm()

  const onProfileSubmit = async (data) => {
    setIsUpdating(true)
    try {
      await updateProfile(data)
    } finally {
      setIsUpdating(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setIsUpdating(true)
    try {
      const result = await changePassword(data)
      if (result.success) {
        resetPassword()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserCircleIcon },
    { id: 'password', name: 'Change Password', icon: KeyIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
            
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    {...registerProfile('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`
                      mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                      ${profileErrors.name ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="Enter your full name"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    {...registerProfile('email')}
                    type="email"
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    placeholder="Email cannot be changed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed. Contact administrator if needed.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`
                    px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                    ${isUpdating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                    }
                  `}
                >
                  {isUpdating ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
            
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  type="password"
                  className={`
                    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Enter your current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className={`
                    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Enter your new password"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value, formValues) => {
                      return value === formValues.newPassword || 'Passwords do not match'
                    },
                  })}
                  type="password"
                  className={`
                    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Confirm your new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Must contain at least one uppercase letter</li>
                  <li>• Must contain at least one lowercase letter</li>
                  <li>• Must contain at least one number</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`
                    px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                    ${isUpdating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                    }
                  `}
                >
                  {isUpdating ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile