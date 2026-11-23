import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Input, { Select } from '../components/common/Input.jsx';
import { useAuth, useLanguage } from '../hooks/useAuth.js';
import { updateMe } from '../services/authService.js';
import { DISTRICTS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, language: user.language, district: user.district || '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setStatus({ type: '', text: '' });
    try {
      await updateMe({ name: form.name, language: form.language, ...(form.district ? { district: form.district } : {}) });
      setLanguage(form.language);
      await refreshUser();
      setStatus({ type: 'success', text: t('profile.saved') });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      <section className="card space-y-4">
        <p className="text-sm text-gray-600">{t('profile.phone')}: {user.phone} · {t('profile.role')}: {humanize(user.role)}</p>
        <Input label={t('auth.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select label={t('auth.language')} options={[{ value: 'en', label: 'English' }, { value: 'ny', label: 'Chichewa' }]} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        <Select label={t('farm.district')} options={DISTRICTS} placeholder={t('farm.choose_district')} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        {status.text && <Alert type={status.type}>{status.text}</Alert>}
        <Button onClick={save} loading={saving} disabled={!form.name.trim()}>{t('common.save')}</Button>
      </section>
      <Button variant="secondary" onClick={async () => { await logout(); navigate('/login'); }}>{t('nav.logout')}</Button>
    </div>
  );
}
