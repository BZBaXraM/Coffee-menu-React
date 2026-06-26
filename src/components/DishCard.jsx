import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { assetUrl, dishSizes } from '../api.js';
import { CategoryIcon } from '../categoryIcons.jsx';

export default function DishCard({ dish, category, onOpen }) {
  const { tl, formatPrice, t } = useApp();
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const sizes = dishSizes(dish);

  const handleAdd = (e) => {
    e.stopPropagation();
    // With size variants, let the customer pick a size in the modal.
    if (sizes.length > 0) {
      onOpen(dish);
      return;
    }
    add(dish);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article
      onClick={() => onOpen(dish)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-2">
        {dish.image ? (
          <img
            src={assetUrl(dish.image)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center transition group-hover:scale-110">
            {category ? <CategoryIcon category={category} size={44} boxed={false} /> : <span className="text-5xl opacity-80">☕</span>}
          </span>
        )}
        {dish.is_featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
            ★ {t.featured}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-base font-semibold leading-tight text-ink">{tl(dish.name)}</h3>
        <p className="line-clamp-2 flex-1 text-xs text-muted">{tl(dish.description)}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-accent">
            {formatPrice(sizes.length > 0 ? Math.min(...sizes.map((s) => s.price)) : dish.price)}
            {sizes.length > 0 ? <span className="ml-1 text-[10px] font-medium text-muted">{sizes.map((s) => s.label).join('/')}</span> : null}
          </span>
          <button
            onClick={handleAdd}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              justAdded ? 'bg-emerald-600 text-white' : 'bg-accent text-accent-ink active:scale-95'
            }`}
          >
            {justAdded ? `✓ ${t.added}` : `+ ${t.add}`}
          </button>
        </div>
      </div>
    </article>
  );
}
