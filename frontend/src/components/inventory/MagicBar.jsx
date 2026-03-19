import { useState } from 'react'
import { parseText } from '../../api/client'
import { showToast } from '../common/Toast'

export default function MagicBar({ onItemParsed, categories }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await parseText(text.trim())
      const parsed = res.data
      // Find category_id from name
      let category_id = null
      if (parsed.category && categories.length > 0) {
        const cat = categories.find(c => c.name.toLowerCase() === parsed.category.toLowerCase())
        if (cat) category_id = cat.id
      }
      onItemParsed({
        name: parsed.name || text.trim(),
        quantity: parsed.quantity || 1,
        unit: parsed.unit || 'units',
        category_id,
        expiry_date: parsed.expiry_date || '',
        cost_per_unit: 0,
        notes: '',
        _method: parsed.method,
      })
      showToast(`Parsed via ${parsed.method}`, 'success')
      setText('')
    } catch {
      showToast('Failed to parse input', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-leaf-400 focus-within:border-leaf-400">
        <span className="pl-4 text-xl">✨</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try: "5 bags of coffee, expires June 15" or "12 liters of milk best before next week"'
          className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-5 py-3.5 bg-leaf-600 text-white text-sm font-medium hover:bg-leaf-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Parsing...' : 'Add Item'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 ml-1">Magic Bar — type naturally, AI parses it for you</p>
    </form>
  )
}
