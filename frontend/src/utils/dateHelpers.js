export function daysUntil(dateStr) {
  if (!dateStr) return null
  const expiry = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function expiryLabel(dateStr) {
  const days = daysUntil(dateStr)
  if (days === null) return { text: 'No expiry', color: 'text-gray-400' }
  if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, color: 'text-red-600' }
  if (days === 0) return { text: 'Expires today', color: 'text-red-600' }
  if (days === 1) return { text: 'Expires tomorrow', color: 'text-red-500' }
  if (days <= 3) return { text: `${days} days left`, color: 'text-amber-600' }
  if (days <= 7) return { text: `${days} days left`, color: 'text-yellow-600' }
  return { text: `${days} days left`, color: 'text-green-600' }
}
