import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import { errorMessage } from '../../utils/formatters.js';

export default function WeatherSummary({ weather, isLoading, error }) {
  if (isLoading) return <Loader label="Getting the forecast..." />;
  if (error) return <Alert type="warning">{errorMessage(error)}</Alert>;
  if (!weather) return null;
  return (
    <section className="card">
      <h3 className="mb-2 font-semibold">7-day forecast</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weather.forecast_7d.map((d) => (
          <div key={d.date} className="min-w-[72px] rounded-lg bg-blue-50 p-2 text-center text-sm">
            <p className="text-xs text-gray-600">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</p>
            <p className="font-semibold">{d.rain_mm} mm</p>
            <p>{Math.round(d.temp_c)}&deg;C</p>
          </div>
        ))}
      </div>
    </section>
  );
}
