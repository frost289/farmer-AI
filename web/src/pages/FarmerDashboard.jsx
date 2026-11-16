import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import DiagnosisHistory from '../features/diagnosis/DiagnosisHistory.jsx';
import FarmForm from '../features/farms/FarmForm.jsx';
import FarmList from '../features/farms/FarmList.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { createFarm, listFarms } from '../services/farmService.js';
import { listAlerts } from '../services/outbreakService.js';
import { errorMessage, formatDate } from '../utils/formatters.js';

const ACTIONS = [
  { to: '/diagnosis', icon: '🌿', label: 'Check my crop' },
  { to: '/planting', icon: '🌧️', label: 'Can I plant?' },
  { to: '/recommendations', icon: '🌱', label: 'What to plant' },
];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: listAlerts });

  const create = useMutation({
    mutationFn: createFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      setAdding(false);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hello, {user.name}</h1>

      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="card flex min-h-[96px] flex-col items-center justify-center gap-1 text-center text-sm font-semibold hover:border-brand-500">
            <span className="text-3xl" aria-hidden="true">{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {alerts.data?.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Alerts</h2>
          {alerts.data.slice(0, 3).map((a) => (
            <Alert key={a.id} type="warning" title={a.title}>
              {a.message} <span className="text-xs text-gray-500">({formatDate(a.created_at)})</span>
            </Alert>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My farms</h2>
          <Button variant="secondary" onClick={() => setAdding(true)}>+ Add farm</Button>
        </div>
        {farms.isLoading ? (
          <Loader />
        ) : farms.error ? (
          <Alert type="error">{errorMessage(farms.error)}</Alert>
        ) : (
          <FarmList farms={farms.data} emptyAction={<Button onClick={() => setAdding(true)}>Add your first farm</Button>} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent crop checks</h2>
        <DiagnosisHistory limit={3} />
      </section>

      {adding && (
        <Modal title="Add a farm" onClose={() => setAdding(false)}>
          <FarmForm onSubmit={(v) => create.mutateAsync(v)} error={create.error && errorMessage(create.error)} />
        </Modal>
      )}
    </div>
  );
}
