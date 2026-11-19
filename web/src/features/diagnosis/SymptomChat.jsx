import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { Textarea } from '../../components/common/Input.jsx';
import { useLanguage } from '../../hooks/useAuth.js';
import { ask } from '../../services/advisoryService.js';
import VoiceInput from './VoiceInput.jsx';
import { MAX_QUESTION } from '../../utils/constants.js';
import { errorMessage } from '../../utils/formatters.js';

/** Ask FarmAI a farming question and read the answer. */
export default function SymptomChat({ farmId, language }) {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const mutation = useMutation({
    mutationFn: (q) => ask({ farmId, question: q, language }),
    onSuccess: (data, q) => setMessages((m) => [...m, { q, a: data.answer }]),
    onError: (err, q) => setMessages((m) => [...m, { q, a: errorMessage(err), failed: true }]),
  });

  const send = () => {
    const q = question.trim();
    if (!q) return;
    mutation.mutate(q);
    setQuestion('');
  };

  return (
    <section className="card space-y-3">
      <h2 className="text-lg font-semibold">{t('chat.title')}</h2>
      <div className="space-y-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className="space-y-1 text-sm">
            <p className="ml-auto max-w-[85%] rounded-lg bg-brand-50 p-2">{m.q}</p>
            <p className={`max-w-[85%] rounded-lg p-2 ${m.failed ? 'bg-red-50 text-red-800' : 'bg-gray-100'}`}>{m.a}</p>
          </div>
        ))}
      </div>
      <Textarea
        label={t('chat.question')}
        value={question}
        maxLength={MAX_QUESTION}
        onChange={(e) => setQuestion(e.target.value)}
        rows={2}
        placeholder={t('chat.placeholder')}
      />
      <div className="flex gap-2">
        <Button onClick={send} loading={mutation.isPending} disabled={!question.trim()}>
          {t('chat.ask')}
        </Button>
        <VoiceInput onText={(spoken) => setQuestion((q) => `${q} ${spoken}`.trim())} />
      </div>
    </section>
  );
}
