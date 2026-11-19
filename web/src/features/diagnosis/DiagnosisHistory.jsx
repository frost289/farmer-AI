import { useQuery } from '@tanstack/react-query';
import EmptyState from '../../components/common/EmptyState.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { listDiagnoses } from '../../services/diagnosisService.js';
import { formatDateTime, humanize } from '../../utils/formatters.js';

const STATUS_STYLE = {
  completed: 'text-green-700',
  failed: 'text-red-700',
  pending: 'text-gray-500',
  processing: 'text-gray-500',
};

export default function DiagnosisHistory({ farmId, limit = 5, onSelect }) {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['diagnoses', { farmId, limit }],
    queryFn: () => listDiagnoses({ farm_id: farmId || undefined, limit }),
  });

  if (isLoading) return <Loader />;
  if (!data?.length) return <EmptyState title={t('diagnosis.no_checks')} message={t('diagnosis.no_checks_message')} />;

  return (
    <ul className="divide-y rounded-xl border bg-white">
      {data.map((d) => (
        <li key={d.id}>
          <button onClick={() => onSelect?.(d.id)} className="flex min-h-[56px] w-full items-center justify-between px-4 py-2 text-left">
            <span>
              <span className="font-medium">
                {d.status === 'completed' ? humanize(d.result?.name) : t(`diagnosis.status.${d.status}`)}
              </span>
              <span className="block text-xs text-gray-500">
                {humanize(d.crop) || t('common.crop_not_set')} · {formatDateTime(d.created_at)}
              </span>
            </span>
            <span className={`text-sm font-semibold ${STATUS_STYLE[d.status]}`}>{t(`diagnosis.status.${d.status}`)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
