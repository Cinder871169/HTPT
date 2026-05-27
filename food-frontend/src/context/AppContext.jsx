import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { userAPI, notificationAPI } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [cart, setCart] = useState([])
  const [notifications, setNotifications] = useState([])
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // --- Restore Session ---
  useEffect(() => {
    if (token) {
      const loadProfile = async () => {
        try {
          const res = await userAPI.getProfile()
          setUser(res.data)
          setRole(res.data.role)
        } catch (err) {
          console.error("Error restoring user session:", err)
        }
      }
      loadProfile()
    } else {
      setUser(null)
      setRole(null)
    }
  }, [token])

  // --- Auth ---
  const login = useCallback((userData, jwtToken) => {
    setUser(userData)
    setRole(userData.role)
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null); setRole(null); setToken(null)
    setCart([]); setNotifications([])
    localStorage.removeItem('token')
  }, [])

  // --- Cart ---
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId)
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }, [])

  const setItemQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.menuItemId !== menuItemId))
    } else {
      setCart(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i))
    }
  }, [])

  const removeFromCart = useCallback((menuItemId) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // --- Notifications ---
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll()
      setNotifications(res.data || [])
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setNotifications([])
    }
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error("Error marking notification read:", err)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const value = {
    user, role, token,
    login, logout,
    authModalOpen, setAuthModalOpen,
    cart, addToCart, setItemQuantity, removeFromCart, clearCart,
    cartTotal, cartCount,
    notifications, fetchNotifications, markNotificationRead, unreadCount,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export default AppContext
