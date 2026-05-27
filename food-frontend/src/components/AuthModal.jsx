import { useState } from 'react'
import { X, Mail, Lock, User, ChefHat, ShoppingBag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { authAPI } from '../services/api'

export default function AuthModal({ onToast }) {
  const { authModalOpen, setAuthModalOpen, login } = useApp()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' })

  if (!authModalOpen) return null

  const close = () => { setAuthModalOpen(false); setForm({ name: '', email: '', password: '', role: 'customer' }) }

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password })
      const { user, token } = res.data.data
      login(user, token)
      onToast(`Chào mừng trở lại, ${user.name}! 🎉`, 'success')
      close()
    } catch (err) {
      console.error("Login error:", err)
      onToast('Email hoặc mật khẩu không đúng.', 'error')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { onToast('Vui lòng điền đầy đủ thông tin.', 'warning'); return }
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      const { user, token } = res.data.data
      login(user, token)
      onToast(`Đăng ký thành công! Chào ${user.name} 🎉`, 'success')
      close()
    } catch (err) {
      console.error("Registration error:", err)
      onToast('Đăng ký không thành công. Email có thể đã tồn tại.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>FoodDash</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
              {tab === 'login' ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
            </p>
          </div>
          <button className="btn-ghost" onClick={close}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '20px 28px 0' }}>
          <div className="tabs">
            <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Đăng nhập</button>
            <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Đăng ký</button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} style={{ padding: 28 }}>
          {tab === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-dark)' }}>Họ tên</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 40 }} placeholder="Nguyễn Văn A"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="email@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
          </div>

          {tab === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Bạn là?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { value: 'customer', label: 'Khách hàng', icon: <ShoppingBag size={22} />, desc: 'Đặt đồ ăn yêu thích' },
                  { value: 'restaurant_owner', label: 'Chủ cửa hàng', icon: <ChefHat size={22} />, desc: 'Quản lý nhà hàng' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('role', opt.value)}
                    style={{
                      padding: '14px 12px', borderRadius: 12, border: `2px solid ${form.role === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.role === opt.value ? 'rgba(45,106,79,.06)' : '#fff',
                      cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                      color: form.role === opt.value ? 'var(--primary)' : 'var(--text-muted)',
                    }}>
                    <div style={{ marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> : null}
            {tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </div>
  )
}
