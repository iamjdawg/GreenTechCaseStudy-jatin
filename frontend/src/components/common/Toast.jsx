import { useState, useEffect } from 'react'

const TOAST_TYPES = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

let toastHandler = null

export function showToast(message, type = 'success') {
  if (toastHandler) toastHandler({ message, type })
}

export default function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    toastHandler = (t) => {
      setToast(t)
      setTimeout(() => setToast(null), 3000)
    }
    return () => { toastHandler = null }
  }, [])

  if (!toast) return null
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg ${TOAST_TYPES[toast.type] || TOAST_TYPES.info}`}>
      {toast.message}
    </div>
  )
}
