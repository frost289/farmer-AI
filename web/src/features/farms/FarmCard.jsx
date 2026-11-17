import { ChevronRight, MapPin, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { humanize } from '../../utils/formatters.js';

export default function FarmCard({ farm }) {
  return (
    <Link
      to={`/farms/${farm.id}`}
      className="card flex min-h-[110px] items-center justify-between gap-3 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md dark:hover:border-emerald-400"
    >
      <div className="min-w-0">
        <h3 className="truncate text-2xl font-extrabold">{farm.name}</h3>
        <p className="mt-1 flex items-center gap-2 text-lg font-medium">
          <MapPin className="h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          {farm.district}
        </p>
        <p className="muted mt-0.5 flex items-center gap-2 text-base">
          <Mountain className="h-6 w-6 shrink-0" aria-hidden="true" />
          {humanize(farm.soil_type)} soil{farm.size_ha ? `, ${farm.size_ha} ha` : ''}
        </p>
        {farm.lat == null && (
          <p className="mt-2 text-base font-semibold text-amber-800 dark:text-amber-300">Add the location to get weather advice</p>
        )}
      </div>
      <ChevronRight className="h-8 w-8 shrink-0 text-slate-400" aria-hidden="true" />
    </Link>
  );
}
