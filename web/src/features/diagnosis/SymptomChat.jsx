import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { Textarea } from '../../components/common/Input.jsx';
import { ask } from '../../services/advisoryService.js';
import { MAX_QUESTION } from '../../utils/constants.js';
import { errorMessage } from '../../utils/formatters.js';
import VoiceInput from './VoiceInput.jsx';

/** Ask FarmAI a farming question and read the answer. */
export default function SymptomChat({ farmId, language }) {
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
    <section className="card space-y-4">
      <h2 className="section-title">
        <MessageCircle className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        Ask FarmAI
      </h2>
      <div className="space-y-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className="animate-fade-up space-y-2 text-lg">
            <p className="ml-auto max-w-[90%] rounded-2xl bg-emerald-600 p-3 text-white dark:bg-emerald-500 dark:text-slate-950">{m.q}</p>
            <p
              className={`max-w-[90%] rounded-2xl p-3 ${
                m.failed ? 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100' : 'bg-stone-100 dark:bg-slate-700'
              }`}
            >
              {m.a}
            </p>
          </div>
        ))}
      </div>
      <Textarea
        label="Your question"
        value={question}
        maxLength={MAX_QUESTION}
        onChange={(e) => setQuestion(e.target.value)}
        rows={2}
        placeholder="For example: When should I weed my maize?"
      />
      <div className="flex flex-wrap gap-3">
        <Button icon={Send} onClick={send} loading={mutation.isPending} disabled={!question.trim()}>
          Ask
        </Button>
        <VoiceInput onText={(t) => setQuestion((q) => `${q} ${t}`.trim())} />
      </div>
    </section>
  );
}
