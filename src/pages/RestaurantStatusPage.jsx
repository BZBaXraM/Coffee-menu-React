import { Link } from 'react-router-dom';
import { getRestaurantBySlug } from '../restaurants.js';

export default function RestaurantStatusPage({ slug }) {
  const restaurant = getRestaurantBySlug(slug);
  const title = restaurant ? restaurant.name : 'Mekan tapilmadi';
  const message = restaurant?.comingSoon
    ? `${restaurant.name} yaxin zamanda platformada aktiv olacaq.`
    : 'Bu URL ucun aktiv mekan tapilmadi.';

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f5f7] px-4 text-center text-[#111827]">
      <main className="w-full max-w-md rounded-lg border border-[#d9dde3] bg-white p-6 shadow-sm">
        <img
          src={restaurant?.logo || '/coffee-logo.png'}
          alt=""
          className="mx-auto mb-5 max-h-28 max-w-44 rounded-md object-contain"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          {restaurant?.category || 'Platform'}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#4b5563]">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
        >
          Geri qayit
        </Link>
      </main>
    </div>
  );
}
