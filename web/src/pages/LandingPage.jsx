import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VoiceInput from '../features/diagnosis/VoiceInput.jsx';
import { useAuth, useLanguage } from '../hooks/useAuth.js';
import { askPublic } from '../services/publicService.js';
import { MAX_QUESTION } from '../utils/constants.js';
import { errorMessage } from '../utils/formatters.js';

const SUGGESTIONS = [
  { icon: '🌽', text: 'When should I plant maize this season?' },
  { icon: '🐛', text: 'How do I control fall armyworm on maize?' },
  { icon: '🌱', text: 'Which crops grow well in sandy soil?' },
  { icon: '🌧️', text: 'How can I protect my crops from drought?' },
];

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white" aria-hidden="true">
      🌱
    </span>
  );
}

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
    <div className="flex h-[100dvh] flex-col bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <img src="/logo.svg" alt="" className="h-8 w-8" /> FarmAI
        </span>
        <div className="flex items-center gap-2">
          {!empty && (
            <button onClick={newChat} className="min-h-[44px] rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              ✏️ New chat
            </button>
          )}
          {user ? (
            <Link to="/dashboard" className="min-h-[44px] rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                Log in
              </Link>
              <Link to="/register" className="min-h-[44px] rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {empty ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <img src="/logo.svg" alt="" className="h-14 w-14" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">How can I help your farm today?</h1>
              <p className="mt-2 max-w-md text-gray-600">
                Ask about crops, pests, diseases, planting time and more. No login needed.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="flex min-h-[56px] items-center gap-3 rounded-xl border border-gray-200 p-3 text-left text-sm hover:border-brand-500 hover:bg-brand-50"
                  >
                    <span className="text-xl" aria-hidden="true">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
              <Link to="/diagnosis" className="mt-4 text-sm font-semibold text-brand-700">
                📷 Check a crop photo (login required)
              </Link>
            </div>
          ) : (
            <div className="space-y-6" aria-live="polite">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-brand-600 px-4 py-2 text-white">
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <Avatar />
                    <p className={`max-w-[85%] whitespace-pre-wrap pt-1 ${m.failed ? 'text-red-700' : 'text-gray-900'}`}>{m.text}</p>
                  </div>
                ),
              )}
              {pending && (
                <div className="flex items-center gap-3">
                  <Avatar />
                  <span className="flex gap-1" role="status" aria-label="FarmAI is typing">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white px-4 pb-3 pt-3">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm focus-within:border-brand-600">
            <textarea
              ref={inputRef}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={MAX_QUESTION}
              placeholder="Ask FarmAI anything about farming..."
              aria-label="Your question"
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-base outline-none"
            />
            <VoiceInput onText={(t) => setInput((v) => `${v} ${t}`.trim())} />
            <button
              onClick={() => send()}
              disabled={!input.trim() || pending}
              aria-label="Send question"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl text-white disabled:bg-gray-300"
            >
              ↑
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            Chats are not saved. FarmAI can make mistakes; for serious crop problems, ask your extension officer.{' '}
            {!user && (
              <Link to="/register" className="font-semibold text-brand-700">
                Sign up to save your farms and check crop photos.
              </Link>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
