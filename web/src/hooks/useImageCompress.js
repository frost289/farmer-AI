import { useCallback, useState } from 'react';

const MAX_SIDE = 1280;
const QUALITY = 0.8;

/** Shrinks a photo in the browser before upload (saves data on slow networks). */
export function useImageCompress() {
  const [compressing, setCompressing] = useState(false);

  const compress = useCallback(async (file) => {
    setCompressing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
      if (!blob || blob.size >= file.size) return file; // already small
      return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch {
      return file; // unsupported format in this browser: upload the original
    } finally {
      setCompressing(false);
    }
  }, []);

  return { compress, compressing };
}
