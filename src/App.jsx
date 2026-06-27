import { Routes, Route, useParams } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RestaurantStatusPage from './pages/RestaurantStatusPage.jsx';
import { getRestaurantBySlug } from './restaurants.js';

function RestaurantRoute({ slug }) {
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant || restaurant.comingSoon) return <RestaurantStatusPage slug={slug} />;
  return <MenuPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/:restaurantSlug" element={<RestaurantSlugRoute />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function RestaurantSlugRoute() {
  const { restaurantSlug } = useParams();
  return <RestaurantRoute slug={restaurantSlug} />;
}
