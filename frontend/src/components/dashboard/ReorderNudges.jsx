import { URGENCY_COLORS } from '../../utils/constants'

export default function ReorderNudges({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Reorder Nudges</h3>
        <p className="text-sm text-gray-400">All stock levels look good!</p>
      </div>
    )
  }
  const urgent = suggestions.filter(s => s.urgency !== 'ok')
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Reorder Nudges</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {(urgent.length > 0 ? urgent : suggestions.slice(0, 8)).map((s) => (
          <div key={s.item_id} className={`py-2 px-3 rounded-lg border ${URGENCY_COLORS[s.urgency]}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{s.item_name}</p>
              <span className="text-xs font-bold">{s.days_until_empty}d left</span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              {s.current_quantity} {s.unit} remaining &middot; Burns {s.daily_burn_rate}/{s.unit} per day
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
