import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './context/AppContext'
import { useToast } from './hooks/useToast'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerPage from './pages/CustomerPage'
import OrdersPage from './pages/OrdersPage'
import DashboardPage from './pages/dashboard/DashboardPage'

export default function App() {
  const { logout, setAuthModalOpen } = useApp()
  const { toasts, removeToast, success, error, warning, showToast } = useToast()

  // Listen for 401 auto-logout event dispatched by api.js interceptor
  useEffect(() => {
    const handle = () => {
      logout()
      setAuthModalOpen(true)
      error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
    }
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [logout, setAuthModalOpen, error])

  return (
    <>
      <Header onToast={showToast} />

      <Routes>
        <Route path="/" element={<CustomerPage onToast={showToast} />} />

        <Route path="/orders" element={
          <ProtectedRoute roles={['customer']}>
            <OrdersPage onToast={showToast} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['restaurant_owner', 'admin']}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
              <DashboardPage onToast={showToast} />
            </div>
          </ProtectedRoute>
        } />

        <Route path="*" element={<CustomerPage onToast={showToast} />} />
      </Routes>

      <AuthModal onToast={showToast} />
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}
