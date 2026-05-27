import { Star, Flame, ArrowRight, ShoppingBag } from 'lucide-react'
import { useApp } from '../context/AppContext'

import { useState, useEffect } from 'react'
import { restaurantAPI } from '../services/api'

export default function BestSellers({ onToast }) {
  const { addToCart, setAuthModalOpen, token } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await restaurantAPI.getAll()
        const active = res.data?.filter(r => r.isActive !== false) || []
        if (active.length > 0) {
          const menuRes = await restaurantAPI.getMenu(active[0]._id)
          const menuItems = (menuRes.data || []).slice(0, 3).map((item, idx) => ({
            ...item,
            rank: idx + 1,
            emoji: item.emoji || ['🍔', '🍜', '🍣'][idx % 3],
            restaurant: active[0].name,
            restaurantId: active[0]._id,
            rating: 4.8,
            reviews: 120 + idx * 45,
            bg: ['#fef3c7', '#d1fae5', '#fdf4ff'][idx % 3],
            color: ['#d97706', '#2d6a4f', '#9333ea'][idx % 3],
          }))
          setItems(menuItems)
        }
      } catch (err) {
        console.error("Error loading best sellers:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleOrder = (item) => {
    if (!token) { setAuthModalOpen(true); return }
    addToCart({ menuItemId: item._id, name: item.name, price: item.price, restaurantId: item.restaurantId, emoji: item.emoji })
    onToast && onToast(`Đã thêm "${item.name}" vào giỏ! 🛒`, 'success')
  }

  if (items.length === 0) return null

  return (
    <section style={{ background: '#fff', padding: '96px 24px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff3e0', color: '#f4845f',
            padding: '6px 20px', borderRadius: 50,
            fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16,
          }}>
            <Flame size={14} /> Bán chạy nhất tuần
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: 'var(--text-dark)' }}>
            Khám phá{' '}<span style={{ color: 'var(--primary)' }}>Món Hot</span>{' '}của tuần
          </h2>
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 64, alignItems: 'center' }}>

          {/* LEFT — Hero food image */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {/* Glow background blob */}
            <div style={{
              position: 'absolute', width: 380, height: 380, borderRadius: '50%',
              background: 'radial-gradient(circle, #fef08a80 0%, #fefae000 70%)',
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            }} />

            {/* Bestseller badge */}
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #f4845f, #ef4444)',
              color: '#fff', padding: '8px 20px', borderRadius: 50,
              fontWeight: 800, fontSize: 14,
              boxShadow: '0 6px 20px rgba(244,132,95,.5)',
              zIndex: 10, whiteSpace: 'nowrap',
              animation: 'bounce .8s ease infinite alternate',
            }}>
              🔥 #1 Bestseller
            </div>

            {/* Food image */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <img
                src="/hero-burger.png"
                alt="Gourmet Burger - Bestseller"
                style={{
                  width: 360, maxWidth: '100%',
                  transform: 'scale(1.05)',
                  filter: 'drop-shadow(0 32px 48px rgba(0,0,0,.25))',
                  transition: 'transform .4s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.10) rotate(-2deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.05)'}
              />
            </div>

            {/* Floating info bubble */}
            <div style={{
              position: 'absolute', bottom: 24, right: 0,
              background: '#fff', borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,.12)',
              display: 'flex', alignItems: 'center', gap: 12, zIndex: 10,
              animation: 'slideUp .6s ease .3s both',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏆</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-dark)' }}>+2,841 đơn</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>trong tuần này</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Content */}
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800,
              color: 'var(--primary)', lineHeight: 1.15, marginBottom: 16,
            }}>
              Taste Our<br />Hot Bestsellers
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 400 }}>
              Được hàng nghìn khách hàng yêu thích và lựa chọn mỗi tuần — những món ăn này không bao giờ làm bạn thất vọng.
              Hương vị đỉnh cao, nguyên liệu tươi nhất.
            </p>

            {/* Top 3 list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {items.map((item, idx) => (
                <div key={item._id}
                  onClick={() => handleOrder(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                    border: '1.5px solid var(--border)',
                    transition: 'all .2s ease',
                    background: '#fff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = idx === 0 ? '#fefce8' : idx === 1 ? '#f0fdf4' : '#faf5ff'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    e.currentTarget.style.borderColor = item.color
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : '#cd7c3a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff',
                  }}>
                    {item.rank}
                  </div>

                  {/* Thumbnail */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, background: item.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>
                    {item.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)', marginBottom: 3 }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>

                  {/* Rating + Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginBottom: 4 }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{item.rating}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>
                      {item.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button
              onClick={() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--primary)', color: '#fff',
                padding: '16px 32px', borderRadius: 50, border: 'none',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(45,106,79,.35)',
                transition: 'all .2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45,106,79,.45)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(45,106,79,.35)' }}
            >
              <ShoppingBag size={18} /> Đặt ngay bây giờ <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
