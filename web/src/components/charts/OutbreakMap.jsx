import { ShieldCheck } from 'lucide-react';
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

  if (!byDistrict.length) return <EmptyState icon={ShieldCheck} title="No outbreaks reported" message="No cases in this period." />;
  const max = byDistrict[0].cases;

  return (
    <div className="flex flex-wrap gap-4" aria-label="Cases by district">
      {byDistrict.map(({ district, cases }) => {
        const size = 60 + Math.round((cases / max) * 56);
        return (
          <div key={district} className="flex w-24 flex-col items-center text-center">
            <div className="flex items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white" style={{ width: size, height: size }} title={`${district}: ${cases} cases`}>
              {cases}
            </div>
            <span className="mt-1 text-sm text-gray-800 dark:text-slate-100">{district}</span>
          </div>
        );
      })}
    </div>
  );
}
