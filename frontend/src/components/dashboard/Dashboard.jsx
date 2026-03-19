import { useState, useEffect } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { getExpiringItems, getRecipes } from '../../api/client'
import StatsCards from './StatsCards'
import WasteOMeter from './WasteOMeter'
import ExpiryAlerts from './ExpiryAlerts'
import ReorderNudges from './ReorderNudges'
import RecipeModal from './RecipeModal'
import LoadingSpinner from '../common/LoadingSpinner'
import { showToast } from '../common/Toast'

export default function Dashboard() {
  const { stats, waste, reorder, loading } = useAnalytics()
  const [expiringItems, setExpiringItems] = useState([])
  const [recipeModalOpen, setRecipeModalOpen] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(false)

  useEffect(() => {
    getExpiringItems(7).then(res => setExpiringItems(res.data)).catch(() => {})
  }, [])

  const handleRecipeClick = async (items) => {
    setRecipeModalOpen(true)
    setRecipesLoading(true)
    setRecipes([])
    try {
      const payload = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiry_date,
      }))
      const res = await getRecipes(payload)
      setRecipes(res.data.recipes || [])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate recipes'
      showToast(msg, 'error')
    } finally {
      setRecipesLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of your cafe inventory health</p>
      </div>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WasteOMeter waste={waste} />
        <ExpiryAlerts items={expiringItems} onRecipeClick={handleRecipeClick} />
      </div>
      <ReorderNudges suggestions={reorder} />
      <RecipeModal
        open={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        recipes={recipes}
        loading={recipesLoading}
      />
    </div>
  )
}
