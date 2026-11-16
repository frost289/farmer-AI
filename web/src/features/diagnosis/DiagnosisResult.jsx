import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
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
  if (!diagnosis) return null;
  if (diagnosis.status === 'failed') {
    return (
      <Alert type="error" title="We could not finish the check">
        {messageForCode(diagnosis.error_code)}
      </Alert>
    );
  }
  if (diagnosis.status !== 'completed') {
    if (timedOut) {
      return <Alert type="warning">This is taking longer than usual. Check back in "Recent checks" in a few minutes.</Alert>;
    }
    return <Loader label="Checking your crop..." />;
  }

  const r = diagnosis.result;
  const t = r.treatment || {};
  const isHealthy = r.type === 'healthy';
  const isUnknown = r.type === 'unknown';

  return (
    <section className="card space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold">
          {isHealthy ? 'Your crop looks healthy' : isUnknown ? 'Advice for the symptoms you described' : humanize(r.name)}
        </h3>
        {r.severity && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${SEVERITY[r.severity]}`}>
            {humanize(r.severity)} severity
          </span>
        )}
      </div>
      {!isUnknown && r.confidence != null && (
        <p className="text-sm text-gray-600">Confidence: {percent(r.confidence)}</p>
      )}
      {r.severity_pct != null && (
        <div>
          <div className="h-2 w-full rounded bg-gray-200">
            <div className="h-2 rounded bg-red-500" style={{ width: `${Math.min(100, r.severity_pct)}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">About {Math.round(r.severity_pct)}% of the leaf affected</p>
        </div>
      )}
      {r.low_confidence && (
        <Alert type="warning">We are not very sure. Please consult an extension officer to confirm.</Alert>
      )}
      <TreatmentList title="Organic treatment" items={t.organic} />
      <TreatmentList title="Chemical treatment" items={t.chemical} />
      <TreatmentList title="How to prevent it" items={t.prevention} />
      <TreatmentList title={isUnknown ? 'Advice' : 'Warnings'} items={t.warnings} />
    </section>
  );
}
