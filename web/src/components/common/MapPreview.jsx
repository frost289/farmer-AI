import { ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

/** OpenStreetMap preview with big zoom buttons. Needs a farm latitude and longitude. */
export default function MapPreview({ lat, lng, title = 'Farm location' }) {
  const [zoom, setZoom] = useState(2);
  if (lat == null || lng == null) return null;

  const dLat = 0.04 / zoom;
  const dLng = 0.06 / zoom;
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const zoomBtn =
    'flex h-14 w-14 items-center justify-center bg-white text-slate-900 hover:bg-stone-100 disabled:opacity-40 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700';

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-stone-200 dark:border-slate-700">
      <div className="relative">
        <iframe key={zoom} title={title} src={src} loading="lazy" className="h-64 w-full border-0 sm:h-80" />
        <div className="absolute right-3 top-3 flex flex-col divide-y divide-stone-200 overflow-hidden rounded-xl border-2 border-stone-300 shadow-lg dark:divide-slate-600 dark:border-slate-600">
          <button type="button" className={zoomBtn} aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}>
            <ZoomIn className="h-7 w-7" aria-hidden="true" />
          </button>
          <button type="button" className={zoomBtn} aria-label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}>
            <ZoomOut className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[56px] items-center justify-center gap-2 bg-stone-50 px-4 text-lg font-semibold text-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
      >
        <ExternalLink className="h-6 w-6" aria-hidden="true" />
        Open the larger map
      </a>
    </div>
  );
}
