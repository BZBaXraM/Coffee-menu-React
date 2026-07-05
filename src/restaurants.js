export const DEFAULT_RESTAURANT_SLUG = 'coffee-in-lab';

export const restaurants = [
  {
    slug: 'coffee-in-lab',
    name: 'Coffee In Lab',
    category: 'Kafe menyusu',
    description: 'Coffee In Lab ucun aktiv QR menyu sehifesi.',
    logo: '/coffee-logo.png',
    accentColor: '#9C6B3F',
    apiBase: 'https://coffee-menu.bahram.site',
    tags: ['QR menyu', 'Sifaris', 'Aktiv'],
    settings: {
      restaurant_name: JSON.stringify({
        en: 'Coffee In Lab',
        ru: 'Coffee In Lab',
        az: 'Coffee In Lab',
        tr: 'Coffee In Lab',
      }),
      accent_color: '#9C6B3F',
      logo_image: '/coffee-logo.png',
    },
  },
];

export function getRestaurantBySlug(slug) {
  return restaurants.find((restaurant) => restaurant.slug === slug) || null;
}

export function restaurantSlugFromPath(pathname) {
  const [segment] = pathname.split('/').filter(Boolean);
  if (!segment || segment === 'admin') return null;
  return segment;
}

export function localizedText(value, language = 'az') {
  if (value == null) return '';
  if (typeof value === 'object') return value[language] || value.az || value.en || Object.values(value)[0] || '';
  return String(value);
}
