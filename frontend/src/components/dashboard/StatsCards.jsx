export default function StatsCards({ stats }) {
  if (!stats) return null
  const cards = [
    { label: 'Total Items', value: stats.total_items, icon: '📦', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Expiring Soon', value: stats.expiring_soon, icon: '⏰', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Expired', value: stats.expired_count, icon: '🚫', color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Total Value', value: `₹${stats.total_value.toFixed(2)}`, icon: '💰', color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Used Today', value: stats.items_used_today, icon: '✅', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg">{c.icon}</span>
          </div>
          <p className="text-2xl font-bold">{c.value}</p>
          <p className="text-xs opacity-75 mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  )
}
