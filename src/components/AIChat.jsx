import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { API_URL } from '../api.js';

export default function AIChat() {
  const { language, tl, formatPrice, t } = useApp();
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((p) => [...p, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language, history }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: 'assistant', content: data.reply, dishes: data.dishes || [] }]);
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: '⚠️', dishes: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = (d) => {
    add(d);
    setAddedId(d.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <>
      <div className="group fixed bottom-5 right-5 z-40">
        {!open && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-bg opacity-0 shadow-lg transition group-hover:opacity-100">
            {t.askAI}
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-accent-ink shadow-lg shadow-black/20 active:scale-95"
          aria-label={t.askAI}
        >
          {open ? '✕' : '✨'}
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
            <span className="text-xl">✨</span>
            <div className="font-display font-semibold text-ink">{t.askAI}</div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="px-2 pt-6 text-center text-sm text-muted">{t.aiPlaceholder}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink'
                  }`}
                >
                  {m.content}
                </span>
                {m.dishes && m.dishes.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.dishes.map((d) => (
                      <div key={d.id} className="flex items-center gap-2 rounded-xl border border-line bg-bg p-2">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-lg">
                          {d.image ? <img src={d.image} alt="" className="h-full w-full rounded-lg object-cover" /> : '☕'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-ink">{tl(d.name)}</div>
                          <div className="text-[11px] text-accent">{formatPrice(d.price)}</div>
                        </div>
                        <button
                          onClick={() => quickAdd(d)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${addedId === d.id ? 'bg-emerald-600 text-white' : 'bg-accent text-accent-ink'}`}
                        >
                          {addedId === d.id ? '✓' : `+ ${t.add}`}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-left"><span className="inline-block rounded-2xl bg-surface-2 px-3 py-2 text-sm text-muted">●●●</span></div>}
          </div>

          <div className="flex gap-2 border-t border-line p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t.aiPlaceholder}
              className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent"
            />
            <button onClick={send} disabled={loading} className="rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink disabled:opacity-50">
              {t.send}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
