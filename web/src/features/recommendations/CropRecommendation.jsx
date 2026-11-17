import { Coins, TrendingUp } from 'lucide-react';
import CropIcon from '../../components/common/CropIcon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Reveal from '../../components/common/Reveal.jsx';
import { humanize } from '../../utils/formatters.js';

/** Yield and profit show only when the advice service sends them (expected_yield, expected_profit). */
export default function CropRecommendation({ recommendations = [] }) {
  if (!recommendations.length) return <EmptyState title="No advice yet" message="Choose a farm and press the button." />;
  return (
    <ol className="space-y-4">
      {recommendations.map((r, i) => (
        <li key={`${r.crop}-${r.variety || i}`}>
          <Reveal delay={i * 90}>
            <div className="card space-y-3">
              <div className="flex items-center gap-4">
                <CropIcon crop={r.crop} className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-extrabold">
                    {i + 1}. {humanize(r.crop)}
                  </h3>
                  {r.variety && <p className="muted text-base">Seed type: {r.variety}</p>}
                </div>
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-lg font-extrabold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200">
                  {Math.round(r.score * 100)}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="muted text-base">How well it suits your farm</p>
                <ProgressBar value={r.score * 100} label={`${humanize(r.crop)} suitability`} />
              </div>
              <p className="text-lg">{r.reason}</p>
              {(r.expected_yield != null || r.expected_profit != null) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {r.expected_yield != null && (
                    <p className="flex items-center gap-2 text-lg font-semibold">
                      <TrendingUp className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      Yield: {String(r.expected_yield)}
                    </p>
                  )}
                  {r.expected_profit != null && (
                    <p className="flex items-center gap-2 text-lg font-semibold">
                      <Coins className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      Profit: {String(r.expected_profit)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
