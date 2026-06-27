import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Navbar from '../components/Navbar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import DishCard from '../components/DishCard.jsx';
import DishModal from '../components/DishModal.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import AIChat from '../components/AIChat.jsx';
import ContactBar from '../components/ContactBar.jsx';
import RestaurantInfo from '../components/RestaurantInfo.jsx';
import Pagination from '../components/Pagination.jsx';
import PromotionBanner from '../components/PromotionBanner.jsx';
import { API_URL } from '../api.js';

export default function MenuPage() {
  const { tl, t, settings } = useApp();
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [modalDish, setModalDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/menu/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/menu/promotions`).then((r) => r.json()).then(setPromotions).catch(() => {});
  }, []);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => { setPage(1); }, [activeCat, debounced]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (activeCat) params.set('category_id', String(activeCat));
    if (debounced) params.set('search', debounced);
    fetch(`${API_URL}/menu/dishes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setDishes(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeCat, debounced]);

  const categoryFor = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c; });
    return (id) => map[id] || null;
  }, [categories]);

  // Categories hidden from the menu (matched by their English name).
  const hiddenCatIds = useMemo(() => {
    const HIDDEN = ['Signature Drinks'];
    const ids = new Set();
    categories.forEach((c) => {
      let en = '';
      try { en = JSON.parse(c.name)?.en || ''; } catch { en = c.name || ''; }
      if (HIDDEN.includes(en)) ids.add(c.id);
    });
    return ids;
  }, [categories]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => !hiddenCatIds.has(c.id)),
    [categories, hiddenCatIds],
  );
  const visibleDishes = useMemo(
    () => dishes.filter((d) => !hiddenCatIds.has(d.category_id)),
    [dishes, hiddenCatIds],
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar onCartOpen={() => setCartOpen(true)} onSearch={setSearch} search={search} />

      <main className="mx-auto max-w-5xl px-4 pb-12">
        <section className="py-6 text-center">
          <img src="/coffee-logo.png" alt="" className="mx-auto mb-3 h-16 w-16 rounded-full object-cover shadow-sm" />
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {tl(settings.restaurant_name) || 'Coffee In Lab'}
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">{t.specialty}</p>
          <p className="mt-1 font-display text-sm italic text-accent">{t.tagline}</p>
          <ContactBar />
        </section>

        <PromotionBanner promotions={promotions} />

        <div id="menu" className="sticky top-[58px] z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur">
          <CategoryFilter categories={visibleCategories} active={activeCat} onChange={setActiveCat} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
            ))}
          </div>
        ) : visibleDishes.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.noResults}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleDishes.map((d) => (
              <DishCard key={d.id} dish={d} category={categoryFor(d.category_id)} onOpen={setModalDish} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>

      <RestaurantInfo />

      <AIChat />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {modalDish && (
        <DishModal dish={modalDish} category={categoryFor(modalDish.category_id)} onClose={() => setModalDish(null)} />
      )}
    </div>
  );
}
