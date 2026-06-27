export const DEFAULT_RESTAURANT_SLUG = 'restoran1';

const commonHours = JSON.stringify({
  monday: '09:00-22:00',
  tuesday: '09:00-22:00',
  wednesday: '09:00-22:00',
  thursday: '09:00-22:00',
  friday: '09:00-23:00',
  saturday: '10:00-23:00',
  sunday: '10:00-22:00',
});

export const restaurants = [
  {
    slug: 'restoran1',
    name: 'Coffee In Lab',
    category: 'Specialty coffee',
    description: 'Spesial qehve, iced drinkler, milkshake ve sirniyyat menyusu.',
    logo: '/coffee-logo.png',
    accentColor: '#9C6B3F',
    apiBase: 'https://coffee-menu.bahram.site',
    tags: ['Coffee', 'Dessert', 'WhatsApp order'],
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
  {
    slug: 'restoran2',
    name: 'Sahil Bistro',
    category: 'Casual dining',
    description: 'Demo restoran: isti yemekler, salatlar ve serin ickiler.',
    logo: '/coffee-logo.png',
    accentColor: '#2F7D6D',
    tags: ['Lunch', 'Drinks', 'Demo menu'],
    aiEnabled: false,
    settings: {
      restaurant_name: JSON.stringify({
        en: 'Sahil Bistro',
        ru: 'Sahil Bistro',
        az: 'Sahil Bistro',
        tr: 'Sahil Bistro',
      }),
      phone: '+994519923208',
      whatsapp_number: '+994519923208',
      instagram: '@sahil.bistro',
      wifi_name: 'SahilBistro_Guest',
      wifi_password: 'freshmenu',
      opening_hours: commonHours,
      accent_color: '#2F7D6D',
      address: 'Baki, Azerbaycan',
      logo_image: '/coffee-logo.png',
      currency_rates: JSON.stringify({ AZN: 1, USD: 0.588, EUR: 0.541, TRY: 20.1 }),
      show_currency_selector: '1',
      show_language_selector: '1',
    },
    menu: {
      categories: [
        { id: 201, name: { en: 'Main dishes', ru: 'Основные блюда', az: 'Əsas yeməklər', tr: 'Ana yemekler' }, icon: '🍽️', sort_order: 1, is_active: 1 },
        { id: 202, name: { en: 'Salads', ru: 'Салаты', az: 'Salatlar', tr: 'Salatalar' }, icon: '🥗', sort_order: 2, is_active: 1 },
        { id: 203, name: { en: 'Drinks', ru: 'Напитки', az: 'İçkilər', tr: 'İçecekler' }, icon: '🥤', sort_order: 3, is_active: 1 },
      ],
      dishes: [
        {
          id: 2001,
          category_id: 201,
          name: { en: 'Chicken Wrap', ru: 'Куриный ролл', az: 'Toyuq dürümü', tr: 'Tavuk dürüm' },
          description: { en: 'Grilled chicken, vegetables and house sauce.', ru: 'Курица гриль, овощи и фирменный соус.', az: 'Qril toyuq, tərəvəz və xüsusi sous.', tr: 'Izgara tavuk, sebze ve özel sos.' },
          price: 7.5,
          image: null,
          is_available: 1,
          is_featured: 1,
          sort_order: 1,
        },
        {
          id: 2002,
          category_id: 201,
          name: { en: 'Beef Burger', ru: 'Бургер с говядиной', az: 'Dana burger', tr: 'Dana burger' },
          description: { en: 'Beef patty, cheddar, pickles and fries.', ru: 'Котлета из говядины, чеддер, соленья и картофель.', az: 'Dana əti, çeddar, turşu və fri.', tr: 'Dana köfte, cheddar, turşu ve patates.' },
          price: 10,
          image: null,
          is_available: 1,
          is_featured: 1,
          sort_order: 2,
        },
        {
          id: 2003,
          category_id: 202,
          name: { en: 'Greek Salad', ru: 'Греческий салат', az: 'Yunan salatı', tr: 'Yunan salatası' },
          description: { en: 'Tomato, cucumber, olives and feta cheese.', ru: 'Помидор, огурец, оливки и сыр фета.', az: 'Pomidor, xiyar, zeytun və feta pendiri.', tr: 'Domates, salatalık, zeytin ve feta peyniri.' },
          price: 6,
          image: null,
          is_available: 1,
          is_featured: 0,
          sort_order: 1,
        },
        {
          id: 2004,
          category_id: 203,
          name: { en: 'Fresh Lemonade', ru: 'Свежий лимонад', az: 'Təzə limonad', tr: 'Taze limonata' },
          description: { en: 'House lemonade with mint and ice.', ru: 'Домашний лимонад с мятой и льдом.', az: 'Nanə və buz ilə ev limonadı.', tr: 'Nane ve buzlu ev limonatası.' },
          price: 4,
          image: null,
          is_available: 1,
          is_featured: 0,
          sort_order: 1,
        },
      ],
      promotions: [
        {
          id: 2901,
          title: { en: 'Lunch combo', ru: 'Ланч комбо', az: 'Nahar kombo', tr: 'Öğle kombosu' },
          description: { en: 'Wrap + lemonade for a special price.', ru: 'Ролл + лимонад по специальной цене.', az: 'Dürüm + limonad xüsusi qiymətə.', tr: 'Dürüm + limonata özel fiyatla.' },
          discount_percent: 12,
          image: null,
          is_active: 1,
          sort_order: 1,
        },
      ],
    },
  },
  {
    slug: 'restoran3',
    name: 'Restoran 3',
    category: 'Coming soon',
    description: 'Bu restoran yaxin vaxtlarda platformaya elave olunacaq.',
    logo: '/coffee-logo.png',
    accentColor: '#6B5EAE',
    tags: ['Tezlikle'],
    comingSoon: true,
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
