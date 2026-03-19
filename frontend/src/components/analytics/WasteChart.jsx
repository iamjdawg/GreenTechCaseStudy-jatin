import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WasteChart({ waste }) {
  if (!waste || !waste.waste_by_category || waste.waste_by_category.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Waste by Category</h3>
        <p className="text-sm text-gray-400">No waste data for this period.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Waste by Category (₹)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={waste.waste_by_category}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
          <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Value']} />
          <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
