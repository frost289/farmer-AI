import { useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';
import { useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import Reveal from '../components/common/Reveal.jsx';
import FarmSelect from '../features/farms/FarmSelect.jsx';
import CropRecommendation from '../features/recommendations/CropRecommendation.jsx';
import { getCropRecommendations } from '../services/advisoryService.js';
import { listFarms } from '../services/farmService.js';
import { errorMessage } from '../utils/formatters.js';

export default function RecommendationsPage() {
  const [farmId, setFarmId] = useState('');
  const [requested, setRequested] = useState('');

  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });
  const farm = farms.data?.find((f) => f.id === farmId);
  const hasLocation = farm?.lat != null && farm?.lng != null;

  const recs = useQuery({
    queryKey: ['crop-recs', requested],
    queryFn: () => getCropRecommendations(requested),
    enabled: Boolean(requested),
  });

  return (
    <div className="space-y-8">
      <h1 className="page-title">What to Plant</h1>
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
                setRequested('');
              }}
            />
          )}
          {farmId && !hasLocation && (
            <Alert type="warning">Add this farm's location first, so we can use the weather and soil of your area.</Alert>
          )}
          <Button
            icon={Sprout}
            className="w-full !min-h-[64px] text-xl"
            disabled={!farmId || !hasLocation}
            loading={recs.isFetching}
            onClick={() => setRequested(farmId)}
          >
            Show me the best crops
          </Button>
        </section>
      </Reveal>
      {recs.error && <Alert type="error">{errorMessage(recs.error)}</Alert>}
      {recs.data && <CropRecommendation recommendations={recs.data.recommendations} />}
    </div>
  );
}
