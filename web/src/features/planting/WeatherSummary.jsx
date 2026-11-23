import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { errorMessage, humanize } from '../../utils/formatters.js';

const RAIN_TRACE_MM = 1;
const HEAVY_RAIN_MM = 20;
const HIGH_TEMPERATURE_C = 35;

function buildWeatherWatch(forecast) {
  const nextThreeDays = forecast.slice(0, 3);
  const watches = [];

  if (nextThreeDays.length === 3 && nextThreeDays.every((day) => day.rain_mm < RAIN_TRACE_MM)) {
    watches.push('dry_spell');
  }
  if (forecast.some((day) => day.rain_mm >= HEAVY_RAIN_MM)) watches.push('heavy_rain');
  if (forecast.some((day) => day.temp_c >= HIGH_TEMPERATURE_C)) watches.push('high_heat');

  return watches;
}

export default function WeatherSummary({ weather, plantings = [], isLoading, error }) {
  const { t } = useLanguage();
  if (isLoading) return <Loader label={t('planting.forecast_loading')} />;
  if (error) return <Alert type="warning">{errorMessage(error)}</Alert>;
  if (!weather) return null;

  const forecast = weather.forecast_7d || [];
  const updatedAt = weather.fetched_at ? new Date(weather.fetched_at).toLocaleString() : null;
  const rainfallTotal = forecast.reduce((total, day) => total + day.rain_mm, 0);
  const watches = buildWeatherWatch(forecast);
  const growingCrops = plantings.filter((planting) => !['harvested', 'failed'].includes(planting.status));

  return (
    <section className="card space-y-3">
      <div>
        <h3 className="font-semibold">{t('planting.forecast')}</h3>
        <p className="text-xs text-gray-500">
          {t('planting.weather_source')}: {weather.source || 'Weather provider'}
          {updatedAt ? ` · ${t('planting.updated')}: ${updatedAt}` : ''}
        </p>
      </div>
      {weather.stale && (
        <Alert type="warning">{t('planting.stale_warning')}</Alert>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {forecast.map((day) => (
          <div key={day.date} className="min-w-[72px] rounded-lg bg-blue-50 p-2 text-center text-sm">
            <p className="text-xs text-gray-600">
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
            </p>
            <p className="font-semibold">{day.rain_mm} mm</p>
            <p>{Math.round(day.temp_c)}&deg;C</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <p className="font-medium">{t('planting.rain_total')}: {rainfallTotal.toFixed(1)} mm</p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">{t('planting.weather_watch')}</h4>
        {watches.length ? watches.map((watch) => (
          <Alert key={watch} type="warning">{t(`planting.${watch}`)}</Alert>
        )) : (
          <p className="text-sm text-gray-600">{t('planting.no_weather_watch')}</p>
        )}
        <p className="text-xs text-gray-500">{t('planting.general_guidance_note')}</p>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{t('planting.crops_on_farm')}</h4>
        {growingCrops.length ? (
          <div className="flex flex-wrap gap-2">
            {growingCrops.map((planting) => (
              <span key={planting.id} className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-800">
                {humanize(planting.crop)} · {humanize(planting.status)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">{t('planting.no_crops_recorded')}</p>
        )}
      </div>
    </section>
  );
}
