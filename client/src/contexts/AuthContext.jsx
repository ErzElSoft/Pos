import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI, handleAPIError } from '../utils/api'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Auth actions
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case authActions.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...')
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      console.log('📝 Token exists:', !!token)
      console.log('📝 User data exists:', !!userData)

      if (token && userData) {
        try {
          // Parse user data from localStorage
          const user = JSON.parse(userData)
          console.log('👤 Parsed user:', user)
          
          // Try to verify token with server
          console.log('🔍 Verifying token with server...')
          const response = await authAPI.verifyToken()
          const verifiedUser = response.data.data.user
          console.log('✅ Token verified, user:', verifiedUser)

          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: verifiedUser, token },
          })
        } catch (error) {
          console.error('❌ Token verification failed, using local storage:', error)
          
          // If verification fails, still try to use local storage data
          try {
            const user = JSON.parse(userData)
            
            // Basic validation of user data
            if (user && user.email && user.role) {
              console.log('✅ Using local storage user data:', user)
              dispatch({
                type: authActions.LOGIN_SUCCESS,
                payload: { user, token },
              })
            } else {
              throw new Error('Invalid user data')
            }
          } catch (parseError) {
            console.error('❌ Failed to parse user data:', parseError)
            // Clear invalid data
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            dispatch({ type: authActions.LOGOUT })
          }
        }
      } else {
        console.log('📝 No token or user data found, setting loading to false')
        dispatch({ type: authActions.SET_LOADING, payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      console.log('🔑 Starting login process...')
      dispatch({ type: authActions.SET_LOADING, payload: true })
      
      const response = await authAPI.login(credentials)
      console.log('📝 Login response:', response.data)
      const { user, token } = response.data.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      console.log('💾 Stored token and user in localStorage')

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user, token },
      })
      console.log('✅ Login successful, auth state updated')

      toast.success(`Welcome back, ${user.name}!`)
      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      const message = handleAPIError(error)
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: message,
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function (Admin only)
  const register = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true })
      
      const response = await authAPI.register(userData)
      toast.success('User registered successfully')
      return { success: true, data: response.data.data }
    } catch (error) {
      const message = handleAPIError(error)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: authActions.SET_LOADING, payload: false })
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      dispatch({ type: authActions.LOGOUT })
      toast.success('Logged out successfully')
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      const updatedUser = response.data.data.user

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      dispatch({
        type: authActions.UPDATE_USER,
        payload: updatedUser,
      })

      toast.success('Profile updated successfully')
      return { success: true, data: updatedUser }
    } catch (error) {
      const message = handleAPIError(error)
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = handleAPIError(error)
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR })
  }

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!state.user) return false
    if (requiredRole === 'admin') return state.user.role === 'admin'
    return true // All authenticated users can access non-admin routes
  }

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin'
  }

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    // Utilities
    hasRole,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext