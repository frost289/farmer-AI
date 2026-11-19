import EmptyState from '../../components/common/EmptyState.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { humanize } from '../../utils/formatters.js';

export default function CropRecommendation({ recommendations = [] }) {
  const { t, language } = useLanguage();
  if (!recommendations.length) return <EmptyState title={t('recommendations.none')} />;
  return (
    <>
    {language === 'ny' && <p className="mb-3 text-sm text-gray-600">{t('ai.english_fallback')}</p>}
    <ol className="space-y-3">
      {recommendations.map((r, i) => (
        <li key={`${r.crop}-${r.variety || i}`} className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {i + 1}. {humanize(r.crop)}
              {r.variety ? ` (${r.variety})` : ''}
            </h3>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
              {Math.round(r.score * 100)}% {t('recommendations.match')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{r.reason}</p>
        </li>
      ))}
    </ol>
    </>
  );
}
