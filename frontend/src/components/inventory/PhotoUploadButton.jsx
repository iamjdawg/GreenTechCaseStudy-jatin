import { useState, useRef } from 'react'
import { classifyImage } from '../../api/client'
import { showToast } from '../common/Toast'

export default function PhotoUploadButton({ onItemParsed, categories }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const handleClick = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const url = URL.createObjectURL(file)
    setPreview(url)
    setLoading(true)

    try {
      const res = await classifyImage(file)
      const data = res.data

      // Map category name to id
      let category_id = null
      if (data.category && categories.length > 0) {
        const cat = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase())
        if (cat) category_id = cat.id
      }

      onItemParsed({
        name: data.name || 'Unknown Product',
        quantity: 1,
        unit: data.unit || 'units',
        category_id,
        expiry_date: '',
        cost_per_unit: 0,
        notes: data.description || '',
        _method: data.method,
      })

      showToast(`Classified via ${data.method}`, 'success')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to classify image'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
      setPreview(null)
      URL.revokeObjectURL(url)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-leaf-400 hover:bg-leaf-50 transition-colors disabled:opacity-50"
        title="Upload product photo for AI classification"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-leaf-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        )}
      </button>
      {preview && loading && (
        <div className="absolute top-14 right-0 z-10 w-32 h-32 rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <img src={preview} alt="Uploading..." className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
