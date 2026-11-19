import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Input, { Select } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import FarmForm from '../features/farms/FarmForm.jsx';
import WeatherSummary from '../features/planting/WeatherSummary.jsx';
import { addPlanting, deleteFarm, getFarm, listPlantings, updateFarm } from '../services/farmService.js';
import { getFarmWeather } from '../services/weatherService.js';
import { CROPS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

export default function FarmDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [crop, setCrop] = useState('');
  const [plantingDate, setPlantingDate] = useState('');

  const farm = useQuery({ queryKey: ['farm', id], queryFn: () => getFarm(id) });
  const plantings = useQuery({ queryKey: ['plantings', id], queryFn: () => listPlantings(id) });
  const hasLocation = farm.data?.lat !== null && farm.data?.lat !== undefined && farm.data?.lng !== null && farm.data?.lng !== undefined;
  const weather = useQuery({
    queryKey: ['weather', id],
    queryFn: () => getFarmWeather(id),
    enabled: hasLocation,
  });

  const update = useMutation({
    mutationFn: (values) => updateFarm(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm', id] });
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      setEditing(false);
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      navigate('/dashboard');
    },
  });
  const plant = useMutation({
    mutationFn: () => addPlanting(id, { crop, planting_date: plantingDate || undefined, status: plantingDate ? 'planted' : 'planned' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantings', id] });
      setCrop('');
      setPlantingDate('');
    },
  });

  if (farm.isLoading) return <Loader />;
  if (farm.error) return <Alert type="error">{errorMessage(farm.error)}</Alert>;
  const f = farm.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{f.name}</h1>
          <p className="text-gray-600">{f.district} · {humanize(f.soil_type)} soil{f.size_ha ? ` · ${f.size_ha} ha` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => window.confirm('Delete this farm and its records?') && remove.mutate()}
          >
            Delete
          </Button>
        </div>
      </div>
      {remove.error && <Alert type="error">{errorMessage(remove.error)}</Alert>}

      {hasLocation ? (
        <WeatherSummary weather={weather.data} isLoading={weather.isLoading} error={weather.error} />
      ) : (
        <Alert type="info">Add your farm location (Edit) to see the weather forecast and get planting advice.</Alert>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What I plant here</h2>
        {plantings.isLoading ? (
          <Loader />
        ) : plantings.data?.length ? (
          <ul className="divide-y rounded-xl border bg-white">
            {plantings.data.map((p) => (
              <li key={p.id} className="flex justify-between p-3">
                <span className="font-medium">{humanize(p.crop)}{p.variety ? ` (${p.variety})` : ''}</span>
                <span className="text-sm text-gray-500">{humanize(p.status)}{p.planting_date ? ` · ${p.planting_date}` : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No crops recorded" />
        )}
        <div className="card grid gap-3 sm:grid-cols-3 sm:items-end">
          <Select label="Crop" options={CROPS.map((c) => ({ value: c, label: humanize(c) }))} placeholder="Choose a crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
          <Input label="Planting date (optional)" type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
          <Button onClick={() => plant.mutate()} disabled={!crop} loading={plant.isPending}>Add crop</Button>
        </div>
        {plant.error && <Alert type="error">{errorMessage(plant.error)}</Alert>}
      </section>

      {editing && (
        <Modal title="Edit farm" onClose={() => setEditing(false)}>
          <FarmForm defaultValues={f} onSubmit={(v) => update.mutateAsync(v)} error={update.error && errorMessage(update.error)} />
        </Modal>
      )}
    </div>
  );
}
