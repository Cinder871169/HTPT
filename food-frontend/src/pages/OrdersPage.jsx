import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { orderAPI } from '../services/api'
const STATUS_CONFIG = {
  pending:    { label: 'Chờ xác nhận', icon: <Clock size={14} />, color: '#92400e', bg: '#fef3c7' },
  confirmed:  { label: 'Đã xác nhận',  icon: <CheckCircle size={14} />, color: '#1e40af', bg: '#dbeafe' },
  preparing:  { label: 'Đang chuẩn bị', icon: <Package size={14} />, color: '#6d28d9', bg: '#ede9fe' },
  delivering: { label: 'Đang giao',    icon: <Truck size={14} />, color: '#065f46', bg: '#d1fae5' },
  delivered:  { label: 'Đã giao',      icon: <CheckCircle size={14} />, color: '#065f46', bg: '#d1fae5' },
  cancelled:  { label: 'Đã hủy',       icon: <XCircle size={14} />, color: '#991b1b', bg: '#fee2e2' },
}

const STEPS = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']

export default function OrdersPage({ onToast }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await orderAPI.getMyOrders()
        setOrders(res.data?.data || [])
      } catch (err) {
        console.error("Error loading orders:", err)
        onToast('Không thể tải danh sách đơn hàng.', 'error')
        setOrders([])
      } finally { setLoading(false) }
    }
    load()
  }, [onToast])

  const cancelOrder = async (id) => {
    try {
      await orderAPI.cancelOrder(id)
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o))
      onToast('Đơn hàng đã được hủy.', 'success')
    } catch (err) {
      console.error("Cancel order error:", err)
      onToast('Hủy đơn hàng thất bại.', 'error')
    }
  }

  const cfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Trang chủ
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800 }}>Lịch sử đơn hàng</h1>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Package size={56} style={{ opacity: .3, marginBottom: 16 }} />
          <p style={{ fontWeight: 600, fontSize: 18 }}>Chưa có đơn hàng nào</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 16 }}><button className="btn-primary">Đặt ngay</button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map(order => {
            const c = cfg(order.status)
            const stepIdx = STEPS.indexOf(order.status)
            return (
              <div key={order._id} className="card" style={{ padding: 24 }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{order.restaurantName || 'Nhà hàng'}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 13, fontWeight: 600, background: c.bg, color: c.color }}>
                      {c.icon} {c.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {order.status !== 'cancelled' && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      {STEPS.map((step, i) => (
                        <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= stepIdx ? 'var(--primary)' : 'var(--border)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s' }}>
                            {i < stepIdx ? <CheckCircle size={14} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === stepIdx ? '#fff' : 'transparent' }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 4, background: 'var(--primary)', width: `${(stepIdx / (STEPS.length - 1)) * 100}%`, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)' }}>
                    Tổng: {order.totalAmount?.toLocaleString('vi-VN')}đ
                  </span>
                  {order.status === 'pending' && (
                    <button onClick={() => cancelOrder(order._id)} style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
