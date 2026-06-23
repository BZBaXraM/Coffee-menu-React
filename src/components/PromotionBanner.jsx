import { useApp } from '../context/AppContext.jsx';

export default function PromotionBanner({ promotions }) {
  const { tl } = useApp();
  if (!promotions?.length) return null;
  const p = promotions[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-accent to-[#6e4a2a] p-5 text-accent-ink">
      <div className="absolute -right-6 -top-6 text-8xl opacity-10">☕</div>
      <div className="relative">
        <h2 className="font-display text-xl font-bold">{tl(p.title)}</h2>
        {tl(p.description) && <p className="mt-1 text-sm opacity-90">{tl(p.description)}</p>}
        {p.discount_percent > 0 && (
          <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
            −{p.discount_percent}%
          </span>
        )}
      </div>
    </div>
  );
}
