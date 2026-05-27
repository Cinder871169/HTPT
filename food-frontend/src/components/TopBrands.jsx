import { Star, Award } from 'lucide-react'

const BRANDS = [
  { id: 1, name: 'Phở Hà Nội 1946', cuisine: 'Phở & Bún', rating: 4.9, orders: '12K+', emoji: '🍜', color: '#d1fae5', accent: '#2d6a4f', tag: 'Bestseller' },
  { id: 2, name: 'Pizza Roma', cuisine: 'Ý - Pizza', rating: 4.8, orders: '8K+', emoji: '🍕', color: '#fee2e2', accent: '#dc2626', tag: 'Hot' },
  { id: 3, name: 'Sushi Sakura', cuisine: 'Nhật Bản', rating: 4.9, orders: '10K+', emoji: '🍣', color: '#fdf4ff', accent: '#9333ea', tag: 'Premium' },
  { id: 4, name: 'Burger & Fries', cuisine: 'Fast Food', rating: 4.7, orders: '15K+', emoji: '🍔', color: '#fef3c7', accent: '#d97706', tag: 'Phổ biến' },
  { id: 5, name: 'Dim Sum Palace', cuisine: 'Trung Hoa', rating: 4.8, orders: '6K+', emoji: '🥟', color: '#e0f2fe', accent: '#0284c7', tag: 'Truyền thống' },
  { id: 6, name: 'Cơm Tấm Bà Hai', cuisine: 'Cơm Tấm', rating: 4.6, orders: '20K+', emoji: '🍚', color: '#ede9fe', accent: '#7c3aed', tag: 'Đặc sản' },
  { id: 7, name: 'Lẩu Thái Spicy', cuisine: 'Lẩu & Nướng', rating: 4.7, orders: '9K+', emoji: '🍲', color: '#fce7f3', accent: '#db2777', tag: 'Cay' },
  { id: 8, name: 'Baguette & Co.', cuisine: 'Pháp - Bánh mì', rating: 4.8, orders: '5K+', emoji: '🥖', color: '#f0fdf4', accent: '#16a34a', tag: 'Mới' },
]

export default function TopBrands() {
  return (
    <section style={{ background: 'var(--bg-cream)', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(45,106,79,.1)', color: 'var(--primary)',
              padding: '6px 20px', borderRadius: 50,
              fontSize: 13, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', marginBottom: 16,
            }}>
              <Award size={14} /> Đối tác tin cậy
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800,
              color: 'var(--text-dark)', lineHeight: 1.2,
            }}>
              Đối tác{' '}
              <span style={{ color: 'var(--primary)' }}>nhà hàng nổi tiếng</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 320, lineHeight: 1.6 }}>
            Hợp tác với hàng trăm nhà hàng uy tín, đảm bảo chất lượng tốt nhất cho mỗi bữa ăn của bạn.
          </p>
        </div>

        {/* Brand grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {BRANDS.map(brand => (
            <div key={brand.id}
              style={{
                background: '#fff', borderRadius: 20,
                border: '1px solid var(--border)',
                padding: '22px 24px',
                cursor: 'pointer',
                transition: 'transform .2s ease, box-shadow .2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Decorative bg blob */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: brand.color, opacity: .5 }} />

              {/* Tag badge */}
              <span style={{
                position: 'absolute', top: 16, right: 16,
                background: brand.color, color: brand.accent,
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
              }}>
                {brand.tag}
              </span>

              {/* Emoji icon */}
              <div style={{
                width: 60, height: 60, borderRadius: 16, background: brand.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, marginBottom: 14, position: 'relative', zIndex: 1,
              }}>
                {brand.emoji}
              </div>

              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: 'var(--text-dark)' }}>{brand.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>{brand.cuisine}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {brand.rating}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: '#f3f4f6', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>
                  {brand.orders} đơn
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
