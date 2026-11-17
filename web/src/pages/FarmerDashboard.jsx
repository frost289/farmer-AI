import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Camera, CheckCircle2, CloudRain, Leaf, Plus, ShieldAlert, Sprout, Tractor } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import Reveal from '../components/common/Reveal.jsx';
import Tilt3D from '../components/common/Tilt3D.jsx';
import DiagnosisHistory from '../features/diagnosis/DiagnosisHistory.jsx';
import FarmForm from '../features/farms/FarmForm.jsx';
import FarmList from '../features/farms/FarmList.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { createFarm, listFarms } from '../services/farmService.js';
import { listAlerts } from '../services/outbreakService.js';
import { errorMessage, formatDate } from '../utils/formatters.js';

const ACTIONS = [
  { to: '/diagnosis', icon: Camera, title: 'Check My Crop', text: 'Take a photo of a sick plant', tile: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' },
  { to: '/planting', icon: CloudRain, title: 'Can I Plant Today?', text: 'See if the weather is safe', tile: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300' },
  { to: '/recommendations', icon: Sprout, title: 'What to Plant', text: 'The best crops for your land', tile: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' },
];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: listAlerts });
  const firstName = user.name.split(' ')[0];

  const create = useMutation({
    mutationFn: createFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      setAdding(false);
    },
  });

  return (
    <div className="space-y-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
          <Sprout className="absolute -bottom-6 -right-4 h-44 w-44 origin-bottom animate-sway text-white/20" aria-hidden="true" />
          <Leaf className="absolute right-24 top-4 h-12 w-12 animate-float text-white/25" aria-hidden="true" />
          <div className="relative">
            <h1 className="page-title text-white">Welcome back, {firstName}!</h1>
            <p className="mt-2 text-xl text-emerald-50">What would you like to do today?</p>
          </div>
        </section>
      </Reveal>

      <section className="grid gap-4 md:grid-cols-3" aria-label="What would you like to do">
        {ACTIONS.map(({ to, icon: Icon, title, text, tile }, i) => (
          <Reveal key={to} delay={100 + i * 90}>
            <Tilt3D>
              <Link
                to={to}
                className="card preserve-3d flex h-full min-h-[190px] flex-col justify-between gap-5 transition hover:border-emerald-600 hover:shadow-xl dark:hover:border-emerald-400"
              >
                <span className={`depth-1 flex h-16 w-16 items-center justify-center rounded-2xl ${tile}`}>
                  <Icon className="h-9 w-9" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl font-extrabold">{title}</span>
                  <span className="muted mt-1 flex items-center justify-between gap-2 text-lg">
                    {text}
                    <ArrowRight className="h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </Tilt3D>
          </Reveal>
        ))}
      </section>

      <Reveal delay={200}>
        <section className="space-y-3">
          <h2 className="section-title">
            <ShieldAlert className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Active Alerts
          </h2>
          {alerts.data?.length > 0 ? (
            alerts.data.slice(0, 3).map((a) => (
              <Alert key={a.id} type="warning" title={a.title}>
                {a.message}
                <span className="muted mt-1 block text-base">{formatDate(a.created_at)}</span>
              </Alert>
            ))
          ) : (
            <p className="muted flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              No warnings right now.
            </p>
          )}
        </section>
      </Reveal>

      <Reveal delay={260}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">
              <Tractor className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              My Farms
            </h2>
            <Button variant="secondary" icon={Plus} onClick={() => setAdding(true)}>
              Add a farm
            </Button>
          </div>
          {farms.isLoading ? (
            <Loader />
          ) : farms.error ? (
            <Alert type="error">{errorMessage(farms.error)}</Alert>
          ) : (
            <FarmList farms={farms.data} emptyAction={<Button icon={Plus} onClick={() => setAdding(true)}>Add your first farm</Button>} />
          )}
        </section>
      </Reveal>

      <Reveal delay={320}>
        <section className="space-y-4">
          <h2 className="section-title">Recent crop checks</h2>
          <DiagnosisHistory limit={3} />
        </section>
      </Reveal>

      {adding && (
        <Modal title="Add a farm" onClose={() => setAdding(false)}>
          <FarmForm onSubmit={(v) => create.mutateAsync(v)} error={create.error && errorMessage(create.error)} />
        </Modal>
      )}
    </div>
  );
}
