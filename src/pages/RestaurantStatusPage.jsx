import { Link } from 'react-router-dom';
import { getRestaurantBySlug } from '../restaurants.js';

export default function RestaurantStatusPage({ slug }) {
  const restaurant = getRestaurantBySlug(slug);
  const title = restaurant ? restaurant.name : 'Restoran tapilmadi';
  const message = restaurant?.comingSoon
    ? 'Bu restoran yaxin vaxtlarda platformaya elave olunacaq.'
    : 'Bu URL ucun aktiv restoran tapilmadi.';

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 text-center text-ink">
      <main className="max-w-md">
        <img src={restaurant?.logo || '/coffee-logo.png'} alt="" className="mx-auto mb-5 h-20 w-20 rounded-full object-cover" />
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
        >
          Restoranlara qayit
        </Link>
      </main>
    </div>
  );
}
