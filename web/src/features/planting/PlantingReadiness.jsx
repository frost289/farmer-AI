import { useLanguage } from '../../hooks/useAuth.js';
import { percent } from '../../utils/formatters.js';

const VERDICT_KEYS = {
  plant: 'planting.plant_now',
  wait: 'planting.wait',
  not_recommended: 'planting.not_recommended',
};

const VERDICT_STYLE = {
  plant: 'border-green-300 bg-green-50 text-green-900',
  wait: 'border-amber-300 bg-amber-50 text-amber-900',
  not_recommended: 'border-red-300 bg-red-50 text-red-900',
};

export default function PlantingReadiness({ readiness }) {
  const { t } = useLanguage();
  if (!readiness) return null;
  const verdict = Object.hasOwn(VERDICT_KEYS, readiness.verdict) ? readiness.verdict : 'wait';
  return (
    <section className={`rounded-xl border p-4 ${VERDICT_STYLE[verdict]}`} aria-live="polite">
      <p className="text-2xl font-bold">{t(VERDICT_KEYS[verdict])}</p>
      <p className="mt-2">{readiness.reason}</p>
      <ul className="mt-2 text-sm">
        {readiness.rain_onset_date && <li>{t('planting.rain_from')}: {readiness.rain_onset_date}</li>}
        {readiness.soil_moisture && <li>{t('planting.soil_moisture')}: {t(`soil.${readiness.soil_moisture}`)}</li>}
        <li>{t('diagnosis.confidence')}: {percent(readiness.confidence)}</li>
      </ul>
    </section>
  );
}
