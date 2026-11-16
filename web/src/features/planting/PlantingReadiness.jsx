import { humanize, percent } from '../../utils/formatters.js';

const VERDICT = {
  plant: { text: 'You can plant now', style: 'border-green-300 bg-green-50 text-green-900', icon: '✅' },
  wait: { text: 'Wait before planting', style: 'border-amber-300 bg-amber-50 text-amber-900', icon: '⏳' },
  not_recommended: { text: 'Planting is not recommended', style: 'border-red-300 bg-red-50 text-red-900', icon: '⛔' },
};

export default function PlantingReadiness({ readiness }) {
  if (!readiness) return null;
  const v = VERDICT[readiness.verdict] || VERDICT.wait;
  return (
    <section className={`rounded-xl border p-4 ${v.style}`} aria-live="polite">
      <p className="text-2xl font-bold">
        <span aria-hidden="true">{v.icon} </span>
        {v.text}
      </p>
      <p className="mt-2">{readiness.reason}</p>
      <ul className="mt-2 text-sm">
        {readiness.rain_onset_date && <li>Expected rain from: {readiness.rain_onset_date}</li>}
        {readiness.soil_moisture && <li>Soil moisture: {humanize(readiness.soil_moisture)}</li>}
        <li>Confidence: {percent(readiness.confidence)}</li>
      </ul>
    </section>
  );
}
