import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, LayoutDashboard, ClipboardList, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import NotificationDropdown from './NotificationDropdown'
import CartDrawer from './CartDrawer'

export default function Header({ onToast }) {
  const { token, user, role, logout, cartCount, setAuthModalOpen } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout(); setUserMenuOpen(false)
    onToast('Đã đăng xuất thành công.', 'success')
    navigate('/')
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: 'rgba(255,255,255,.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 12px rgba(0,0,0,.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍜</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)', fontFamily: "'Playfair Display', serif" }}>FoodDash</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {token && role === 'customer' && (
              <Link to="/orders" style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 10, color: 'var(--text-muted)', fontWeight: 500, fontSize: 15, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = 'var(--text-dark)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardList size={16} /> Đơn hàng</span>
              </Link>
            )}
            {token && (role === 'restaurant_owner' || role === 'admin') && (
              <Link to="/dashboard" style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 10, color: 'var(--text-muted)', fontWeight: 500, fontSize: 15, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = 'var(--text-dark)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LayoutDashboard size={16} /> Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationDropdown />

            {/* Cart */}
            {token && role === 'customer' && (
              <button id="btn-cart" className="btn-ghost" style={{ position: 'relative', padding: 10 }} onClick={() => setCartOpen(true)}>
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </button>
            )}

            {/* User */}
            {token ? (
              <div style={{ position: 'relative' }}>
                <button id="btn-user-menu" className="btn-ghost"
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ').slice(-1)[0] || 'User'}
                  </span>
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', minWidth: 180, zIndex: 700, animation: 'slideUp .15s ease', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</p>
                    </div>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#ef4444', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button id="btn-login" className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setAuthModalOpen(true)}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onToast={onToast} />
    </>
  )
}
