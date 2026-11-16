const STYLES = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export default function Alert({ type = 'info', title, children, className = '' }) {
  if (!children && !title) return null;
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${STYLES[type]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div>{children}</div>}
    </div>
  );
}
