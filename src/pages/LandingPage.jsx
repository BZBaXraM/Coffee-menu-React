import { Link } from 'react-router-dom';
import { restaurants } from '../restaurants.js';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
      <header className="border-b border-[#d9dde3] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#111827] text-sm font-bold text-white">
              QR
            </span>
            <div>
              <div className="text-lg font-bold leading-tight">menyuqr.com</div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Menu platformasi
              </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <section className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Mekanlar</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Menyu secin</h1>
          <p className="mt-3 text-sm leading-6 text-[#4b5563] sm:text-base">
            Platformadaki aktiv menyular ve yaxinda elave olunacaq mekanlar burada gorunur.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2" aria-label="Restaurants">
          {restaurants.map((restaurant) => (
            <Link key={restaurant.slug} to={`/${restaurant.slug}`} className="block">
              <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#d9dde3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#b8c0cc] hover:shadow-md">
                <div className="grid h-44 place-items-center border-b border-[#e5e7eb] bg-[#f9fafb] p-5">
                  <img
                    src={restaurant.logo}
                    alt=""
                    className="max-h-32 max-w-full rounded-md object-contain"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-[#111827]">{restaurant.name}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                        {restaurant.category}
                      </p>
                    </div>
                    {restaurant.comingSoon ? (
                      <span className="shrink-0 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8]">
                        Coming soon
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-semibold text-[#15803d]">
                        Aktiv
                      </span>
                    )}
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-[#4b5563]">{restaurant.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(restaurant.tags || []).map((tag) => (
                      <span key={tag} className="rounded-md border border-[#e5e7eb] px-2.5 py-1 text-xs text-[#4b5563]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-[#e5e7eb] pt-4 text-sm font-semibold text-[#111827]">
                    {restaurant.comingSoon ? 'Melumat sehifesine bax' : 'Menyunu ac'}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
