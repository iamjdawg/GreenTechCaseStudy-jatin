const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-56 bg-leaf-800 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-leaf-700">
        <div className="text-xl font-bold flex items-center gap-2">
          <span>☕</span> <span>B&L Cafe</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activePage === item.key
                ? 'bg-leaf-600 text-white font-medium'
                : 'text-leaf-200 hover:bg-leaf-700 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-leaf-700 text-xs text-leaf-300">
        Green-Tech Inventory v1.0
      </div>
    </aside>
  )
}
