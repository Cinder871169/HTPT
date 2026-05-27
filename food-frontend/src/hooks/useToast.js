import { useState, useCallback } from 'react'

let _id = 0

/**
 * useToast — Global toast notification hook
 * Usage: const { toasts, showToast, removeToast } = useToast()
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  /** Convenience helpers */
  const success = useCallback((msg) => showToast(msg, 'success'), [showToast])
  const error   = useCallback((msg) => showToast(msg, 'error', 5000), [showToast])
  const warning = useCallback((msg) => showToast(msg, 'warning', 5000), [showToast])

  /** Parse API errors into human-readable messages */
  const handleApiError = useCallback((err) => {
    const status = err?.response?.status
    if (status === 400) return error('Món ăn đã hết hàng hoặc yêu cầu không hợp lệ.')
    if (status === 401) return error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
    if (status === 429) return warning('Bạn đang thao tác quá nhanh. Vui lòng thử lại sau vài giây.')
    if (status === 500) return error('Lỗi máy chủ. Vui lòng thử lại sau.')
    return error(err?.response?.data?.message || 'Đã có lỗi xảy ra.')
  }, [error, warning])

  return { toasts, showToast, removeToast, success, error, warning, handleApiError }
}
