import { MapPin, Utensils, CreditCard, Bike } from 'lucide-react'

const STEPS = [
  {
    icon: MapPin,
    step: '01',
    title: 'Chọn địa điểm',
    desc: 'Nhập địa chỉ của bạn để khám phá hàng trăm nhà hàng ngon gần nhất.',
    color: '#2d6a4f',
    bg: '#d1fae5',
  },
  {
    icon: Utensils,
    step: '02',
    title: 'Chọn món ngon',
    desc: 'Duyệt thực đơn phong phú, chọn món yêu thích và thêm vào giỏ hàng.',
    color: '#f4845f',
    bg: '#ffedd5',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Thanh toán nhanh',
    desc: 'Thanh toán an toàn, tiện lợi qua nhiều phương thức khác nhau.',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    icon: Bike,
    step: '04',
    title: 'Giao hàng siêu tốc',
    desc: 'Đơn hàng đến tay bạn trong vòng 30 phút. Tươi ngon, đúng giờ!',
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },
]

export default function HowItWorks() {
  return (
    <section style={{ background: '#fff', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(45,106,79,.1)',
            color: 'var(--primary)',
            padding: '6px 20px', borderRadius: 50,
            fontSize: 13, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            Cách hoạt động
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800,
            color: 'var(--text-dark)', marginBottom: 14, lineHeight: 1.2,
          }}>
            Đặt hàng chỉ trong{' '}
            <span style={{ color: 'var(--primary)' }}>4 bước đơn giản</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Từ lúc chọn món đến khi nhận hàng, mọi thứ diễn ra cực kỳ nhanh chóng và tiện lợi.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>

                {/* Dashed connector line */}
                {idx < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 44, left: 'calc(50% + 44px)',
                    width: 'calc(100% - 88px)', height: 2,
                    borderTop: '2.5px dashed #d1d5db',
                    zIndex: 0,
                  }} />
                )}

                {/* Step number badge */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}>
                  {/* Outer ring */}
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    border: `2.5px dashed ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: `spin ${12 + idx * 3}s linear infinite`,
                  }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: step.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 8px 24px ${step.color}30`,
                      transition: 'transform .2s, box-shadow .2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 12px 32px ${step.color}50` }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 24px ${step.color}30` }}
                    >
                      <Icon size={30} color={step.color} strokeWidth={2} />
                    </div>
                  </div>
                  {/* Step number */}
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 26, height: 26, borderRadius: '50%',
                    background: step.color, color: '#fff',
                    fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                  }}>
                    {idx + 1}
                  </div>
                </div>

                <h3 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-dark)', marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 200 }}>
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
