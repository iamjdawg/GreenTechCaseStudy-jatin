import { useState } from 'react'

export default function UseItemModal({ open, item, onClose, onSubmit }) {
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('consumed')

  if (!open || !item) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(item.id, Number(qty), reason)
    setQty(1)
    setReason('consumed')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-bold mb-1">Use: {item.name}</h2>
        <p className="text-xs text-gray-500 mb-4">Available: {item.quantity} {item.unit}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity to use</label>
            <input type="number" required min="0.1" max={item.quantity} step="0.1" value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none">
              <option value="consumed">Consumed</option>
              <option value="expired">Expired / Thrown out</option>
              <option value="damaged">Damaged</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 text-sm rounded-lg bg-leaf-600 text-white hover:bg-leaf-700 font-medium">Log Usage</button>
          </div>
        </form>
      </div>
    </div>
  )
}
