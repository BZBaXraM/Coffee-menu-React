import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RestaurantStatusPage from './pages/RestaurantStatusPage.jsx';
import { DEFAULT_RESTAURANT_SLUG, getRestaurantBySlug } from './restaurants.js';

function RestaurantRoute({ slug }) {
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant || restaurant.comingSoon) return <RestaurantStatusPage slug={slug} />;
  return <MenuPage />;
}

// Root entry: a QR scan lands here as `/?table=N`. Send those visitors straight
// to the default restaurant's menu (preserving ?table=N so CartDrawer can read
// it). A bare visit to `/` still shows the multi-restaurant landing page.
function RootRoute() {
  const location = useLocation();
  const hasTable = new URLSearchParams(location.search).has('table');
  if (hasTable) {
    return <Navigate to={`/${DEFAULT_RESTAURANT_SLUG}${location.search}`} replace />;
  }
  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/admin" element={<Navigate to={`/${DEFAULT_RESTAURANT_SLUG}/admin`} replace />} />
      <Route path="/:restaurantSlug/admin" element={<AdminPage />} />
      <Route path="/:restaurantSlug" element={<RestaurantSlugRoute />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function RestaurantSlugRoute() {
  const { restaurantSlug } = useParams();
  return <RestaurantRoute slug={restaurantSlug} />;
}
