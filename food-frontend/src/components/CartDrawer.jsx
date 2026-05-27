import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { orderAPI } from '../services/api'

export default function CartDrawer({ open, onClose, onToast }) {
  const { cart, addToCart, setItemQuantity, removeFromCart, clearCart, cartTotal, token, setAuthModalOpen } = useApp()

  if (!open) return null

  const inc = (item) => setItemQuantity(item.menuItemId, item.quantity + 1)
  const dec = (item) => setItemQuantity(item.menuItemId, item.quantity - 1)
  const decrement = dec

  const handleCheckout = async () => {
    if (!token) { onClose(); setAuthModalOpen(true); return }
    if (cart.length === 0) return

    const restaurantId = cart[0]?.restaurantId
    const payload = {
      restaurantId,
      items: cart.map(i => ({ menuItemId: i.menuItemId, name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount: cartTotal,
      deliveryAddress: 'Địa chỉ mặc định',
    }

    try {
      await orderAPI.create(payload)
      clearCart()
      onClose()
      onToast('Đặt hàng thành công! Nhà hàng đang xác nhận đơn. 🎉', 'success')
    } catch (err) {
      console.error("Checkout error:", err)
      const status = err?.response?.status
      if (status === 400) onToast('Một số món đã hết hàng. Vui lòng kiểm tra lại giỏ.', 'error')
      else onToast('Đặt hàng không thành công. Vui lòng thử lại sau.', 'error')
    }
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 18 }}>Giỏ hàng</span>
            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 50, fontSize: 12, fontWeight: 700, padding: '2px 8px' }}>{cart.length}</span>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={56} style={{ opacity: .2, marginBottom: 16 }} />
              <p style={{ fontWeight: 600, fontSize: 16 }}>Giỏ hàng trống</p>
              <p style={{ fontSize: 14, marginTop: 6 }}>Thêm món ăn để bắt đầu đặt hàng</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cart.map(item => (
                <div key={item.menuItemId} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px', background: '#f9fafb', borderRadius: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                    background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                  }}>
                    {item.emoji || '🍜'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15, marginTop: 2 }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn-ghost" onClick={() => dec(item)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 6 }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button className="btn-ghost" onClick={() => inc(item)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 6 }}>
                      <Plus size={14} />
                    </button>
                    <button className="btn-ghost" onClick={() => removeFromCart(item.menuItemId)} style={{ color: '#ef4444', padding: 6 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tạm tính</span>
              <span style={{ fontWeight: 600 }}>{cartTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Phí giao hàng</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Miễn phí</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>{cartTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleCheckout}>
              Đặt hàng ngay
            </button>
            <button onClick={clearCart} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#ef4444', fontSize: 14, cursor: 'pointer', padding: 8 }}>
              Xóa giỏ hàng
            </button>
          </div>
        )}
      </div>
    </>
  )
}
