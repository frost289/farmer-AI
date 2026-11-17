import { useQuery } from '@tanstack/react-query';
import { CloudRain } from 'lucide-react';
import { useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import { Select } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import MapPreview from '../components/common/MapPreview.jsx';
import Reveal from '../components/common/Reveal.jsx';
import FarmSelect from '../features/farms/FarmSelect.jsx';
import PlantingReadiness from '../features/planting/PlantingReadiness.jsx';
import WeatherSummary from '../features/planting/WeatherSummary.jsx';
import { getPlantingReadiness } from '../services/advisoryService.js';
import { listFarms } from '../services/farmService.js';
import { getFarmWeather } from '../services/weatherService.js';
import { CROPS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

export default function PlantingPage() {
  const [farmId, setFarmId] = useState('');
  const [crop, setCrop] = useState('maize');
  const [request, setRequest] = useState(null);

  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });
  const farm = farms.data?.find((f) => f.id === farmId);
  const hasLocation = farm?.lat != null && farm?.lng != null;

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
    <div className="space-y-8">
      <h1 className="page-title">Can I Plant Today?</h1>

      <Reveal>
        <section className="card space-y-6">
          {farms.isLoading ? (
            <Loader />
          ) : (
            <FarmSelect
              farms={farms.data}
              value={farmId}
              onChange={(v) => {
                setFarmId(v);
                setRequest(null);
              }}
            />
          )}
          <Select
            label="Which crop?"
            options={CROPS.map((c) => ({ value: c, label: humanize(c) }))}
            value={crop}
            onChange={(e) => {
              setCrop(e.target.value);
              setRequest(null);
            }}
          />
          {farmId && !hasLocation && (
            <Alert type="warning">This farm has no location yet. Open the farm and add its location to get weather advice.</Alert>
          )}
          <Button
            icon={CloudRain}
            className="w-full !min-h-[64px] text-xl"
            disabled={!farmId || !hasLocation}
            loading={readiness.isFetching}
            onClick={() => setRequest({ farmId, crop })}
          >
            Check now
          </Button>
        </section>
      </Reveal>

      {readiness.error && <Alert type="error">{errorMessage(readiness.error)}</Alert>}
      <PlantingReadiness readiness={readiness.data} crop={request?.crop} />

      {farmId && hasLocation && (
        <Reveal delay={120}>
          <div className="space-y-6">
            <MapPreview lat={farm.lat} lng={farm.lng} title={`Map of ${farm.name}`} />
            <WeatherSummary weather={weather.data} isLoading={weather.isLoading} error={weather.error} />
          </div>
        </Reveal>
      )}
    </div>
  );
}
