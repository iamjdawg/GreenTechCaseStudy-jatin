import { useAnalytics } from '../../hooks/useAnalytics'
import WasteChart from './WasteChart'
import SustainScore from './SustainScore'
import ReorderNudges from '../dashboard/ReorderNudges'
import LoadingSpinner from '../common/LoadingSpinner'

export default function Analytics() {
  const { waste, sustainability, reorder, loading } = useAnalytics()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Analytics</h2>
        <p className="text-sm text-gray-500">Waste reduction insights and sustainability tracking</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SustainScore data={sustainability} />
        <WasteChart waste={waste} />
      </div>
      <ReorderNudges suggestions={reorder} />
    </div>
  )
}
