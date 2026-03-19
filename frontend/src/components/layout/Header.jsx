export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌿</span>
        <div>
          <h1 className="text-lg font-bold text-leaf-800">Bean & Leaf Cafe</h1>
          <p className="text-xs text-gray-500">Smart Inventory Assistant</p>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </header>
  )
}
