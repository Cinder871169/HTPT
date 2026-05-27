import { Star, Quote } from 'lucide-react'

const REVIEWS = [
  { id: 1, name: 'Nguyễn Minh Anh', role: 'Khách hàng thân thiết', avatar: '👩', rating: 5, comment: 'FoodDash thay đổi hoàn toàn cách tôi đặt đồ ăn. Giao hàng siêu nhanh, món ăn vẫn nóng hổi khi nhận. Tôi đã dùng được 8 tháng và chưa có lần nào thất vọng!', location: 'TP.HCM' },
  { id: 2, name: 'Trần Văn Bình', role: 'Food Blogger', avatar: '👨', rating: 5, comment: 'Là một food blogger, tôi đã thử rất nhiều app giao đồ ăn. FoodDash vượt trội về sự đa dạng nhà hàng và chất lượng dịch vụ. UI đẹp, dễ dùng!', location: 'Hà Nội' },
  { id: 3, name: 'Lê Thị Thu Hà', role: 'Văn phòng 9-5', avatar: '👩‍💼', rating: 5, comment: 'Bữa trưa văn phòng không còn là nỗi lo nữa! Tôi đặt đồ ăn qua FoodDash mỗi ngày, giao tận bàn làm việc, tiết kiệm tới 30 phút nghỉ trưa quý báu.', location: 'Đà Nẵng' },
]

export default function Testimonials() {
  return (
    <section style={{ background: 'var(--bg-cream)', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(45,106,79,.1)', color: 'var(--primary)', padding: '6px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            <Star size={14} /> Khách hàng nói gì
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: 'var(--text-dark)' }}>
            Hàng nghìn khách hàng{' '}<span style={{ color: 'var(--primary)' }}>hài lòng</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {REVIEWS.map((rev, idx) => (
            <div key={rev.id} style={{
              background: '#fff', borderRadius: 20, padding: 28,
              border: '1px solid var(--border)',
              transition: 'transform .2s, box-shadow .2s',
              position: 'relative',
              animationDelay: `${idx * .15}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Quote icon */}
              <div style={{ position: 'absolute', top: 24, right: 24, color: 'var(--bg-cream)', fontSize: 60 }}>
                <Quote size={48} style={{ opacity: .2, color: 'var(--primary)' }} />
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>

              <p style={{ color: 'var(--text-dark)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                "{rev.comment}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {rev.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{rev.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{rev.role} · {rev.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
