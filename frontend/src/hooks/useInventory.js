import { useState, useEffect, useCallback } from 'react'
import { getItems, createItem, updateItem, deleteItem, logUsage, getCategories, getExpiringItems } from '../api/client'

export function useInventory() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ search: '', category_id: null, status: null, sort_by: 'expiry_date' })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.status) params.status = filters.status
      params.sort_by = filters.sort_by
      const res = await getItems(params)
      setItems(res.data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch (e) { /* ignore */ }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { fetchCategories() }, [fetchCategories])

  const addItem = async (data) => {
    const res = await createItem(data)
    await fetchItems()
    return res.data
  }

  const editItem = async (id, data) => {
    const res = await updateItem(id, data)
    await fetchItems()
    return res.data
  }

  const removeItem = async (id) => {
    await deleteItem(id)
    await fetchItems()
  }

  const useItem = async (itemId, quantity, reason = 'consumed') => {
    await logUsage({ item_id: itemId, quantity_used: quantity, reason })
    await fetchItems()
  }

  return { items, categories, loading, error, filters, setFilters, fetchItems, addItem, editItem, removeItem, useItem }
}
