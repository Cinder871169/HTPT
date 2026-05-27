import { useApp } from '../../context/AppContext'
import OwnerDashboard from './OwnerDashboard'
import AdminDashboard from './AdminDashboard'
import { Navigate } from 'react-router-dom'

export default function DashboardPage({ onToast }) {
  const { role } = useApp()
  if (role === 'restaurant_owner') return <OwnerDashboard onToast={onToast} />
  if (role === 'admin') return <AdminDashboard onToast={onToast} />
  return <Navigate to="/" replace />
}
