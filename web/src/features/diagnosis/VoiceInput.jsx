import { useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';

/**
 * Browser speech-to-text (Web Speech API). Chichewa is not supported by browsers yet;
 * dedicated Chichewa ASR will come from the speech service (ai-services/speech).
 */
export default function VoiceInput({ onText, lang = 'en-US' }) {
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
    rec.onerror = () => setMessage('Could not hear you. Please try again.');
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMessage('');
    setListening(true);
    rec.start();
  };

  return (
    <div>
      <Button variant="secondary" onClick={toggle} aria-pressed={listening}>
        {listening ? '⏹ Stop' : '🎤 Speak'}
      </Button>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
