import EmptyState from '../../components/common/EmptyState.jsx';
import { humanize } from '../../utils/formatters.js';

export default function OutbreakTable({ rows = [] }) {
  if (!rows.length) return <EmptyState title="No outbreaks found" message="Try a different district or date range." />;
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-3">Disease / pest</th>
            <th className="p-3">Crop</th>
            <th className="p-3">District</th>
            <th className="p-3">Cases</th>
            <th className="p-3">Week of</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3 font-medium">{humanize(r.disease)}</td>
              <td className="p-3">{humanize(r.crop)}</td>
              <td className="p-3">{r.district}</td>
              <td className="p-3">{r.case_count}</td>
              <td className="p-3">{r.period_start}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
