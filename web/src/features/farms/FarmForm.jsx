import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input, { Select } from '../../components/common/Input.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { DISTRICTS, SOIL_TYPES } from '../../utils/constants.js';
import { humanize } from '../../utils/formatters.js';
import { farmSchema } from '../../utils/validators.js';

export default function FarmForm({ defaultValues, onSubmit, submitLabel, error }) {
  const { t } = useLanguage();
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: { soil_type: 'unknown', ...defaultValues },
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) return setLocationMsg(t('farm.location_unsupported'));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', Number(pos.coords.latitude.toFixed(5)));
        setValue('lng', Number(pos.coords.longitude.toFixed(5)));
        setLocationMsg(t('farm.location_added'));
        setLocating(false);
      },
      () => {
        setLocationMsg(t('farm.location_failed'));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>
      <Input label={t('farm.name')} error={errors.name?.message} {...register('name')} />
      <Select label={t('farm.district')} options={DISTRICTS} placeholder={t('farm.choose_district')} error={errors.district?.message} {...register('district')} />
      <Select label={t('farm.soil_type')} options={SOIL_TYPES.map((s) => ({ value: s, label: humanize(s) }))} error={errors.soil_type?.message} {...register('soil_type')} />
      <Input label={t('farm.size')} type="number" step="0.1" inputMode="decimal" error={errors.size_ha?.message} {...register('size_ha')} />
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-sm text-gray-600">{t('farm.location_needed')}</p>
        <Button variant="secondary" onClick={useMyLocation} loading={locating}>
          {t('farm.use_location')}
        </Button>
        {locationMsg && <p className="mt-2 text-sm text-gray-600">{locationMsg}</p>}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label={t('farm.latitude')} type="number" step="any" error={errors.lat?.message} {...register('lat')} />
          <Input label={t('farm.longitude')} type="number" step="any" error={errors.lng?.message} {...register('lng')} />
        </div>
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        {submitLabel || t('farm.save')}
      </Button>
    </form>
  );
}
