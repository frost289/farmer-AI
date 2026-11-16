import EmptyState from '../common/EmptyState.jsx';

/** Tiles per district, shaded by 7-day rainfall. */
export default function WeatherHeatmap({ data = [] }) {
  if (!data.length) return <EmptyState title="No weather data" message="Weather is not available right now." />;
  const maxRain = Math.max(...data.map((d) => d.rain_mm), 1);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {data.map((d) => (
        <div
          key={d.district}
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: `rgba(37, 99, 235, ${0.1 + 0.6 * (d.rain_mm / maxRain)})` }}
        >
          <p className="font-semibold">{d.district}</p>
          <p>{d.rain_mm} mm rain</p>
          <p>{d.temp_c}&deg;C avg</p>
        </div>
      ))}
    </div>
  );
}
