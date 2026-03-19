import { useState, useEffect } from 'react'

export default function ItemFormModal({ open, onClose, onSubmit, item, categories }) {
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'units', category_id: '', cost_per_unit: 0, expiry_date: '', notes: '' })

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        quantity: item.quantity ?? 1,
        unit: item.unit || 'units',
        category_id: item.category_id || '',
        cost_per_unit: item.cost_per_unit || 0,
        expiry_date: item.expiry_date || '',
        notes: item.notes || '',
      })
    } else {
      setForm({ name: '', quantity: 1, unit: 'units', category_id: '', cost_per_unit: 0, expiry_date: '', notes: '' })
    }
  }, [item, open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      cost_per_unit: Number(form.cost_per_unit),
      category_id: form.category_id ? Number(form.category_id) : null,
      expiry_date: form.expiry_date || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{item?.id ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
              <input type="number" required min="0" step="0.1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none">
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost per unit (₹)</label>
              <input type="number" min="0" step="0.01" value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 text-sm rounded-lg bg-leaf-600 text-white hover:bg-leaf-700 font-medium">
              {item?.id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
