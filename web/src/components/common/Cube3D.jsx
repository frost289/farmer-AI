import { CloudRain, Droplets, Leaf, Sprout, Sun, Wheat } from 'lucide-react';

const FACES = [Sprout, CloudRain, Sun, Wheat, Droplets, Leaf];

/** A slowly turning 3D cube with farming icons on its faces (decorative). */
export default function Cube3D({ size = 96 }) {
  const half = size / 2;
  const transforms = [
    `translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <div style={{ width: size, height: size, perspective: size * 5 }} aria-hidden="true">
      <div className="cube animate-cube-spin" style={{ width: size, height: size }}>
        {FACES.map((Icon, i) => (
          <div key={i} className="cube-face" style={{ transform: transforms[i] }}>
            <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
