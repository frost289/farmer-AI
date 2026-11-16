import Input, { Select } from '../../components/common/Input.jsx';
import { DISTRICTS } from '../../utils/constants.js';

export default function RegionFilter({ value, onChange }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Select label="District" options={DISTRICTS} placeholder="All districts" value={value.district} onChange={set('district')} />
      <Input label="From" type="date" value={value.from} onChange={set('from')} />
      <Input label="To" type="date" value={value.to} onChange={set('to')} />
    </div>
  );
}
