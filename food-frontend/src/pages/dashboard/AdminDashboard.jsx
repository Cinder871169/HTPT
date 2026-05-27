import { useState, useEffect } from 'react'
import { Users, Store, Trash2, Power, PowerOff } from 'lucide-react'
import { userAPI, restaurantAPI } from '../../services/api'

const ROLE_BADGE = {
  customer:          { label: 'Khách hàng',   bg: '#dbeafe', color: '#1e40af' },
  restaurant_owner:  { label: 'Chủ nhà hàng', bg: '#d1fae5', color: '#065f46' },
  admin:             { label: 'Admin',         bg: '#ede9fe', color: '#6d28d9' },
}

export default function AdminDashboard({ onToast }) {
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [uRes, rRes] = await Promise.all([userAPI.getAllUsers(), restaurantAPI.getAll()])
        setUsers(uRes.data || []); setRestaurants(rRes.data || [])
      } catch (err) {
        console.error("Error loading admin data:", err)
        onToast && onToast('Không thể tải thông tin hệ thống.', 'error')
        setUsers([]); setRestaurants([])
      } finally { setLoading(false) }
    }
    load()
  }, [onToast])

  const deleteUser = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return
    try {
      await userAPI.deleteUser(id)
      setUsers(prev => prev.filter(u => u._id !== id))
      onToast('Đã xóa tài khoản.', 'success')
    } catch (err) {
      console.error("Error deleting user:", err)
      onToast('Xóa tài khoản thất bại.', 'error')
    }
  }

  const toggleRestaurant = async (r) => {
    try {
      await restaurantAPI.update(r._id, { isActive: !r.isActive })
      setRestaurants(prev => prev.map(x => x._id === r._id ? { ...x, isActive: !x.isActive } : x))
      onToast(`Nhà hàng "${r.name}" đã ${r.isActive ? 'bị tắt' : 'được bật'}.`, r.isActive ? 'warning' : 'success')
    } catch (err) {
      console.error("Error toggling restaurant status:", err)
      onToast('Cập nhật trạng thái nhà hàng thất bại.', 'error')
    }
  }

  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter)

  const STATS = [
    { label: 'Tổng người dùng', value: users.length, icon: <Users size={24} color="var(--primary)" /> },
    { label: 'Nhà hàng hoạt động', value: restaurants.filter(r => r.isActive).length, icon: <Store size={24} color="var(--accent)" /> },
    { label: 'Chủ cửa hàng', value: users.filter(u => u.role === 'restaurant_owner').length, icon: <Users size={24} color="#8b5cf6" /> },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800 }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Quản lý toàn bộ hệ thống FoodDash</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {['Người dùng', 'Nhà hàng'].map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Tab 0: Users */}
      {tab === 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Danh sách tài khoản ({filteredUsers.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'customer', 'restaurant_owner', 'admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', borderColor: roleFilter === r ? 'var(--primary)' : 'var(--border)', background: roleFilter === r ? 'var(--primary)' : '#fff', color: roleFilter === r ? '#fff' : 'var(--text-muted)' }}>
                  {r === 'all' ? 'Tất cả' : r === 'customer' ? 'Khách hàng' : r === 'restaurant_owner' ? 'Chủ quán' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th></th></tr></thead>
              <tbody>
                {filteredUsers.map(u => {
                  const rb = ROLE_BADGE[u.role] || ROLE_BADGE.customer
                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td><span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: rb.bg, color: rb.color }}>{rb.label}</span></td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className="btn-ghost" onClick={() => deleteUser(u._id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Restaurants */}
      {tab === 1 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Danh sách nhà hàng ({restaurants.length})</h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>Tên nhà hàng</th><th>Loại ẩm thực</th><th>Chủ sở hữu</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {restaurants.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.cuisine}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.ownerEmail || '—'}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: r.isActive ? '#d1fae5' : '#fee2e2', color: r.isActive ? '#065f46' : '#991b1b' }}>
                        {r.isActive ? '● Đang hoạt động' : '● Đã tắt'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ghost" onClick={() => toggleRestaurant(r)} style={{ color: r.isActive ? '#ef4444' : 'var(--primary)' }}>
                        {r.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
