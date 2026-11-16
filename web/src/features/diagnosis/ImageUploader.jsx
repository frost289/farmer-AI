import { useEffect, useMemo, useRef } from 'react';
import Button from '../../components/common/Button.jsx';

const TYPES = ['image/jpeg', 'image/png'];

export default function ImageUploader({ file, onChange, onError }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handle = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (!TYPES.includes(picked.type)) return onError?.('Please choose a JPEG or PNG photo.');
    onChange(picked);
  };

  return (
    <div className="space-y-3">
      <span className="label">Photo of the affected leaf or plant</span>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Selected crop" className="max-h-64 w-full rounded-lg object-cover" />
          <Button variant="secondary" className="absolute right-2 top-2" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Take a clear photo in daylight, close to the damaged leaf.
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => cameraRef.current.click()}>
          📷 Take photo
        </Button>
        <Button variant="secondary" onClick={() => galleryRef.current.click()}>
          🖼️ Choose photo
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handle} />
    </div>
  );
}
