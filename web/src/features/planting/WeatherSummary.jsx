import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { errorMessage } from '../../utils/formatters.js';

export default function WeatherSummary({ weather, isLoading, error }) {
  const { t } = useLanguage();
  if (isLoading) return <Loader label={t('planting.forecast_loading')} />;
  if (error) return <Alert type="warning">{errorMessage(error)}</Alert>;
  if (!weather) return null;
  const updatedAt = weather.fetched_at
    ? new Date(weather.fetched_at).toLocaleString()
    : null;

  return (
    <section className="card">
      <h3 className="mb-1 font-semibold">{t('planting.forecast')}</h3>
      <p className="mb-3 text-xs text-gray-500">
        Source: {weather.source || 'Weather provider'}
        {updatedAt ? ` · Updated: ${updatedAt}` : ''}
      </p>
      {weather.stale && (
        <Alert type="warning">
          Showing the last saved forecast because fresh weather data is temporarily unavailable.
        </Alert>
      )}
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
