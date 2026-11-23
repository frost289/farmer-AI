import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { humanize, messageForCode, percent } from '../../utils/formatters.js';

const SEVERITY = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

function TreatmentList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <ul className="ml-5 list-disc text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DiagnosisResult({ diagnosis, timedOut = false }) {
  const { t } = useLanguage();
  if (!diagnosis) return null;
  if (diagnosis.status === 'failed') {
    return (
      <Alert type="error" title={t('diagnosis.failed_title')}>
        {messageForCode(diagnosis.error_code)}
      </Alert>
    );
  }
  if (diagnosis.status !== 'completed') {
    if (timedOut) return <Alert type="warning">{t('diagnosis.timed_out')}</Alert>;
    return <Loader label={t('diagnosis.checking')} />;
  }

  const r = diagnosis.result;
  const treatment = r.treatment || {};
  const isHealthy = r.type === 'healthy';
  const isUnknown = r.type === 'unknown';

  return (
    <section className="card space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold">
          {isHealthy ? t('diagnosis.healthy') : isUnknown ? t('diagnosis.unknown') : humanize(r.name)}
        </h3>
        {r.severity && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${SEVERITY[r.severity]}`}>
            {t(`severity.${r.severity}`)} {t('diagnosis.severity')}
          </span>
        )}
      </div>
      {!isUnknown && r.confidence !== null && r.confidence !== undefined && (
        <p className="text-sm text-gray-600">{t('diagnosis.confidence')}: {percent(r.confidence)}</p>
      )}
      {r.severity_pct !== null && r.severity_pct !== undefined && (
        <div>
          <div className="h-2 w-full rounded bg-gray-200">
            <div className="h-2 rounded bg-red-500" style={{ width: `${Math.min(100, r.severity_pct)}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">~{Math.round(r.severity_pct)}% {t('diagnosis.leaf_affected')}</p>
        </div>
      )}
      {r.low_confidence && <Alert type="warning">{t('diagnosis.low_confidence')}</Alert>}
      {treatment.language_fallback && <Alert type="info">{t('ai.english_fallback')}</Alert>}
      <TreatmentList title={t('diagnosis.organic')} items={treatment.organic} />
      <TreatmentList title={t('diagnosis.chemical')} items={treatment.chemical} />
      <TreatmentList title={t('diagnosis.prevention')} items={treatment.prevention} />
      <TreatmentList title={isUnknown ? t('diagnosis.advice') : t('diagnosis.warnings')} items={treatment.warnings} />
    </section>
  );
}
