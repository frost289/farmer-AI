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
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: { soil_type: 'unknown', ...defaultValues },
  });
  const latitude = watch('lat');
  const longitude = watch('lng');
  const hasLocation = latitude !== undefined && latitude !== '' && longitude !== undefined && longitude !== '';

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg(t('farm.location_unsupported'));
      return;
    }
    setLocating(true);
    setLocationMsg(t('farm.location_waiting'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', Number(pos.coords.latitude.toFixed(5)), { shouldValidate: true, shouldDirty: true });
        setValue('lng', Number(pos.coords.longitude.toFixed(5)), { shouldValidate: true, shouldDirty: true });
        setLocationMsg(t('farm.location_added'));
        setLocating(false);
      },
      (err) => {
        const key = err.code === 1 ? 'farm.location_denied' : 'farm.location_failed';
        setLocationMsg(t(key));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>
      <Input label={t('farm.name')} error={errors.name?.message} {...register('name')} />
      <Select label={t('farm.district')} options={DISTRICTS} placeholder={t('farm.choose_district')} error={errors.district?.message} {...register('district')} />
      <Select label={t('farm.soil_type')} options={SOIL_TYPES.map((s) => ({ value: s, label: humanize(s) }))} error={errors.soil_type?.message} {...register('soil_type')} />
      <Input label={t('farm.size')} type="number" step="0.1" inputMode="decimal" error={errors.size_ha?.message} {...register('size_ha')} />

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4" aria-labelledby="farm-location-heading">
        <h3 id="farm-location-heading" className="font-semibold text-gray-900">{t('farm.location_title')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('farm.location_explanation')}</p>
        <Button variant="secondary" className="mt-3 w-full sm:w-auto" onClick={useMyLocation} loading={locating}>
          {t('farm.use_location')}
        </Button>
        <p className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
          {locationMsg || (hasLocation ? t('farm.location_added') : t('farm.location_optional'))}
        </p>
        {hasLocation && (
          <Button
            variant="ghost"
            className="mt-1 min-h-9 px-2 text-sm"
            onClick={() => {
              setValue('lat', undefined, { shouldDirty: true });
              setValue('lng', undefined, { shouldDirty: true });
              setLocationMsg(t('farm.location_cleared'));
            }}
          >
            {t('farm.remove_location')}
          </Button>
        )}
        <input type="hidden" {...register('lat')} />
        <input type="hidden" {...register('lng')} />
      </section>

      <Button type="submit" loading={isSubmitting} className="w-full">
        {submitLabel || t('farm.save')}
      </Button>
    </form>
  );
}
