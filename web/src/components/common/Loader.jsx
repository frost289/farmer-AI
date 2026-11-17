import { Loader2 } from 'lucide-react';

export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  const spinner = (
    <div className="muted flex flex-col items-center gap-3 py-10" role="status">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="text-lg">{label}</span>
    </div>
  );
  return fullScreen ? <div className="flex min-h-screen items-center justify-center">{spinner}</div> : spinner;
}
