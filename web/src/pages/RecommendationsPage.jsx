import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
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
  const hasLocation = farm?.lat !== null && farm?.lat !== undefined && farm?.lng !== null && farm?.lng !== undefined;

  const recs = useQuery({
    queryKey: ['crop-recs', requested],
    queryFn: () => getCropRecommendations(requested),
    enabled: Boolean(requested),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">What should I plant?</h1>
      <section className="card space-y-4">
        {farms.isLoading ? <Loader /> : <FarmSelect farms={farms.data} value={farmId} onChange={(v) => { setFarmId(v); setRequested(''); }} />}
        {farmId && !hasLocation && <Alert type="warning">Add this farm&apos;s location first so we can use the weather and soil of your area.</Alert>}
        <Button className="w-full" disabled={!farmId || !hasLocation} loading={recs.isFetching} onClick={() => setRequested(farmId)}>
          Get recommendations
        </Button>
      </section>
      {recs.error && <Alert type="error">{errorMessage(recs.error)}</Alert>}
      {recs.data && <CropRecommendation recommendations={recs.data.recommendations} />}
    </div>
  );
}
