import { ArrowUp, Bug, Camera, CloudRain, Plus, Sprout, Wheat } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Cube3D from '../components/common/Cube3D.jsx';
import Logo from '../components/common/Logo.jsx';
import Reveal from '../components/common/Reveal.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import VoiceInput from '../features/diagnosis/VoiceInput.jsx';
import { useAuth, useLanguage } from '../hooks/useAuth.js';
import { askPublic } from '../services/publicService.js';
import { MAX_QUESTION } from '../utils/constants.js';
import { errorMessage } from '../utils/formatters.js';

const SUGGESTIONS = [
  { icon: Wheat, text: 'When should I plant maize this season?' },
  { icon: Bug, text: 'How do I control fall armyworm on maize?' },
  { icon: Sprout, text: 'Which crops grow well in sandy soil?' },
  { icon: CloudRain, text: 'How can I protect my crops from drought?' },
];

function Avatar() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
      aria-hidden="true"
    >
      <Sprout className="h-6 w-6" />
    </span>
  );
}

const linkBtn =
  'inline-flex min-h-[48px] items-center rounded-xl px-4 text-lg font-semibold';

export default function LandingPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  // Messages live only in this component's memory: a refresh or "New chat" clears them.
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  const resetHeight = () => {
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || pending) return;
    setInput('');
    resetHeight();
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setPending(true);
    try {
      const data = await askPublic({ question, language });
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: errorMessage(err), failed: true }]);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const newChat = () => {
    setMessages([]);
    setInput('');
    resetHeight();
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-slate-700">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {!empty && (
            <button
              onClick={newChat}
              className={`${linkBtn} gap-2 text-slate-800 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800`}
            >
              <Plus className="h-6 w-6" aria-hidden="true" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
          {user ? (
            <Link to="/dashboard" className={`${linkBtn} bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={`${linkBtn} text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800`}>
                Log in
              </Link>
              <Link to="/register" className={`${linkBtn} bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950`}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {empty ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <Reveal>
                <div className="mb-10 flex justify-center">
                  <Cube3D size={84} />
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="page-title sm:text-4xl">How can I help your farm today?</h1>
                <p className="muted mx-auto mt-3 max-w-md text-xl">
                  Ask about crops, pests, diseases and planting time. You do not need to log in.
                </p>
              </Reveal>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
                  <Reveal key={text} delay={200 + i * 80}>
                    <button
                      onClick={() => send(text)}
                      className="flex min-h-[72px] w-full items-center gap-4 rounded-2xl border-2 border-stone-200 p-4 text-left text-lg transition hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:border-emerald-400 dark:hover:bg-slate-800"
                    >
                      <span className="icon-tile">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      {text}
                    </button>
                  </Reveal>
                ))}
              </div>
              <Link to="/diagnosis" className="mt-6 inline-flex min-h-[48px] items-center gap-2 text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                <Camera className="h-6 w-6" aria-hidden="true" />
                Check a crop photo (log in first)
              </Link>
            </div>
          ) : (
            <div className="space-y-6" aria-live="polite">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div
                    key={i}
                    className="animate-fade-up ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-emerald-600 px-4 py-3 text-lg text-white dark:bg-emerald-500 dark:text-slate-950"
                  >
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="animate-fade-up flex gap-3">
                    <Avatar />
                    <p className={`max-w-[88%] whitespace-pre-wrap pt-1.5 text-lg ${m.failed ? 'text-red-700 dark:text-red-300' : ''}`}>{m.text}</p>
                  </div>
                ),
              )}
              {pending && (
                <div className="flex items-center gap-3">
                  <Avatar />
                  <span className="flex gap-1.5" role="status" aria-label="FarmAI is writing">
                    <span className="h-3 w-3 animate-bounce rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    <span className="h-3 w-3 animate-bounce rounded-full bg-emerald-600 [animation-delay:150ms] dark:bg-emerald-400" />
                    <span className="h-3 w-3 animate-bounce rounded-full bg-emerald-600 [animation-delay:300ms] dark:bg-emerald-400" />
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 pb-3 pt-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-3xl border-2 border-stone-300 bg-white p-2 shadow-sm focus-within:border-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-emerald-400">
            <textarea
              ref={inputRef}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={MAX_QUESTION}
              placeholder="Ask FarmAI anything about farming..."
              aria-label="Your question"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <VoiceInput compact onText={(t) => setInput((v) => `${v} ${t}`.trim())} />
            <button
              onClick={() => send()}
              disabled={!input.trim() || pending}
              aria-label="Send question"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 dark:bg-emerald-500 dark:text-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
            >
              <ArrowUp className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <p className="muted mt-2 text-center text-sm">
            Chats are not saved. FarmAI can make mistakes. For serious crop problems, ask your extension officer.{' '}
            {!user && (
              <Link to="/register" className="font-semibold text-emerald-800 underline dark:text-emerald-300">
                Sign up to save your farms and check crop photos.
              </Link>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
