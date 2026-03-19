export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <p className="text-red-700 text-sm">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 ml-4">&times;</button>
      )}
    </div>
  )
}
