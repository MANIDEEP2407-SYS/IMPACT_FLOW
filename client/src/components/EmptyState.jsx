export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">📭</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
