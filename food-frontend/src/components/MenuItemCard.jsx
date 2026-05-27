import { Plus, Star } from 'lucide-react'

export default function MenuItemCard({ item, onAdd }) {
  const unavailable = item.isAvailable === false || item.stock === 0

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid var(--border)',
      overflow: 'hidden', transition: 'transform .2s, box-shadow .2s',
      opacity: unavailable ? 0.6 : 1,
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { if (!unavailable) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Image area */}
      <div style={{
        height: 140, background: `linear-gradient(135deg, ${item.color || '#d1fae5'}, ${item.color2 || '#a7f3d0'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
        position: 'relative'
      }}>
        {item.emoji || '🍜'}
        {unavailable && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, background: '#ef4444', padding: '4px 12px', borderRadius: 50 }}>Hết hàng</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {item.category && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.category}</span>
        )}
        <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 4, lineHeight: 1.3 }}>{item.name}</h4>
        {item.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)' }}>
              {item.price?.toLocaleString('vi-VN')}đ
            </span>
            {item.stock != null && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>còn {item.stock}</span>
            )}
          </div>
          <button
            disabled={unavailable}
            onClick={() => !unavailable && onAdd(item)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: unavailable ? '#e5e7eb' : 'var(--primary)',
              border: 'none', cursor: unavailable ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .15s, transform .15s',
              color: '#fff',
            }}
            onMouseEnter={e => { if (!unavailable) e.currentTarget.style.background = 'var(--primary-light)' }}
            onMouseLeave={e => { if (!unavailable) e.currentTarget.style.background = 'var(--primary)' }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
