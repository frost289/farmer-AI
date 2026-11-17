import { CheckCircle2, Clock, CloudRain, Coins, Droplets, TrendingUp, XCircle } from 'lucide-react';
import CropIcon from '../../components/common/CropIcon.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Reveal from '../../components/common/Reveal.jsx';
import { humanize } from '../../utils/formatters.js';

const VERDICT = {
  plant: {
    text: 'Yes, you can plant now',
    icon: CheckCircle2,
    box: 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40',
    tone: 'emerald',
  },
  wait: {
    text: 'Wait before planting',
    icon: Clock,
    box: 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40',
    tone: 'amber',
  },
  not_recommended: {
    text: 'Do not plant now',
    icon: XCircle,
    box: 'border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/40',
    tone: 'red',
  },
};

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3 dark:bg-slate-900/60">
      <Icon className="h-7 w-7 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
      <div>
        <p className="muted text-sm">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

/** Yield and profit are shown only when the advice service sends them (expected_yield, expected_profit). */
export default function PlantingReadiness({ readiness, crop }) {
  if (!readiness) return null;
  const v = VERDICT[readiness.verdict] || VERDICT.wait;
  const Icon = v.icon;
  return (
    <Reveal>
      <section className={`space-y-4 rounded-2xl border-2 p-5 ${v.box}`} aria-live="polite">
        <div className="flex items-center gap-4">
          {crop && <CropIcon crop={crop} className="h-16 w-16" />}
          <p className="flex items-center gap-3 text-2xl font-extrabold">
            <Icon className="h-9 w-9 shrink-0" aria-hidden="true" />
            {v.text}
          </p>
        </div>
        <p className="text-lg">{readiness.reason}</p>
        <div className="space-y-2">
          <p className="text-base font-semibold">How good is the weather for this crop</p>
          <ProgressBar value={(readiness.confidence ?? 0) * 100} tone={v.tone} label="Suitability" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {readiness.soil_moisture && <Metric icon={Droplets} label="Soil moisture" value={humanize(readiness.soil_moisture)} />}
          {readiness.rain_onset_date && <Metric icon={CloudRain} label="Rain expected from" value={readiness.rain_onset_date} />}
          {readiness.expected_yield != null && <Metric icon={TrendingUp} label="Expected yield" value={String(readiness.expected_yield)} />}
          {readiness.expected_profit != null && <Metric icon={Coins} label="Expected profit" value={String(readiness.expected_profit)} />}
        </div>
      </section>
    </Reveal>
  );
}
