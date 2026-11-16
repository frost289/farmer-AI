import { Link } from 'react-router-dom';
import { humanize } from '../../utils/formatters.js';

export default function FarmCard({ farm }) {
  return (
    <Link to={`/farms/${farm.id}`} className="card block transition hover:border-brand-500">
      <h3 className="text-lg font-semibold">{farm.name}</h3>
      <p className="text-sm text-gray-600">{farm.district}</p>
      <p className="mt-1 text-sm text-gray-500">
        {humanize(farm.soil_type)} soil{farm.size_ha ? ` · ${farm.size_ha} ha` : ''}
      </p>
      {farm.lat == null && <p className="mt-2 text-xs text-amber-700">Add location to get weather advice</p>}
    </Link>
  );
}
