import { Share2, Rss, Send, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const SOCIALS = [Share2, Rss, Send]

const LINKS = {
  'Khách hàng': ['Đặt hàng', 'Lịch sử đơn', 'Ví FoodDash', 'Ưu đãi & Khuyến mãi'],
  'Đối tác': ['Đăng ký nhà hàng', 'Dashboard Chủ quán', 'Chính sách hoa hồng', 'Hỗ trợ đối tác'],
  'Về chúng tôi': ['Câu chuyện FoodDash', 'Tuyển dụng', 'Blog ẩm thực', 'Truyền thông'],
}

export default function Footer() {
  return (
    <footer style={{ background: '#111827', color: '#fff', padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 48, marginBottom: 56 }}>
          {/* Brand col */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍜</div>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: '#fff' }}>FoodDash</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Nền tảng đặt đồ ăn trực tuyến hàng đầu Việt Nam. Kết nối bạn với hàng trăm nhà hàng chất lượng.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map((Icon, i) => (
                <button key={i} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}>
                  <Icon size={17} color="#fff" />
                </button>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#f9fafb' }}>{title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#f9fafb' }}>Liên hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Phone, text: '1800 6789 (Miễn phí)' },
                { icon: Mail, text: 'support@fooddash.vn' },
                { icon: MapPin, text: '123 Nguyễn Huệ, Q.1, TP.HCM' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} color="var(--accent)" />
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            © {new Date().getFullYear()} FoodDash. Tất cả quyền được bảo lưu.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Điều khoản dịch vụ', 'Chính sách bảo mật', 'Cookie'].map(t => (
              <a key={t} href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13, transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
