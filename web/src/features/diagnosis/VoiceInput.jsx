import { Mic, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';

/**
 * Browser speech-to-text (Web Speech API). Chichewa is not supported by browsers yet;
 * dedicated Chichewa ASR will come from the speech service (ai-services/speech).
 * compact = round icon-only button (for chat boxes).
 */
export default function VoiceInput({ onText, lang = 'en-US', compact = false }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef(null);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) return null;

  const toggle = () => {
    if (listening) return recognitionRef.current?.stop();
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.onresult = (e) => onText(e.results[0][0].transcript);
    rec.onerror = () => setMessage('We could not hear you. Please try again.');
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMessage('');
    setListening(true);
    rec.start();
  };

  const Icon = listening ? Square : Mic;

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? 'Stop listening' : 'Speak your question'}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${listening ? 'bg-red-600 text-white' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div>
      <Button variant="secondary" icon={Icon} onClick={toggle} aria-pressed={listening}>
        {listening ? 'Stop' : 'Speak'}
      </Button>
      {message && <p className="mt-1 text-base text-gray-600 dark:text-slate-300">{message}</p>}
    </div>
  );
}
