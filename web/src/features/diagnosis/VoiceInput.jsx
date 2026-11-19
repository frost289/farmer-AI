import { useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useAuth.js';

/**
 * Browser speech-to-text (Web Speech API). Chichewa is not supported by the current browser
 * speech workflow; dedicated Chichewa ASR will come from the later speech service.
 */
export default function VoiceInput({ onText, lang = 'en-US' }) {
  const { language, t } = useLanguage();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef(null);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (language === 'ny') {
    return <p className="text-sm text-gray-500">{t('voice.chichewa_unavailable')}</p>;
  }
  if (!Recognition) return null;

  const toggle = () => {
    if (listening) return recognitionRef.current?.stop();
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.onresult = (e) => onText(e.results[0][0].transcript);
    rec.onerror = () => setMessage(t('voice.error'));
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMessage('');
    setListening(true);
    rec.start();
  };

  return (
    <div>
      <Button variant="secondary" onClick={toggle} aria-pressed={listening}>
        {listening ? `⏹ ${t('voice.stop')}` : `🎤 ${t('voice.speak')}`}
      </Button>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
