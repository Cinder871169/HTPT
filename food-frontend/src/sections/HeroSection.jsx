import { useState } from 'react'
import { Search, ArrowRight, Star, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATS = [
  { value: '200+', label: 'Nhà hàng' },
  { value: '50K+', label: 'Đơn hàng/tháng' },
  { value: '4.9★', label: 'Đánh giá TB' },
]

export default function HeroSection({ onSearch }) {
  const { setAuthModalOpen, token } = useApp()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(query)
    if (query) document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 580, display: 'flex', alignItems: 'center' }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #40916c 100%)',
      }} />
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(244,132,95,.15)' }} />
      <div style={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

      {/* Floating food emojis */}
      {['🍕', '🍜', '🍣', '🥗', '🍔', '🧋'].map((e, i) => (
        <div key={i} style={{
          position: 'absolute', fontSize: 40, opacity: .15,
          top: `${15 + i * 12}%`, right: `${5 + (i % 3) * 12}%`,
          animation: `pulse ${2 + i * .4}s ease infinite`,
          animationDelay: `${i * .3}s`,
        }}>{e}</div>
      ))}

      {/* Content */}
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <div style={{ maxWidth: 640 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', borderRadius: 50, padding: '6px 16px', marginBottom: 24, border: '1px solid rgba(255,255,255,.2)' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.9)', fontWeight: 500 }}>🚀 Giao hàng trong 30 phút</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Đồ ăn ngon <br />
            <span style={{ color: 'var(--accent-light)' }}>giao tận cửa</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', lineHeight: 1.6, marginBottom: 36, maxWidth: 480 }}>
            Khám phá hàng trăm nhà hàng, đặt món yêu thích và nhận hàng nhanh chóng chỉ trong vài bước.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="search-input"
                className="input"
                style={{ paddingLeft: 46, height: 52, borderRadius: 50, fontSize: 15, boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}
                placeholder="Tìm nhà hàng, món ăn..."
                value={query}
                onChange={e => { setQuery(e.target.value); onSearch(e.target.value) }}
              />
            </div>
            <button type="submit" className="btn-accent" style={{ height: 52, paddingInline: 28, borderRadius: 50, fontSize: 16, flexShrink: 0 }}>
              Tìm kiếm <ArrowRight size={18} />
            </button>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
