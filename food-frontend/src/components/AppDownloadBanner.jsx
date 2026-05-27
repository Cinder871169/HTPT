import { Smartphone, Star, Download } from 'lucide-react'

export default function AppDownloadBanner() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
      padding: '80px 24px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(244,132,95,.12)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, alignItems: 'center', position: 'relative' }}>
        {/* Left */}
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.15)', color: '#fff', padding: '6px 18px', borderRadius: 50, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
            <Smartphone size={13} /> Ứng dụng di động
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            Tải app FoodDash<br />
            <span style={{ color: '#fde68a' }}>ngay hôm nay!</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Đặt hàng nhanh hơn, theo dõi đơn hàng thời gian thực, nhận ưu đãi độc quyền dành cho người dùng app.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['App Store', 'Google Play'].map(platform => (
              <button key={platform} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,.3)',
                color: '#fff', padding: '12px 22px', borderRadius: 14,
                cursor: 'pointer', fontWeight: 600, fontSize: 14,
                transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.15)'; e.currentTarget.style.transform = 'none' }}
              >
                <Download size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, opacity: .75 }}>Tải trên</div>
                  <div>{platform}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { value: '500K+', label: 'Lượt tải xuống', icon: '📱' },
            { value: '4.9★', label: 'Điểm đánh giá', icon: '⭐' },
            { value: '200+', label: 'Đối tác nhà hàng', icon: '🍽️' },
            { value: '30ph', label: 'Giao hàng trung bình', icon: '⚡' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
              borderRadius: 16, padding: '20px 18px',
              border: '1px solid rgba(255,255,255,.15)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
