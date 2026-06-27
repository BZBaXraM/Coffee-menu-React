import { Link } from 'react-router-dom';
import { restaurants } from '../restaurants.js';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/coffee-logo.png" alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <div className="font-display text-xl font-bold">Menyu QR</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Restoran menyulari</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Menyu QR</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            Restorani secin ve QR menyuya daxil olun. Her restoranin oz sehifesi,
            oz menyusu ve oz sifaris axini var.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Restaurants">
          {restaurants.map((restaurant) => {
            const content = (
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
                <div className="flex items-start gap-4 p-4">
                  <img src={restaurant.logo || '/coffee-logo.png'} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-display text-xl font-bold text-ink">{restaurant.name}</h2>
                      {restaurant.comingSoon ? (
                        <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                          Tezlikle
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{restaurant.category}</p>
                  </div>
                </div>
                <p className="flex-1 px-4 text-sm leading-relaxed text-muted">{restaurant.description}</p>
                <div className="flex flex-wrap gap-2 p-4">
                  {(restaurant.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="border-t border-line px-4 py-3 text-sm font-semibold text-accent">
                  {restaurant.comingSoon ? 'Melumat sehifesine bax' : 'Menyunu ac'}
                </div>
              </article>
            );

            return (
              <Link key={restaurant.slug} to={`/${restaurant.slug}`} className="block">
                {content}
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
