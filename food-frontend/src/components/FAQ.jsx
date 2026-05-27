import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    q: '⏱️ Thời gian giao hàng mất bao lâu?',
    a: 'Thời gian giao hàng trung bình từ 20–35 phút, tùy vào khoảng cách và tình trạng giao thông. FoodDash cam kết giao hàng trong vòng 45 phút hoặc bạn sẽ được hoàn tiền phí giao hàng.',
  },
  {
    q: '💰 Phí giao hàng được tính như thế nào?',
    a: 'Phí giao hàng phụ thuộc vào khoảng cách từ nhà hàng đến địa chỉ của bạn. Đơn hàng trên 150.000đ được miễn phí giao trong bán kính 3km. Thành viên Premium được miễn phí giao hàng không giới hạn.',
  },
  {
    q: '🔄 Tôi có thể hủy đơn hàng không?',
    a: 'Bạn có thể hủy đơn hàng miễn phí trong vòng 2 phút sau khi đặt, hoặc khi đơn hàng còn ở trạng thái "Chờ xác nhận". Sau khi nhà hàng đã xác nhận, việc hủy đơn sẽ tuỳ thuộc vào chính sách của từng nhà hàng.',
  },
  {
    q: '💳 FoodDash hỗ trợ những phương thức thanh toán nào?',
    a: 'Chúng tôi chấp nhận: Tiền mặt khi nhận hàng (COD), Ví điện tử (MoMo, ZaloPay, VNPay), Thẻ ngân hàng (nội địa & quốc tế), Chuyển khoản ngân hàng. Tất cả giao dịch đều được mã hóa SSL an toàn.',
  },
  {
    q: '⭐ Làm thế nào để trở thành đối tác nhà hàng?',
    a: 'Rất đơn giản! Đăng ký tài khoản với vai trò "Chủ cửa hàng", điền đầy đủ thông tin nhà hàng và thực đơn. Đội ngũ FoodDash sẽ xem xét và phê duyệt trong vòng 24 giờ. Hoàn toàn miễn phí để bắt đầu!',
  },
  {
    q: '🛡️ Chất lượng thực phẩm có được đảm bảo không?',
    a: 'FoodDash hợp tác chỉ với các nhà hàng đã được kiểm định vệ sinh an toàn thực phẩm. Chúng tôi có hệ thống đánh giá từ khách hàng thực tế và thường xuyên kiểm tra chất lượng để đảm bảo trải nghiệm tốt nhất.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(0) // mặc định mở câu 1

  return (
    <section style={{ background: '#fff', padding: '96px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(45,106,79,.1)', color: 'var(--primary)',
            padding: '6px 20px', borderRadius: 50,
            fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16,
          }}>
            <HelpCircle size={14} /> Hỏi đáp
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 14 }}>
            Câu hỏi{' '}<span style={{ color: 'var(--primary)' }}>thường gặp</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            Không tìm thấy câu trả lời? Liên hệ đội hỗ trợ 24/7 của chúng tôi.
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = open === idx
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'border-color .2s',
                  boxShadow: isOpen ? '0 4px 20px rgba(45,106,79,.1)' : 'none',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  style={{
                    width: '100%', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    background: isOpen ? 'rgba(45,106,79,.04)' : '#fff',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background .15s',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15, color: isOpen ? 'var(--primary)' : 'var(--text-dark)', lineHeight: 1.4, flex: 1 }}>
                    {faq.q}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isOpen ? 'var(--primary)' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s',
                  }}>
                    <ChevronDown
                      size={16}
                      color={isOpen ? '#fff' : 'var(--text-muted)'}
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }}
                    />
                  </div>
                </button>

                {/* Answer (animated via max-height trick) */}
                <div style={{
                  maxHeight: isOpen ? 300 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .3s ease',
                }}>
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, paddingTop: 16 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '32px', background: 'linear-gradient(135deg, rgba(45,106,79,.06), rgba(244,132,95,.06))', borderRadius: 20, border: '1px dashed var(--border)' }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Vẫn còn thắc mắc?</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7</p>
          <a href="mailto:support@fooddash.vn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--primary)', color: '#fff',
            padding: '12px 28px', borderRadius: 50, textDecoration: 'none',
            fontWeight: 600, fontSize: 14,
          }}>
            Liên hệ hỗ trợ →
          </a>
        </div>
      </div>
    </section>
  )
}
