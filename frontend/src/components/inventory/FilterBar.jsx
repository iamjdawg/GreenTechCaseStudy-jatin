export default function FilterBar({ filters, setFilters, categories }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search items..."
        value={filters.search}
        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-48 focus:ring-2 focus:ring-leaf-400 focus:border-leaf-400 outline-none"
      />
      <select
        value={filters.category_id || ''}
        onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value ? Number(e.target.value) : null }))}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
        ))}
      </select>
      <select
        value={filters.status || ''}
        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value || null }))}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="low">Low / Expiring</option>
        <option value="expired">Expired</option>
        <option value="finished">Finished</option>
      </select>
      <select
        value={filters.sort_by}
        onChange={(e) => setFilters(f => ({ ...f, sort_by: e.target.value }))}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none"
      >
        <option value="expiry_date">Sort: Expiry Date</option>
        <option value="name">Sort: Name</option>
        <option value="quantity">Sort: Quantity</option>
        <option value="added_date">Sort: Recently Added</option>
      </select>
    </div>
  )
}
