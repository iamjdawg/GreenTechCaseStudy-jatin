import { useState, useEffect, useCallback } from 'react'
import { getDashboard, getWasteData, getReorderSuggestions, getSustainability } from '../api/client'

export function useAnalytics() {
  const [stats, setStats] = useState(null)
  const [waste, setWaste] = useState(null)
  const [reorder, setReorder] = useState([])
  const [sustainability, setSustainability] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, w, r, su] = await Promise.all([
        getDashboard(), getWasteData(), getReorderSuggestions(), getSustainability(),
      ])
      setStats(s.data)
      setWaste(w.data)
      setReorder(r.data)
      setSustainability(su.data)
    } catch (e) { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { stats, waste, reorder, sustainability, loading, refresh: fetchAll }
}
