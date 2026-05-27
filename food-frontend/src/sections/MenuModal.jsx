import { useState, useEffect } from 'react'
import { X, Star, Clock, MapPin } from 'lucide-react'
import { restaurantAPI } from '../services/api'
import MenuItemCard from '../components/MenuItemCard'
import { useApp } from '../context/AppContext'

export default function MenuModal({ restaurant, onClose, onToast }) {
  const { addToCart } = useApp()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  useEffect(() => {
    if (!restaurant) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await restaurantAPI.getMenu(restaurant._id)
        setMenu(res.data?.data || [])
      } catch (err) {
        console.error("Error loading menu:", err)
        onToast && onToast('Không thể tải thực đơn của nhà hàng.', 'error')
        setMenu([])
      } finally { setLoading(false) }
    }
    load()
  }, [restaurant, onToast])

  if (!restaurant) return null

  const categories = ['Tất cả', ...new Set(menu.map(m => m.category).filter(Boolean))]
  const filtered = activeCategory === 'Tất cả' ? menu : menu.filter(m => m.category === activeCategory)

  const handleAdd = (item) => {
    addToCart({ menuItemId: item._id, name: item.name, price: item.price, restaurantId: restaurant._id, emoji: item.emoji })
    onToast(`Đã thêm "${item.name}" vào giỏ hàng 🛒`, 'success')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 860, maxHeight: '92vh', display: 'flex', flexDirection: 'column', animation: 'slideUp .2s ease' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg, ${restaurant.color || '#d1fae5'}, ${restaurant.color2 || '#a7f3d0'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
              {restaurant.emoji || '🍽️'}
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 22 }}>{restaurant.name}</h2>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}><Star size={14} fill="var(--accent)" color="var(--accent)" />{restaurant.rating || '4.8'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}><Clock size={14} />25-35 phút</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}><MapPin size={14} />{restaurant.address || 'TP.HCM'}</span>
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Category filter */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '7px 18px', borderRadius: 50, border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`, background: activeCategory === cat ? 'var(--primary)' : '#fff', color: activeCategory === cat ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ height: 140 }} />
                  <div style={{ padding: 14 }}>
                    <div className="skeleton" style={{ height: 16, borderRadius: 8, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {filtered.map(item => (
                <MenuItemCard key={item._id} item={item} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
