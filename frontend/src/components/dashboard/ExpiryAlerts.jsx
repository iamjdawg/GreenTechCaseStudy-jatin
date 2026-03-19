import { expiryLabel } from '../../utils/dateHelpers'

export default function ExpiryAlerts({ items, onRecipeClick }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Expiry Alerts</h3>
        <p className="text-sm text-gray-400">No items expiring soon!</p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Expiry Alerts (Next 7 Days)</h3>
        {onRecipeClick && (
          <button
            onClick={() => onRecipeClick(items)}
            className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-200 transition-colors"
          >
            Use It or Lose It
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {items.slice(0, 10).map((item) => {
          const exp = expiryLabel(item.expiry_date)
          return (
            <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
              </div>
              <span className={`text-xs font-medium ${exp.color}`}>{exp.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
