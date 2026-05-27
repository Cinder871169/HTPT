import { useState, useEffect } from 'react'
import { Store, UtensilsCrossed, ClipboardList, Plus, Pencil, Trash2, CheckCircle, ChevronDown } from 'lucide-react'
import { restaurantAPI, orderAPI } from '../../services/api'
import { useApp } from '../../context/AppContext'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']
const STATUS_LABEL = { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', preparing: 'Đang nấu', delivering: 'Đang giao', delivered: 'Hoàn thành', cancelled: 'Đã hủy' }

export default function OwnerDashboard({ onToast }) {
  const { user } = useApp()
  const [tab, setTab] = useState(0)
  const [restaurant, setRestaurant] = useState(null)
  const [myRestaurants, setMyRestaurants] = useState([])
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [restaurantForm, setRestaurantForm] = useState({ name: '', address: '', phone: '', cuisine: '' })
  const [menuForm, setMenuForm] = useState({ name: '', price: '', category: '', stock: '', description: '' })
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. Tải danh sách nhà hàng thuộc sở hữu của user
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!user?._id) return
      setLoading(true)
      try {
        const rRes = await restaurantAPI.getAll({ limit: 100 })
        const owned = rRes.data?.data?.filter(r => r.ownerId === user._id) || []
        setMyRestaurants(owned)
        if (owned.length > 0) {
          setRestaurant(owned[0])
        } else {
          setRestaurant(null)
        }
      } catch (err) {
        console.error("Error loading owner restaurants:", err)
        onToast('Lỗi khi tải danh sách nhà hàng.', 'error')
        setMyRestaurants([])
        setRestaurant(null)
      } finally {
        setLoading(false)
      }
    }
    loadRestaurants()
  }, [user, onToast])

  // 2. Tải menu và orders khi restaurant thay đổi
  useEffect(() => {
    const loadDetails = async () => {
      if (!restaurant?._id) {
        setMenu([])
        setOrders([])
        return
      }
      setLoading(true)
      try {
        const [mRes, oRes] = await Promise.all([
          restaurantAPI.getMenu(restaurant._id),
          orderAPI.getRestaurantOrders(restaurant._id)
        ])
        setMenu(mRes.data?.data || [])
        setOrders(oRes.data?.data || [])
      } catch (err) {
        console.error("Error loading restaurant details:", err)
        onToast('Lỗi khi tải thực đơn và đơn hàng.', 'error')
        setMenu([])
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [restaurant, onToast])

  useEffect(() => {
    if (restaurant) setRestaurantForm(restaurant)
  }, [restaurant])

  const saveRestaurant = async (e) => {
    e.preventDefault()
    try {
      if (restaurant) {
        const res = await restaurantAPI.update(restaurant._id, restaurantForm)
        const updated = res.data?.data
        setRestaurant(updated)
        setMyRestaurants(prev => prev.map(r => r._id === updated._id ? updated : r))
      } else {
        const res = await restaurantAPI.create(restaurantForm)
        const created = res.data?.data
        setRestaurant(created)
        setMyRestaurants(prev => [...prev, created])
      }
      onToast('Đã lưu thông tin nhà hàng!', 'success')
    } catch (err) {
      console.error("Save restaurant error:", err)
      onToast('Lỗi khi lưu thông tin nhà hàng.', 'error')
    }
  }

  const addMenuItem = async (e) => {
    e.preventDefault()
    if (!restaurant?._id) return
    const item = { ...menuForm, price: Number(menuForm.price), stock: Number(menuForm.stock), isAvailable: Number(menuForm.stock) > 0 }
    try {
      const res = await restaurantAPI.addMenuItem(restaurant._id, item)
      setMenu(prev => [...prev, res.data?.data])
      setMenuForm({ name: '', price: '', category: '', stock: '', description: '' })
      setShowMenuForm(false)
      onToast('Đã thêm món ăn!', 'success')
    } catch (err) {
      console.error("Add menu item error:", err)
      onToast('Không thể thêm món ăn.', 'error')
    }
  }

  const deleteItem = async (id) => {
    try {
      await restaurantAPI.deleteMenuItem(id)
      setMenu(prev => prev.filter(m => m._id !== id))
      onToast('Đã xóa món.', 'success')
    } catch (err) {
      console.error("Delete menu item error:", err)
      onToast('Xóa món thất bại.', 'error')
    }
  }

  const nextStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status)
    if (idx >= STATUS_FLOW.length - 1) return
    const next = STATUS_FLOW[idx + 1]
    try {
      await orderAPI.updateStatus(order._id, next)
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: next } : o))
      onToast(`Đơn hàng chuyển sang: ${STATUS_LABEL[next]}`, 'success')
    } catch (err) {
      console.error("Update order status error:", err)
      onToast('Cập nhật trạng thái thất bại.', 'error')
    }
  }

  const cancelOrder = async (id) => {
    try {
      await orderAPI.updateStatus(id, 'cancelled')
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o))
      onToast('Đã hủy đơn hàng.', 'success')
    } catch (err) {
      console.error("Cancel order error:", err)
      onToast('Hủy đơn hàng thất bại.', 'error')
    }
  }

  const TABS = [
    { label: 'Nhà hàng', icon: <Store size={16} /> },
    { label: 'Thực đơn', icon: <UtensilsCrossed size={16} /> },
    { label: 'Đơn hàng', icon: <ClipboardList size={16} /> },
  ]

  const inp = (k, form, setForm, placeholder, type='text') => (
    <input className="input" type={type} placeholder={placeholder} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ marginBottom: 12 }} />
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800 }}>Dashboard Chủ Nhà Hàng</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Quản lý nhà hàng, thực đơn và đơn hàng của bạn</p>
        </div>
        
        {myRestaurants.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Đang xem nhà hàng:</span>
            <div style={{ position: 'relative' }}>
              <select 
                value={restaurant?._id || ''} 
                onChange={e => {
                  const selectedId = e.target.value
                  const found = myRestaurants.find(r => r._id === selectedId)
                  if (found) setRestaurant(found)
                }}
                style={{
                  padding: '10px 36px 10px 18px',
                  borderRadius: 50,
                  border: '1.5px solid var(--primary)',
                  background: '#fff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none', // Remove native arrow
                }}
              >
                {myRestaurants.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
            </div>
          </div>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab 0: Restaurant Info */}
      {tab === 0 && (
        <div className="card" style={{ padding: 28, maxWidth: 560 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>{restaurant ? 'Thông tin nhà hàng' : 'Đăng ký nhà hàng'}</h3>
          <form onSubmit={saveRestaurant}>
            {inp('name', restaurantForm, setRestaurantForm, 'Tên nhà hàng')}
            {inp('cuisine', restaurantForm, setRestaurantForm, 'Loại ẩm thực (VD: Món Việt, Pizza...)')}
            {inp('address', restaurantForm, setRestaurantForm, 'Địa chỉ')}
            {inp('phone', restaurantForm, setRestaurantForm, 'Số điện thoại')}
            <button className="btn-primary" type="submit" style={{ marginTop: 4 }}>
              <CheckCircle size={16} /> {restaurant ? 'Lưu thay đổi' : 'Đăng ký nhà hàng'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 1: Menu */}
      {tab === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Thực đơn ({menu.length} món)</h3>
            <button className="btn-primary" onClick={() => setShowMenuForm(o => !o)} style={{ padding: '10px 18px' }}>
              <Plus size={16} /> Thêm món
            </button>
          </div>

          {showMenuForm && (
            <div className="card" style={{ padding: 24, marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Thêm món mới</h4>
              <form onSubmit={addMenuItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <input className="input" placeholder="Tên món *" value={menuForm.name} onChange={e => setMenuForm(p => ({ ...p, name: e.target.value }))} required />
                  <input className="input" type="number" placeholder="Giá (đ) *" value={menuForm.price} onChange={e => setMenuForm(p => ({ ...p, price: e.target.value }))} required />
                  <input className="input" placeholder="Danh mục" value={menuForm.category} onChange={e => setMenuForm(p => ({ ...p, category: e.target.value }))} />
                  <input className="input" type="number" placeholder="Tồn kho *" value={menuForm.stock} onChange={e => setMenuForm(p => ({ ...p, stock: e.target.value }))} required />
                </div>
                <input className="input" placeholder="Mô tả món ăn" value={menuForm.description} onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))} style={{ marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" type="submit"><Plus size={15} /> Thêm</button>
                  <button type="button" className="btn-outline" onClick={() => setShowMenuForm(false)}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>
                {menu.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.category}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.price?.toLocaleString('vi-VN')}đ</td>
                    <td>{item.stock}</td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: item.isAvailable ? '#d1fae5' : '#fee2e2', color: item.isAvailable ? '#065f46' : '#991b1b' }}>
                        {item.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ghost" onClick={() => deleteItem(item._id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {tab === 2 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Đơn hàng ({orders.length})</h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>Món</th><th>Tổng tiền</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {orders.map(o => {
                  const idx = STATUS_FLOW.indexOf(o.status)
                  const canAdvance = idx >= 0 && idx < STATUS_FLOW.length - 1
                  return (
                    <tr key={o._id}>
                      <td>{o.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</td>
                      <td style={{ fontWeight: 700 }}>{o.totalAmount?.toLocaleString('vi-VN')}đ</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleTimeString('vi-VN')}</td>
                      <td><span className={`status status-${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {canAdvance && o.status !== 'cancelled' && (
                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => nextStatus(o)}>
                              {STATUS_LABEL[STATUS_FLOW[idx + 1]]} <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                            </button>
                          )}
                          {o.status !== 'cancelled' && o.status !== 'delivered' && (
                            <button onClick={() => cancelOrder(o._id)} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #ef4444', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer' }}>Hủy</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
