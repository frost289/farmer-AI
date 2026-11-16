import { useMemo } from 'react';
import EmptyState from '../common/EmptyState.jsx';

/** District bubbles sized by case count. (A real map can replace this later; same props.) */
export default function OutbreakMap({ outbreaks = [] }) {
  const byDistrict = useMemo(() => {
    const totals = {};
    outbreaks.forEach((o) => {
      totals[o.district] = (totals[o.district] || 0) + o.case_count;
    });
    return Object.entries(totals)
      .map(([district, cases]) => ({ district, cases }))
      .sort((a, b) => b.cases - a.cases);
  }, [outbreaks]);

  if (!byDistrict.length) return <EmptyState title="No outbreaks reported" message="No cases in this period." />;
  const max = byDistrict[0].cases;

  return (
    <div className="flex flex-wrap gap-3" aria-label="Cases by district">
      {byDistrict.map(({ district, cases }) => {
        const size = 56 + Math.round((cases / max) * 56);
        return (
          <div key={district} className="flex flex-col items-center text-center" style={{ width: 96 }}>
            <div
              className="flex items-center justify-center rounded-full bg-red-500/80 font-bold text-white"
              style={{ width: size, height: size }}
              title={`${district}: ${cases} cases`}
            >
              {cases}
            </div>
            <span className="mt-1 text-xs text-gray-700">{district}</span>
          </div>
        );
      })}
    </div>
  );
}
