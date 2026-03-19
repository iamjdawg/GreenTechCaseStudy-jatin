export default function WasteOMeter({ waste }) {
  if (!waste) return null
  const score = waste.waste_score
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  let color = '#22c55e'  // green
  if (score > 30) color = '#eab308' // yellow
  if (score > 60) color = '#ef4444' // red

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Waste-O-Meter</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={circumference - progress}
              strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
            <span className="text-xs text-gray-400">waste</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600"><span className="font-medium">{waste.total_wasted_units}</span> units wasted</p>
          <p className="text-gray-600"><span className="font-medium text-red-600">₹{waste.total_wasted_value.toFixed(2)}</span> lost value</p>
          <p className="text-gray-400 text-xs">Last {waste.period_days} days</p>
        </div>
      </div>
    </div>
  )
}
