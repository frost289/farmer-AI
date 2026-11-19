import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import { Select, Textarea } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import DiagnosisHistory from '../features/diagnosis/DiagnosisHistory.jsx';
import DiagnosisResult from '../features/diagnosis/DiagnosisResult.jsx';
import ImageUploader from '../features/diagnosis/ImageUploader.jsx';
import SymptomChat from '../features/diagnosis/SymptomChat.jsx';
import VoiceInput from '../features/diagnosis/VoiceInput.jsx';
import FarmSelect from '../features/farms/FarmSelect.jsx';
import { useImageCompress } from '../hooks/useImageCompress.js';
import { useLanguage } from '../hooks/useAuth.js';
import { getDiagnosis, submitDiagnosis } from '../services/diagnosisService.js';
import { listFarms } from '../services/farmService.js';
import { CROPS, MAX_SYMPTOMS, POLL_INTERVAL_MS, POLL_MAX_MS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

const DONE = ['completed', 'failed'];

export default function DiagnosisPage() {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const { compress, compressing } = useImageCompress();
  const [farmId, setFarmId] = useState('');
  const [crop, setCrop] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [diagnosisId, setDiagnosisId] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  const farms = useQuery({ queryKey: ['farms'], queryFn: () => listFarms() });

  // Poll every 2 seconds until the result is ready, for at most 60 seconds.
  const diagnosis = useQuery({
    queryKey: ['diagnosis', diagnosisId],
    queryFn: () => getDiagnosis(diagnosisId),
    enabled: Boolean(diagnosisId),
    refetchInterval: (query) =>
      timedOut || DONE.includes(query.state.data?.status) ? false : POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (!diagnosisId) return undefined;
    const timer = setTimeout(() => setTimedOut(true), POLL_MAX_MS);
    return () => clearTimeout(timer);
  }, [diagnosisId]);

  useEffect(() => {
    if (DONE.includes(diagnosis.data?.status)) queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
  }, [diagnosis.data?.status, queryClient]);

  const submit = useMutation({
    mutationFn: async () => {
      const image = file ? await compress(file) : undefined;
      return submitDiagnosis({ farmId, crop, symptoms: symptoms.trim(), image });
    },
    onSuccess: (data) => {
      setTimedOut(false);
      setDiagnosisId(data.diagnosis_id);
    },
  });

  const onSubmit = () => {
    setFormError('');
    if (!farmId) return setFormError(t('diagnosis.choose_farm'));
    if (!file && !symptoms.trim()) return setFormError(t('diagnosis.add_photo_or_symptoms'));
    submit.mutate();
  };

  const busy = submit.isPending || compressing;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('diagnosis.title')}</h1>

      <section className="card space-y-4">
        {farms.isLoading ? <Loader /> : <FarmSelect farms={farms.data} value={farmId} onChange={setFarmId} />}
        {farms.data?.length === 0 && <Alert type="info">{t('diagnosis.no_farms')}</Alert>}
        <Select label={t('diagnosis.crop_optional')} options={CROPS.map((c) => ({ value: c, label: humanize(c) }))} placeholder={t('diagnosis.not_sure')} value={crop} onChange={(e) => setCrop(e.target.value)} />
        <ImageUploader file={file} onChange={setFile} onError={setFormError} />
        <div className="space-y-2">
          <Textarea label={t('diagnosis.describe')} value={symptoms} maxLength={MAX_SYMPTOMS} onChange={(e) => setSymptoms(e.target.value)} placeholder={t('diagnosis.symptoms_hint')} />
          <VoiceInput />
        </div>
        <Alert type="error">{formError || (submit.error && errorMessage(submit.error))}</Alert>
        <Button className="w-full" onClick={onSubmit} loading={busy}>
          {t('diagnosis.submit')}
        </Button>
      </section>

      {diagnosisId && (
        <section aria-label={t('diagnosis.result')}>
          {diagnosis.error ? (
            <Alert type="error">{errorMessage(diagnosis.error)}</Alert>
          ) : (
            <DiagnosisResult diagnosis={diagnosis.data} timedOut={timedOut} />
          )}
        </section>
      )}

      <SymptomChat farmId={farmId} language={language} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('diagnosis.recent')}</h2>
        <DiagnosisHistory farmId={farmId} onSelect={(id) => { setTimedOut(false); setDiagnosisId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      </section>
    </div>
  );
}
