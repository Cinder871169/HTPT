import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * ProtectedRoute — Kiểm tra auth + role trước khi render
 * roles: string[] — danh sách role được phép (rỗng = chỉ cần login)
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { token, role, setAuthModalOpen } = useApp()

  if (!token) {
    // Trigger modal thay vì redirect cứng
    setTimeout(() => setAuthModalOpen(true), 0)
    return <Navigate to="/" replace />
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
