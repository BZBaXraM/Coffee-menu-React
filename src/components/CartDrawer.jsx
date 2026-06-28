import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { assetUrl } from '../api.js';

export default function CartDrawer({ open, onClose }) {
  const { tl, formatPrice, convertPrice, currency, settings, t, apiUrl, apiBase } = useApp();
  const { items, updateQty, remove, clear, totalAZN } = useCart();

  const table = useMemo(
    () => new URLSearchParams(window.location.search).get('table'),
    []
  );

  const submitOrder = async () => {
    if (!items.length) return;
    const lines = items.map((i) => `• ${tl(i.name)}${i.size ? ` (${i.size})` : ''} ×${i.qty} — ${formatPrice(i.price * i.qty)}`);
    const totalStr = formatPrice(totalAZN);
    const header = tl(settings.restaurant_name) || 'Coffee In Lab';
    const tableStr = table ? `\n${t.table}: #${table}` : '';
    const text = `☕ ${header}${tableStr}\n\n${t.yourOrder}:\n${lines.join('\n')}\n\n${t.total}: ${totalStr}`;

    // Persist the order (best effort)
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, name: tl(i.name), size: i.size || null, qty: i.qty, price: convertPrice(i.price) })),
            total: convertPrice(totalAZN),
            currency,
            table_number: table || null,
          }),
        });
      } catch { /* ignore — still open WhatsApp */ }
    }

    const phone = (settings.whatsapp_number || '').replace(/[^\d]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex max-h-[88vh] w-full max-w-lg animate-[cartbar-in_0.25s_ease-out] flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:max-h-[85vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-bold text-ink">🛒 {t.cart}</h2>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-lg text-ink transition hover:bg-surface-2"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        {table && (
          <div className="border-b border-line bg-surface-2 px-5 py-2 text-xs font-medium text-muted">
            🪑 {t.table}: <span className="text-ink">#{table}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="grid place-items-center py-16 text-center text-muted">
              <div>
                <div className="mb-2 text-5xl opacity-40">☕</div>
                <p className="text-sm">{t.emptyCart}</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3 py-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 text-2xl">
                    {i.image ? <img src={assetUrl(i.image, apiBase)} alt="" className="h-full w-full object-cover" /> : (i.icon || '☕')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base font-semibold text-ink">
                      {tl(i.name)}
                      {i.size ? <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">{i.size}</span> : null}
                    </div>
                    <div className="text-sm text-muted">{formatPrice(i.price)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface-2 px-1">
                    <button onClick={() => updateQty(i.key, i.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full text-lg text-ink transition hover:bg-surface" aria-label="−">−</button>
                    <span className="w-6 text-center text-sm font-bold text-ink">{i.qty}</span>
                    <button onClick={() => updateQty(i.key, i.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full text-lg text-ink transition hover:bg-surface" aria-label="+">+</button>
                  </div>
                  <div className="w-16 shrink-0 text-right font-display text-base font-bold text-accent">{formatPrice(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base text-muted">{t.grandTotal}</span>
              <span className="font-display text-3xl font-bold text-accent">{formatPrice(totalAZN)}</span>
            </div>
            <button
              onClick={clear}
              className="mb-3 w-full rounded-full border border-line bg-surface py-3.5 font-semibold text-ink transition hover:bg-surface-2"
            >
              🗑 {t.clearCart}
            </button>
            <button
              onClick={submitOrder}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#1da851] py-4 text-lg font-semibold text-white shadow-lg transition active:scale-[0.99]"
            >
              <span className="text-xl">💬</span> {t.orderViaWhatsapp}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
