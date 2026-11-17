import { CalendarDays } from 'lucide-react';
import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import WeatherIcon from '../../components/common/WeatherIcon.jsx';
import { errorMessage } from '../../utils/formatters.js';

const rainLabel = (mm) => (mm >= 8 ? 'Heavy rain' : mm >= 1 ? 'Light rain' : 'Dry');

export default function WeatherSummary({ weather, isLoading, error }) {
  if (isLoading) return <Loader label="Getting the weather..." />;
  if (error) return <Alert type="warning">{errorMessage(error)}</Alert>;
  if (!weather) return null;
  return (
    <section className="card space-y-4">
      <h3 className="section-title">
        <CalendarDays className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        Weather for the next 7 days
      </h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {weather.forecast_7d.map((d, i) => (
          <li
            key={d.date}
            className="animate-fade-up flex flex-col items-center gap-1 rounded-xl bg-stone-50 p-3 text-center dark:bg-slate-900"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-base font-bold">
              {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
            </span>
            <WeatherIcon rainMm={d.rain_mm} tempC={d.temp_c} className="h-10 w-10" />
            <span className="text-xl font-extrabold">{Math.round(d.temp_c)}&deg;C</span>
            <span className="muted text-sm">{rainLabel(d.rain_mm)}</span>
            <span className="muted text-sm">{d.rain_mm} mm</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
