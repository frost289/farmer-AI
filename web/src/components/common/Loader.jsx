export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-2 py-8 text-gray-500" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
  return fullScreen ? <div className="flex min-h-screen items-center justify-center">{spinner}</div> : spinner;
}
