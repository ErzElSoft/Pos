import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    
    // Handle specific error status codes
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
}

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.post(`/users/${id}/toggle-status`),
  getUserStats: () => api.get('/users/stats'),
}

export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  toggleProductStatus: (id) => api.post(`/products/${id}/toggle-status`),
  updateStock: (id, data) => api.post(`/products/${id}/update-stock`, data),
  getProductStats: () => api.get('/products/stats'),
  getCategories: () => api.get('/products/categories'),
  getLowStockProducts: () => api.get('/products/low-stock'),
  searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
}

export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  getOrderReceipt: (id) => api.get(`/orders/${id}/receipt`),
  refundOrder: (id, data) => api.post(`/orders/${id}/refund`, data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getOrderStats: (params) => api.get('/orders/stats', { params }),
  getDailySales: (params) => api.get('/orders/daily-sales', { params }),
}

// Utility function to handle API errors
export const handleAPIError = (error) => {
  const message = error.response?.data?.message || error.message || 'Something went wrong'
  console.error('API Error:', error)
  return message
}

// Utility function to format API response
export const formatAPIResponse = (response) => {
  return {
    data: response.data.data,
    message: response.data.message,
    success: response.data.success,
  }
}

export default api