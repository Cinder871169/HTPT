import axios from 'axios'

// ============================================================
// Axios Instance — API Service
// Ref: implementation_plan.md § 1 (Base URL + JWT Interceptor)
// Base URL: http://localhost:3000/api (via Vite proxy)
// ============================================================

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Request Interceptor: Attach JWT Bearer Token ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response Interceptor: Handle Global Errors ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // HTTP 401: Clear stale token and redirect to login
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }

    return Promise.reject(error)
  }
)

// ============================================================
// Auth Endpoints
// ============================================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ============================================================
// User Endpoints
// ============================================================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  // Admin only
  getAllUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// ============================================================
// Restaurant Endpoints
// ============================================================
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
  addMenuItem: (id, data) => api.post(`/restaurants/${id}/menu`, data),
  updateMenuItem: (id, data) => api.put(`/menu-items/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu-items/${id}`),
}

// ============================================================
// Order Endpoints
// ============================================================
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  // Owner / Admin
  getRestaurantOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// ============================================================
// Notification Endpoints
// ============================================================
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export default api
