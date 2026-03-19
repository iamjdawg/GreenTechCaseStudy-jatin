export default function SustainScore({ data }) {
  if (!data) return null

  const gradeColors = {
    A: 'text-green-600 bg-green-50 border-green-200',
    B: 'text-lime-600 bg-lime-50 border-lime-200',
    C: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    D: 'text-orange-600 bg-orange-50 border-orange-200',
    F: 'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Sustainability Score</h3>
      <div className="flex items-center gap-6 mb-4">
        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${gradeColors[data.grade]}`}>
          <span className="text-3xl font-bold">{data.grade}</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{data.score}<span className="text-sm text-gray-400">/100</span></p>
          <div className="mt-1 space-y-0.5 text-xs text-gray-500">
            <p>Waste ratio: {data.waste_ratio}%</p>
            <p>Expiry mgmt: {data.expiry_management}%</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-leaf-500 mt-0.5">&#8226;</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
