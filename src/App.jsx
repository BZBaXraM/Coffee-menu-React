import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<MenuPage />} />
    </Routes>
  );
}
