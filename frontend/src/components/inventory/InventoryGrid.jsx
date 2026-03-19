import InventoryCard from './InventoryCard'

export default function InventoryGrid({ items, onUse, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">No items found. Use the Magic Bar above to add inventory!</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <InventoryCard
          key={item.id}
          item={item}
          onUse={onUse}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
