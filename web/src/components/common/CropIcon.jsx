import { Bean, Carrot, Cherry, Flower2, Leaf, Nut, Sprout, Wheat } from 'lucide-react';

const ICONS = {
  maize: Wheat,
  rice: Wheat,
  groundnut: Nut,
  soybean: Bean,
  beans: Bean,
  tobacco: Leaf,
  cassava: Carrot,
  sweet_potato: Carrot,
  cotton: Flower2,
  tomato: Cherry,
  pigeon_pea: Sprout,
};

/** Vector icon for a crop, inside a rounded tile. */
export default function CropIcon({ crop, className = 'h-12 w-12' }) {
  const Icon = ICONS[crop] || Sprout;
  return (
    <span className={`icon-tile ${className}`}>
      <Icon className="h-2/3 w-2/3" aria-hidden="true" />
    </span>
  );
}
