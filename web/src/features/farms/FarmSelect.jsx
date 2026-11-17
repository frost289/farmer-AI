import { Select } from '../../components/common/Input.jsx';

export default function FarmSelect({ farms = [], value, onChange, label = 'Farm' }) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Choose a farm"
      options={farms.map((f) => ({ value: f.id, label: `${f.name} (${f.district})` }))}
    />
  );
}
