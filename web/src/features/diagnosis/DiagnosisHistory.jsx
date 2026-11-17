import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, History, XCircle } from 'lucide-react';
import CropIcon from '../../components/common/CropIcon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Loader from '../../components/common/Loader.jsx';
import { listDiagnoses } from '../../services/diagnosisService.js';
import { formatDateTime, humanize } from '../../utils/formatters.js';

const STATUS = {
  completed: { icon: CheckCircle2, cls: 'text-emerald-700 dark:text-emerald-400', text: 'Done' },
  failed: { icon: XCircle, cls: 'text-red-700 dark:text-red-400', text: 'Failed' },
  pending: { icon: Clock, cls: 'text-slate-600 dark:text-slate-300', text: 'Waiting' },
  processing: { icon: Clock, cls: 'text-slate-600 dark:text-slate-300', text: 'Checking' },
};

export default function DiagnosisHistory({ farmId, limit = 5, onSelect }) {
  const { data, isLoading } = useQuery({
    queryKey: ['diagnoses', { farmId, limit }],
    queryFn: () => listDiagnoses({ farm_id: farmId || undefined, limit }),
  });

  if (isLoading) return <Loader />;
  if (!data?.length) {
    return <EmptyState icon={History} title="No crop checks yet" message="Your crop checks will show here." />;
  }

  return (
    <ul className="list-card">
      {data.map((d) => {
        const s = STATUS[d.status] || STATUS.pending;
        const Icon = s.icon;
        return (
          <li key={d.id}>
            <button
              onClick={() => onSelect?.(d.id)}
              className="flex min-h-[80px] w-full items-center gap-4 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-slate-700/50"
            >
              <CropIcon crop={d.crop} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-bold">
                  {d.status === 'completed' ? humanize(d.result?.name) : s.text}
                </span>
                <span className="muted block text-base">
                  {humanize(d.crop) || 'Crop not chosen'} - {formatDateTime(d.created_at)}
                </span>
              </span>
              <span className={`flex items-center gap-1 text-base font-semibold ${s.cls}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
                {s.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
