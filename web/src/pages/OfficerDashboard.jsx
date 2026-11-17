import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Input, { Select, Textarea } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import OutbreakMap from '../components/charts/OutbreakMap.jsx';
import TrendChart from '../components/charts/TrendChart.jsx';
import WeatherHeatmap from '../components/charts/WeatherHeatmap.jsx';
import OutbreakTable from '../features/officer/OutbreakTable.jsx';
import RegionFilter from '../features/officer/RegionFilter.jsx';
import ReportExport from '../features/officer/ReportExport.jsx';
import { createAlert, listOutbreaks } from '../services/outbreakService.js';
import { getHeatmap } from '../services/weatherService.js';
import { DISTRICTS } from '../utils/constants.js';
import { errorMessage } from '../utils/formatters.js';

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v));

export default function OfficerDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ district: '', from: '', to: '' });
  const [alertForm, setAlertForm] = useState({ title: '', message: '', target_district: '' });

  const outbreaks = useQuery({
    queryKey: ['outbreaks', filters],
    queryFn: () => listOutbreaks(clean(filters)),
  });
  const heatmap = useQuery({ queryKey: ['heatmap'], queryFn: getHeatmap, staleTime: 10 * 60_000 });

  const trend = useMemo(() => {
    const byWeek = {};
    (outbreaks.data || []).forEach((o) => {
      byWeek[o.period_start] = (byWeek[o.period_start] || 0) + o.case_count;
    });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, cases]) => ({ week: week.slice(5), cases }));
  }, [outbreaks.data]);

  const send = useMutation({
    mutationFn: () => createAlert(clean(alertForm)),
    onSuccess: () => {
      setAlertForm({ title: '', message: '', target_district: '' });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Outbreaks and weather</h1>

      <section className="card space-y-3">
        <RegionFilter value={filters} onChange={setFilters} />
      </section>

      {outbreaks.isLoading ? (
        <Loader />
      ) : outbreaks.error ? (
        <Alert type="error">{errorMessage(outbreaks.error)}</Alert>
      ) : (
        <>
          <section className="card space-y-3">
            <h2 className="font-semibold">Cases by district</h2>
            <OutbreakMap outbreaks={outbreaks.data} />
          </section>
          <section className="card space-y-3">
            <h2 className="font-semibold">Weekly trend</h2>
            <TrendChart data={trend} />
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reports</h2>
              <ReportExport rows={outbreaks.data} />
            </div>
            <OutbreakTable rows={outbreaks.data} />
          </section>
        </>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">7-day rainfall by district</h2>
        {heatmap.isLoading ? <Loader /> : heatmap.error ? <Alert type="warning">{errorMessage(heatmap.error)}</Alert> : <WeatherHeatmap data={heatmap.data} />}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Send an alert to farmers</h2>
        <Input label="Title" value={alertForm.title} maxLength={150} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} />
        <Textarea label="Message" value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} />
        <Select label="District (leave empty for everyone)" options={DISTRICTS} placeholder="All districts" value={alertForm.target_district} onChange={(e) => setAlertForm({ ...alertForm, target_district: e.target.value })} />
        <Alert type="error">{send.error && errorMessage(send.error)}</Alert>
        {send.isSuccess && <Alert type="success">Alert sent.</Alert>}
        <Button onClick={() => send.mutate()} loading={send.isPending} disabled={!alertForm.title.trim() || !alertForm.message.trim()}>
          Send alert
        </Button>
      </section>
    </div>
  );
}
