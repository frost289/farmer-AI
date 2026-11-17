import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { changeRole, getStats, listUsers } from '../services/authService.js';
import { ALL_ROLES } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

export default function AdminPage() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: getStats });
  const users = useQuery({ queryKey: ['users', page], queryFn: () => listUsers({ page, limit: 20 }) });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const total = users.data?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      {stats.data && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card"><p className="text-sm text-gray-500 dark:text-slate-400">Farms</p><p className="text-2xl font-bold">{stats.data.farms}</p></div>
          {Object.entries(stats.data.users_by_role).map(([role, n]) => (
            <div key={role} className="card"><p className="text-sm text-gray-500 dark:text-slate-400">{humanize(role)}s</p><p className="text-2xl font-bold">{n}</p></div>
          ))}
          {Object.entries(stats.data.diagnoses_by_status).map(([status, n]) => (
            <div key={status} className="card"><p className="text-sm text-gray-500 dark:text-slate-400">Checks {status}</p><p className="text-2xl font-bold">{n}</p></div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Users</h2>
        {roleMutation.error && <Alert type="error">{errorMessage(roleMutation.error)}</Alert>}
        {users.isLoading ? (
          <Loader />
        ) : users.error ? (
          <Alert type="error">{errorMessage(users.error)}</Alert>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-slate-300">
                <tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">District</th><th className="p-3">Role</th></tr>
              </thead>
              <tbody>
                {users.data.items.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3">{u.district || '-'}</td>
                    <td className="p-3">
                      <select
                        aria-label={`Role for ${u.name}`}
                        className="rounded border border-gray-300 dark:border-slate-600 px-2 py-1"
                        value={u.role}
                        disabled={u.id === me.id || roleMutation.isPending}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      >
                        {ALL_ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-600 dark:text-slate-300">Page {page} of {pages}</span>
          <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </section>
    </div>
  );
}
