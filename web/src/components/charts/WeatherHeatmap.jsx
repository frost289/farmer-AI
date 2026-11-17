import { CloudRain } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import WeatherIcon from '../common/WeatherIcon.jsx';

/** Tiles per district, shaded by 7-day rainfall. */
export default function WeatherHeatmap({ data = [] }) {
  if (!data.length) return <EmptyState icon={CloudRain} title="No weather data" message="Weather is not available right now." />;
  const maxRain = Math.max(...data.map((d) => d.rain_mm), 1);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {data.map((d) => (
        <div key={d.district} className="rounded-xl p-3 text-base text-slate-900" style={{ backgroundColor: `rgba(59, 130, 246, ${0.12 + 0.5 * (d.rain_mm / maxRain)})` }}>
          <div className="flex items-center justify-between">
            <p className="font-bold">{d.district}</p>
            <WeatherIcon rainMm={d.rain_mm / 7} tempC={d.temp_c} className="h-6 w-6" />
          </div>
          <p>{d.rain_mm} mm rain</p>
          <p>{d.temp_c}&deg;C average</p>
        </div>
      ))}
    </div>
  );
}
