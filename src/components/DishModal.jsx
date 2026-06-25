import { useApp } from '../context/AppContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { assetUrl } from '../api.js';

export default function DishModal({ dish, icon, onClose }) {
  const { tl, formatPrice, t } = useApp();
  const { add } = useCart();
  if (!dish) return null;

  const ingredients = tl(dish.ingredients);
  const ingList = Array.isArray(ingredients) ? ingredients : [];

  const nutrition = [
    [t.calories, dish.calories, 'kcal'],
    [t.protein, dish.protein, 'g'],
    [t.fat, dish.fat, 'g'],
    [t.carbs, dish.carbs, 'g'],
  ].filter(([, v]) => v != null && v !== 0);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface sm:rounded-3xl"
      >
        <div className="relative grid h-56 place-items-center overflow-hidden bg-surface-2 sm:h-64">
          {dish.image ? (
            <img src={assetUrl(dish.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="text-7xl">{icon || '☕'}</span>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/80 text-ink"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-ink">{tl(dish.name)}</h2>
            <span className="whitespace-nowrap font-display text-xl font-bold text-accent">{formatPrice(dish.price)}</span>
          </div>
          {tl(dish.description) && <p className="text-sm text-muted">{tl(dish.description)}</p>}

          {dish.weight ? (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-muted">⚖️ {dish.weight} ml/g</span>
            </div>
          ) : null}

          {ingList.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.ingredients}</h3>
              <div className="flex flex-wrap gap-1.5">
                {ingList.map((ing, i) => (
                  <span key={i} className="rounded-lg border border-line bg-bg px-2.5 py-1 text-xs text-ink">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {nutrition.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.nutrition}</h3>
              <div className="grid grid-cols-4 gap-2">
                {nutrition.map(([label, val, unit]) => (
                  <div key={label} className="rounded-xl bg-surface-2 p-2 text-center">
                    <div className="font-display text-base font-bold text-ink">{val}{unit === 'g' ? 'g' : ''}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { add(dish); onClose(); }}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-accent-ink active:scale-[0.99]"
          >
            + {t.add} · {formatPrice(dish.price)}
          </button>
        </div>
      </div>
    </div>
  );
}
