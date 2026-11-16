export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
      <p className="font-semibold text-gray-700">{title}</p>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
