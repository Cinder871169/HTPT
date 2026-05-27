import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={20} color="#2d6a4f" />,
  error:   <XCircle    size={20} color="#ef4444" />,
  warning: <AlertTriangle size={20} color="#f59e0b" />,
}

function ToastItem({ toast, onRemove }) {
  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      {ICONS[toast.type]}
      <p style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>{toast.message}</p>
      <button className="btn-ghost" style={{ padding: 4 }} onClick={() => onRemove(toast.id)}>
        <X size={16} color="#9ca3af" />
      </button>
    </div>
  )
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
