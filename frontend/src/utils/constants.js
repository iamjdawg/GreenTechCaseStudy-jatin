export const CATEGORY_ICONS = {
  Dairy: '🥛', Produce: '🥬', Meat: '🥩', Bakery: '🍞',
  Beverages: '🧃', Coffee: '☕', Condiments: '🫙',
  'Dry Goods': '🌾', Frozen: '🧊', Other: '📦',
}

export const STATUS_COLORS = {
  active: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  low: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  expired: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  finished: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' },
}

export const URGENCY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  ok: 'text-green-600 bg-green-50 border-green-200',
}
