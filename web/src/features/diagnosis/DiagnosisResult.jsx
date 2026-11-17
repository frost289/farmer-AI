import { AlertTriangle, CheckCircle2, FlaskConical, Leaf, ShieldAlert, ShieldCheck } from 'lucide-react';
import Alert from '../../components/common/Alert.jsx';
import Loader from '../../components/common/Loader.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Reveal from '../../components/common/Reveal.jsx';
import { humanize, messageForCode, percent } from '../../utils/formatters.js';

const SEVERITY = {
  low: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200', tone: 'emerald' },
  moderate: { icon: AlertTriangle, cls: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200', tone: 'amber' },
  high: { icon: ShieldAlert, cls: 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-200', tone: 'red' },
};

function TreatmentList({ title, items, icon: Icon }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl bg-stone-50 p-4 dark:bg-slate-900">
      <h4 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        {title}
      </h4>
      <ul className="mt-2 ml-6 list-disc space-y-1 text-lg">
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
      return <Alert type="warning">This is taking longer than usual. Look in "Recent checks" in a few minutes.</Alert>;
    }
    return <Loader label="Checking your crop..." />;
  }

  const r = diagnosis.result;
  const t = r.treatment || {};
  const isHealthy = r.type === 'healthy';
  const isUnknown = r.type === 'unknown';
  const sev = SEVERITY[r.severity];
  const SevIcon = sev?.icon;

  return (
    <Reveal>
      <section className="card space-y-5" aria-live="polite">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-extrabold">
            {isHealthy ? 'Your crop looks healthy' : isUnknown ? 'Advice for what you described' : humanize(r.name)}
          </h3>
          {sev && (
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold ${sev.cls}`}>
              <SevIcon className="h-5 w-5" aria-hidden="true" />
              {humanize(r.severity)} damage
            </span>
          )}
        </div>

        {!isUnknown && r.confidence != null && (
          <div className="space-y-2">
            <p className="muted text-base">How sure we are: {percent(r.confidence)}</p>
            <ProgressBar value={r.confidence * 100} label="How sure we are" />
          </div>
        )}
        {r.severity_pct != null && (
          <div className="space-y-2">
            <p className="muted text-base">About {Math.round(r.severity_pct)} out of 100 of the leaf is damaged</p>
            <ProgressBar value={r.severity_pct} tone={sev?.tone || 'amber'} label="Damaged part of the leaf" />
          </div>
        )}
        {r.low_confidence && (
          <Alert type="warning" title="We are not very sure">
            Please ask an extension officer to look at your crop.
          </Alert>
        )}

        <TreatmentList title="Natural treatment" items={t.organic} icon={Leaf} />
        <TreatmentList title="Chemical treatment" items={t.chemical} icon={FlaskConical} />
        <TreatmentList title="How to stop it coming back" items={t.prevention} icon={ShieldCheck} />
        <TreatmentList title={isUnknown ? 'Advice' : 'Be careful'} items={t.warnings} icon={AlertTriangle} />
      </section>
    </Reveal>
  );
}
