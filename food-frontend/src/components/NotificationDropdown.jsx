import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { notificationAPI } from '../services/api'

export default function NotificationDropdown() {
  const { notifications, fetchNotifications, markNotificationRead, unreadCount, token } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (token) fetchNotifications()
  }, [token, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const markAll = async () => {
    try { await notificationAPI.markAllRead() } catch {}
    notifications.forEach(n => !n.read && markNotificationRead(n._id))
  }

  if (!token) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn-ghost" id="btn-notifications" style={{ position: 'relative', padding: 10 }} onClick={() => setOpen(o => !o)}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 340, background: '#fff',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)', zIndex: 800,
          animation: 'slideUp .15s ease',
        }}>
          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Thông báo</span>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={15} /> Đọc tất cả
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                <Bell size={32} style={{ opacity: .3, marginBottom: 8 }} />
                <p>Không có thông báo</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id}
                onClick={() => !n.read && markNotificationRead(n._id)}
                style={{
                  padding: '14px 18px', cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(45,106,79,.04)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background .15s',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.4, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {n.read && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 3 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
