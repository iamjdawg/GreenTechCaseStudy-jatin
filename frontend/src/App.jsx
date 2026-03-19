import { useState, useEffect } from 'react'
import AppShell from './components/layout/AppShell'
import Dashboard from './components/dashboard/Dashboard'
import Analytics from './components/analytics/Analytics'
import MagicBar from './components/inventory/MagicBar'
import PhotoUploadButton from './components/inventory/PhotoUploadButton'
import InventoryGrid from './components/inventory/InventoryGrid'
import FilterBar from './components/inventory/FilterBar'
import ItemFormModal from './components/inventory/ItemFormModal'
import UseItemModal from './components/inventory/UseItemModal'
import ConfirmDialog from './components/common/ConfirmDialog'
import Toast, { showToast } from './components/common/Toast'
import LoadingSpinner from './components/common/LoadingSpinner'
import { useInventory } from './hooks/useInventory'
import { seedDatabase } from './api/client'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const { items, categories, loading, filters, setFilters, fetchItems, addItem, editItem, removeItem, useItem } = useInventory()

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [useOpen, setUseOpen] = useState(false)
  const [usingItem, setUsingItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [seeding, setSeeding] = useState(false)

  // Seed on first load if no items
  useEffect(() => {
    if (!loading && items.length === 0 && !seeding) {
      setSeeding(true)
      seedDatabase()
        .then(() => fetchItems())
        .catch(() => {})
        .finally(() => setSeeding(false))
    }
  }, [loading, items.length])

  const handleMagicBarParsed = (parsed) => {
    setEditingItem(parsed)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data) => {
    try {
      if (editingItem?.id) {
        await editItem(editingItem.id, data)
        showToast('Item updated!', 'success')
      } else {
        await addItem(data)
        showToast('Item added!', 'success')
      }
      setFormOpen(false)
      setEditingItem(null)
    } catch {
      showToast('Failed to save item', 'error')
    }
  }

  const handleUse = (item) => {
    setUsingItem(item)
    setUseOpen(true)
  }

  const handleUseSubmit = async (itemId, qty, reason) => {
    try {
      await useItem(itemId, qty, reason)
      showToast('Usage logged!', 'success')
      setUseOpen(false)
      setUsingItem(null)
    } catch {
      showToast('Failed to log usage', 'error')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await removeItem(confirmDelete.id)
      showToast('Item deleted', 'info')
    } catch {
      showToast('Failed to delete', 'error')
    }
    setConfirmDelete(null)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />
      case 'analytics':
        return <Analytics />
      case 'inventory':
      default:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Inventory</h2>
              <p className="text-sm text-gray-500">Manage your cafe stock with natural language</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <MagicBar onItemParsed={handleMagicBarParsed} categories={categories} />
              </div>
              <PhotoUploadButton onItemParsed={handleMagicBarParsed} categories={categories} />
            </div>
            <div className="flex items-center justify-between">
              <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
              <button
                onClick={() => { setEditingItem(null); setFormOpen(true) }}
                className="px-4 py-2 text-sm bg-leaf-600 text-white rounded-lg hover:bg-leaf-700 font-medium whitespace-nowrap ml-4"
              >
                + Add Item
              </button>
            </div>
            {loading ? <LoadingSpinner /> : (
              <InventoryGrid items={items} onUse={handleUse} onEdit={handleEdit} onDelete={(item) => setConfirmDelete(item)} />
            )}
          </div>
        )
    }
  }

  return (
    <>
      <AppShell activePage={page} onNavigate={setPage}>
        {renderPage()}
      </AppShell>
      <ItemFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onSubmit={handleFormSubmit}
        item={editingItem}
        categories={categories}
      />
      <UseItemModal
        open={useOpen}
        item={usingItem}
        onClose={() => { setUseOpen(false); setUsingItem(null) }}
        onSubmit={handleUseSubmit}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      <Toast />
    </>
  )
}
