import { STATUS_COLORS, CATEGORY_ICONS } from '../../utils/constants'
import { expiryLabel, formatDate } from '../../utils/dateHelpers'

export default function InventoryCard({ item, onUse, onEdit, onDelete }) {
  const colors = STATUS_COLORS[item.status] || STATUS_COLORS.active
  const expiry = expiryLabel(item.expiry_date)
  const catIcon = item.category ? CATEGORY_ICONS[item.category.name] || '📦' : '📦'

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4 flex flex-col justify-between transition-shadow hover:shadow-md`}>
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{catIcon}</span>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
            {item.status}
          </span>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <p><span className="font-medium">Qty:</span> {item.quantity} {item.unit}</p>
          {item.cost_per_unit > 0 && <p><span className="font-medium">Value:</span> ₹{(item.quantity * item.cost_per_unit).toFixed(2)}</p>}
          {item.expiry_date && (
            <p className={expiry.color + ' font-medium'}>{expiry.text}</p>
          )}
          {item.category && <p className="text-gray-400">{item.category.name}</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200/60">
        <button
          onClick={() => onUse(item)}
          disabled={item.quantity <= 0}
          className="flex-1 text-xs py-1.5 rounded-lg bg-leaf-600 text-white hover:bg-leaf-700 disabled:opacity-40 font-medium transition-colors"
        >
          - Use
        </button>
        <button
          onClick={() => onEdit(item)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="text-xs py-1.5 px-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
