import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input, { Select } from '../../components/common/Input.jsx';
import { DISTRICTS, SOIL_TYPES } from '../../utils/constants.js';
import { humanize } from '../../utils/formatters.js';
import { farmSchema } from '../../utils/validators.js';

export default function FarmForm({ defaultValues, onSubmit, submitLabel = 'Save farm', error }) {
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
    if (!navigator.geolocation) return setLocationMsg('Location is not supported on this device.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', Number(pos.coords.latitude.toFixed(5)));
        setValue('lng', Number(pos.coords.longitude.toFixed(5)));
        setLocationMsg('Location added.');
        setLocating(false);
      },
      () => {
        setLocationMsg('Could not get your location. You can type it in.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>
      <Input label="Farm name" error={errors.name?.message} {...register('name')} />
      <Select label="District" options={DISTRICTS} placeholder="Choose a district" error={errors.district?.message} {...register('district')} />
      <Select label="Soil type" options={SOIL_TYPES.map((s) => ({ value: s, label: humanize(s) }))} error={errors.soil_type?.message} {...register('soil_type')} />
      <Input label="Size (hectares)" type="number" step="0.1" inputMode="decimal" error={errors.size_ha?.message} {...register('size_ha')} />
      <div className="rounded-xl bg-gray-50 dark:bg-slate-800/60 p-4">
        <p className="mb-3 text-base text-gray-700 dark:text-slate-200">Location is needed for weather and planting advice.</p>
        <Button variant="secondary" icon={MapPin} onClick={useMyLocation} loading={locating}>
          Use my location
        </Button>
        {locationMsg && <p className="mt-2 text-base text-gray-700 dark:text-slate-200">{locationMsg}</p>}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Latitude" type="number" step="any" error={errors.lat?.message} {...register('lat')} />
          <Input label="Longitude" type="number" step="any" error={errors.lng?.message} {...register('lng')} />
        </div>
      </div>
      <Button type="submit" icon={Save} loading={isSubmitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
