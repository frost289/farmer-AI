import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import { Select } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import FarmSelect from '../features/farms/FarmSelect.jsx';
import PlantingReadiness from '../features/planting/PlantingReadiness.jsx';
import WeatherSummary from '../features/planting/WeatherSummary.jsx';
import { useLanguage } from '../hooks/useAuth.js';
import { getPlantingReadiness } from '../services/advisoryService.js';
import { listFarms } from '../services/farmService.js';
import { getFarmWeather } from '../services/weatherService.js';
import { CROPS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

export default function PlantingPage() {
  const { t } = useLanguage();
  const [farmId, setFarmId] = useState('');
  const [crop, setCrop] = useState('maize');
  const [request, setRequest] = useState(null);

  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });
  const farm = farms.data?.find((f) => f.id === farmId);
  const hasLocation = farm?.lat !== null && farm?.lat !== undefined && farm?.lng !== null && farm?.lng !== undefined;

  const readiness = useQuery({
    queryKey: ['readiness', request],
    queryFn: () => getPlantingReadiness(request),
    enabled: Boolean(request),
  });
  const weather = useQuery({
    queryKey: ['weather', farmId],
    queryFn: () => getFarmWeather(farmId),
    enabled: Boolean(farmId) && hasLocation,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('planting.title')}</h1>
      <section className="card space-y-4">
        {farms.isLoading ? <Loader /> : <FarmSelect farms={farms.data} value={farmId} onChange={(v) => { setFarmId(v); setRequest(null); }} />}
        <Select label={t('planting.crop')} options={CROPS.map((c) => ({ value: c, label: humanize(c) }))} value={crop} onChange={(e) => { setCrop(e.target.value); setRequest(null); }} />
        {farmId && !hasLocation && <Alert type="warning">{t('planting.no_location')}</Alert>}
        <Button className="w-full" disabled={!farmId || !hasLocation} loading={readiness.isFetching} onClick={() => setRequest({ farmId, crop })}>
          {t('planting.check')}
        </Button>
      </section>

      {readiness.error && <Alert type="error">{errorMessage(readiness.error)}</Alert>}
      <PlantingReadiness readiness={readiness.data} />
      {farmId && hasLocation && <WeatherSummary weather={weather.data} isLoading={weather.isLoading} error={weather.error} />}
    </div>
  );
}
