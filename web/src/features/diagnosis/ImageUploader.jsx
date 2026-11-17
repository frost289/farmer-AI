import { Camera, ImagePlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';

const TYPES = ['image/jpeg', 'image/png'];

export default function ImageUploader({ file, onChange, onError }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const accept = (picked) => {
    if (!picked) return;
    if (!TYPES.includes(picked.type)) return onError?.('Please choose a JPEG or PNG photo.');
    onChange(picked);
  };
  const handle = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    accept(picked);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-4">
      <span className="label">Photo of the sick crop</span>
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-600 dark:border-emerald-400">
          <img src={preview} alt="The crop photo you chose" className="max-h-80 w-full object-cover" />
          <Button variant="secondary" icon={X} className="absolute right-3 top-3 !min-h-[48px] !px-4" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => galleryRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-4 border-dashed p-6 text-center transition ${
            dragging
              ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40'
              : 'border-stone-300 bg-stone-50 hover:border-emerald-600 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/30'
          }`}
        >
          <Camera className="h-16 w-16 animate-float text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-xl font-bold">Tap or drop a photo of the sick crop here</span>
          <span className="muted text-base">Take the photo in daylight, close to the damaged leaf.</span>
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" icon={Camera} onClick={() => cameraRef.current.click()}>
          Take a photo
        </Button>
        <Button variant="secondary" icon={ImagePlus} onClick={() => galleryRef.current.click()}>
          Choose from gallery
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handle} />
    </div>
  );
}
