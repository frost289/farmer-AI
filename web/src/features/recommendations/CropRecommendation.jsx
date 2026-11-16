import EmptyState from '../../components/common/EmptyState.jsx';
import { humanize } from '../../utils/formatters.js';

export default function CropRecommendation({ recommendations = [] }) {
  if (!recommendations.length) return <EmptyState title="No recommendations yet" />;
  return (
    <ol className="space-y-3">
      {recommendations.map((r, i) => (
        <li key={`${r.crop}-${r.variety || i}`} className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {i + 1}. {humanize(r.crop)}
              {r.variety ? ` (${r.variety})` : ''}
            </h3>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
              {Math.round(r.score * 100)}% match
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{r.reason}</p>
        </li>
      ))}
    </ol>
  );
}
