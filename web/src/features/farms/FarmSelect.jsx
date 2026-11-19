import { Select } from '../../components/common/Input.jsx';
import { useLanguage } from '../../hooks/useAuth.js';

export default function FarmSelect({ farms = [], value, onChange, label }) {
  const { t } = useLanguage();
  return (
    <Select
      label={label || t('farm.select')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('farm.choose')}
      options={farms.map((f) => ({ value: f.id, label: `${f.name} (${f.district})` }))}
    />
  );
}
