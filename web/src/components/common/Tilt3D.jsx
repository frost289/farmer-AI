import { useRef } from 'react';

/**
 * 3D hover effect: the card tilts toward the pointer. Disabled on touch screens and
 * when the person has asked for reduced motion. Put a block-level card inside it.
 */
export default function Tilt3D({ children, max = 8, className = '' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (e.pointerType === 'touch' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div className={`scene-3d ${className}`} onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className="tilt-card h-full">
        {children}
      </div>
    </div>
  );
}
