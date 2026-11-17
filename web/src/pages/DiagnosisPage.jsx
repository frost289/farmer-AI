import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Cube3D from '../components/common/Cube3D.jsx';
import { Select, Textarea } from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import Reveal from '../components/common/Reveal.jsx';
import DiagnosisHistory from '../features/diagnosis/DiagnosisHistory.jsx';
import DiagnosisResult from '../features/diagnosis/DiagnosisResult.jsx';
import DiagnosisSteps from '../features/diagnosis/DiagnosisSteps.jsx';
import ImageUploader from '../features/diagnosis/ImageUploader.jsx';
import SymptomChat from '../features/diagnosis/SymptomChat.jsx';
import VoiceInput from '../features/diagnosis/VoiceInput.jsx';
import FarmSelect from '../features/farms/FarmSelect.jsx';
import { useLanguage } from '../hooks/useAuth.js';
import { useImageCompress } from '../hooks/useImageCompress.js';
import { getDiagnosis, submitDiagnosis } from '../services/diagnosisService.js';
import { listFarms } from '../services/farmService.js';
import { CROPS, MAX_SYMPTOMS, POLL_INTERVAL_MS, POLL_MAX_MS } from '../utils/constants.js';
import { errorMessage, humanize } from '../utils/formatters.js';

const DONE = ['completed', 'failed'];

function AnalyzingPanel() {
  return (
    <div className="card flex flex-col items-center gap-8 py-12 text-center" role="status" aria-live="polite">
      <Cube3D size={88} />
      <div>
        <p className="text-2xl font-extrabold">We are checking your crop</p>
        <p className="muted mt-1 text-lg">This takes a few seconds. Please wait.</p>
      </div>
    </div>
  );
}

export default function DiagnosisPage() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
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

  const status = diagnosis.data?.status;
  useEffect(() => {
    if (DONE.includes(status)) queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
  }, [status, queryClient]);

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
    if (!farmId) return setFormError('Please choose a farm first.');
    if (!file && !symptoms.trim()) return setFormError('Add a photo, or write what you see.');
    submit.mutate();
  };

  const startAgain = () => {
    setDiagnosisId(null);
    setFile(null);
    setSymptoms('');
    setFormError('');
    setTimedOut(false);
  };

  const finished = DONE.includes(status) || (diagnosisId && timedOut);
  const step = !diagnosisId ? 1 : finished ? 3 : 2;
  const busy = submit.isPending || compressing;

  return (
    <div className="space-y-8">
      <h1 className="page-title">Check My Crop</h1>

      <Reveal>
        <div className="card">
          <DiagnosisSteps current={step} />
        </div>
      </Reveal>

      {step === 1 && (
        <Reveal delay={80}>
          <section className="card space-y-6">
            {farms.isLoading ? <Loader /> : <FarmSelect farms={farms.data} value={farmId} onChange={setFarmId} />}
            {farms.data?.length === 0 && <Alert type="info">Please add a farm on the Dashboard first.</Alert>}
            <Select
              label="Which crop? (you can skip this)"
              options={CROPS.map((c) => ({ value: c, label: humanize(c) }))}
              placeholder="I am not sure"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            />
            <ImageUploader file={file} onChange={setFile} onError={setFormError} />
            <div className="space-y-3">
              <Textarea
                label="Or write what you see (you can skip this)"
                value={symptoms}
                maxLength={MAX_SYMPTOMS}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="For example: yellow stripes on young maize leaves"
              />
              <VoiceInput onText={(t) => setSymptoms((s) => `${s} ${t}`.trim())} />
            </div>
            <Alert type="error">{formError || (submit.error && errorMessage(submit.error))}</Alert>
            <Button icon={Search} className="w-full !min-h-[64px] text-xl" onClick={onSubmit} loading={busy}>
              Check my crop now
            </Button>
          </section>
        </Reveal>
      )}

      {step === 2 && <AnalyzingPanel />}

      {step === 3 && (
        <section className="space-y-4" aria-label="Result">
          {diagnosis.error ? (
            <Alert type="error">{errorMessage(diagnosis.error)}</Alert>
          ) : (
            <DiagnosisResult diagnosis={diagnosis.data} timedOut={timedOut} />
          )}
          <Button variant="secondary" icon={RotateCcw} onClick={startAgain}>
            Check another crop
          </Button>
        </section>
      )}

      <SymptomChat farmId={farmId} language={language} />

      <section className="space-y-4">
        <h2 className="section-title">Recent checks</h2>
        <DiagnosisHistory
          farmId={farmId}
          onSelect={(id) => {
            setTimedOut(false);
            setDiagnosisId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>
    </div>
  );
}
