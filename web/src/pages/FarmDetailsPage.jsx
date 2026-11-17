import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, Mountain, Pencil, Plus, Ruler, Sprout, Trash2, Tractor } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import CropIcon from '../components/common/CropIcon.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Input, { Select } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import MapPreview from '../components/common/MapPreview.jsx';
import Modal from '../components/common/Modal.jsx';
import Reveal from '../components/common/Reveal.jsx';
import FarmForm from '../features/farms/FarmForm.jsx';
import WeatherSummary from '../features/planting/WeatherSummary.jsx';
import { addPlanting, deleteFarm, getFarm, listPlantings, updateFarm } from '../services/farmService.js';
import { getFarmWeather } from '../services/weatherService.js';
import { CROPS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-4 dark:bg-slate-900">
      <span className="icon-tile">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <p className="muted text-base">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function FarmDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [crop, setCrop] = useState('');
  const [plantingDate, setPlantingDate] = useState('');

  const farm = useQuery({ queryKey: ['farm', id], queryFn: () => getFarm(id) });
  const plantings = useQuery({ queryKey: ['plantings', id], queryFn: () => listPlantings(id) });
  const hasLocation = farm.data?.lat != null && farm.data?.lng != null;
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
    mutationFn: () =>
      addPlanting(id, { crop, planting_date: plantingDate || undefined, status: plantingDate ? 'planted' : 'planned' }),
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
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="page-title">{f.name}</h1>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              loading={remove.isPending}
              onClick={() => window.confirm('Delete this farm and everything saved for it?') && remove.mutate()}
            >
              Delete
            </Button>
          </div>
        </div>
      </Reveal>
      {remove.error && <Alert type="error">{errorMessage(remove.error)}</Alert>}

      <Reveal delay={80}>
        <section className="card space-y-4">
          <h2 className="section-title">
            <Tractor className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            About this farm
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={Tractor} label="Farm name" value={f.name} />
            <Detail icon={MapPin} label="District" value={f.district} />
            <Detail icon={Mountain} label="Soil type" value={humanize(f.soil_type)} />
            {f.size_ha && <Detail icon={Ruler} label="Size" value={`${f.size_ha} hectares`} />}
          </div>
        </section>
      </Reveal>

      {hasLocation ? (
        <Reveal delay={140}>
          <div className="space-y-6">
            <WeatherSummary weather={weather.data} isLoading={weather.isLoading} error={weather.error} />
            <MapPreview lat={f.lat} lng={f.lng} title={`Map of ${f.name}`} />
          </div>
        </Reveal>
      ) : (
        <Alert type="info">Press Edit and add the farm location to see the weather and a map.</Alert>
      )}

      <Reveal delay={200}>
        <section className="space-y-4">
          <h2 className="section-title">
            <Sprout className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            What I plant here
          </h2>
          {plantings.isLoading ? (
            <Loader />
          ) : plantings.data?.length ? (
            <ul className="list-card">
              {plantings.data.map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-4">
                  <CropIcon crop={p.crop} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold">
                      {humanize(p.crop)}
                      {p.variety ? ` (${p.variety})` : ''}
                    </p>
                    <p className="muted flex items-center gap-2 text-base">
                      <CalendarDays className="h-5 w-5" aria-hidden="true" />
                      {p.planting_date ? `Planted on ${p.planting_date}` : 'Not planted yet'}
                    </p>
                  </div>
                  <span className="muted text-base font-semibold">{humanize(p.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Sprout} title="No crops added yet" message="Add the crops you plant on this farm." />
          )}
          <div className="card grid gap-4 sm:grid-cols-3 sm:items-end">
            <Select
              label="Crop"
              options={CROPS.map((c) => ({ value: c, label: humanize(c) }))}
              placeholder="Choose a crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            />
            <Input label="Planting date (you can skip this)" type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
            <Button icon={Plus} onClick={() => plant.mutate()} disabled={!crop} loading={plant.isPending}>
              Add crop
            </Button>
          </div>
          {plant.error && <Alert type="error">{errorMessage(plant.error)}</Alert>}
        </section>
      </Reveal>

      {editing && (
        <Modal title="Edit farm" onClose={() => setEditing(false)}>
          <FarmForm defaultValues={f} onSubmit={(v) => update.mutateAsync(v)} error={update.error && errorMessage(update.error)} />
        </Modal>
      )}
    </div>
  );
}
