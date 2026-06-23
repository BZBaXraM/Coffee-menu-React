import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { API_URL } from '../api.js';

export default function CartDrawer({ open, onClose }) {
  const { tl, formatPrice, convertPrice, currency, settings, t } = useApp();
  const { items, updateQty, remove, clear, totalAZN } = useCart();

  const table = useMemo(
    () => new URLSearchParams(window.location.search).get('table'),
    []
  );

  const submitOrder = async () => {
    if (!items.length) return;
    const lines = items.map((i) => `• ${tl(i.name)} ×${i.qty} — ${formatPrice(i.price * i.qty)}`);
    const totalStr = formatPrice(totalAZN);
    const header = tl(settings.restaurant_name) || 'Coffee In Lab';
    const tableStr = table ? `\n${t.table}: #${table}` : '';
    const text = `☕ ${header}${tableStr}\n\n${t.yourOrder}:\n${lines.join('\n')}\n\n${t.total}: ${totalStr}`;

    // Persist the order (best effort)
    try {
      await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, name: tl(i.name), qty: i.qty, price: convertPrice(i.price) })),
          total: convertPrice(totalAZN),
          currency,
          table_number: table || null,
        }),
      });
    } catch { /* ignore — still open WhatsApp */ }

    const phone = (settings.whatsapp_number || '').replace(/[^\d]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-bg shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <h2 className="font-display text-xl font-bold text-ink">🛒 {t.cart}</h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs font-medium text-muted underline">{t.clear}</button>
            )}
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink">✕</button>
          </div>
        </div>

        {table && (
          <div className="border-b border-line bg-surface-2 px-4 py-2 text-xs font-medium text-muted">
            🪑 {t.table}: <span className="text-ink">#{table}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-muted">
              <div>
                <div className="mb-2 text-5xl opacity-40">☕</div>
                <p className="text-sm">{t.emptyCart}</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-xl border border-line bg-surface p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-2 text-2xl">
                    {i.image ? <img src={i.image} alt="" className="h-full w-full rounded-lg object-cover" /> : (i.icon || '☕')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{tl(i.name)}</div>
                    <div className="text-xs text-accent">{formatPrice(i.price)}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button onClick={() => updateQty(i.id, i.qty - 1)} className="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-ink">−</button>
                      <span className="w-6 text-center text-sm font-semibold text-ink">{i.qty}</span>
                      <button onClick={() => updateQty(i.id, i.qty + 1)} className="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-ink">+</button>
                      <button onClick={() => remove(i.id)} className="ml-auto text-xs text-muted">🗑</button>
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-sm font-bold text-ink">{formatPrice(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">{t.total}</span>
              <span className="font-display text-2xl font-bold text-ink">{formatPrice(totalAZN)}</span>
            </div>
            <button
              onClick={submitOrder}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white active:scale-[0.99]"
            >
              <span className="text-lg">💬</span> {t.order}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
