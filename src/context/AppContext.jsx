import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useStrings } from '../i18n.js';
import { API_URL } from '../api.js';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Resolve a multilingual JSON value (or plain string) to the current language.
export function tl(value, language = 'en') {
  if (value == null) return '';
  if (typeof value === 'object') {
    return value[language] || value.en || value.az || Object.values(value)[0] || '';
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('{') || s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
        return tl(parsed, language);
      } catch { /* not JSON */ }
    }
    return value;
  }
  return String(value);
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState({});
  // v2 key: bumped so older cached language choices fall back to the new 'az' default.
  const [language, setLanguage] = useState(() => localStorage.getItem('qrmenu_lang_v2') || 'az');
  const [currency, setCurrency] = useState(() => localStorage.getItem('qrmenu_currency') || 'AZN');
  const [theme, setTheme] = useState(() => localStorage.getItem('qrmenu_theme') || 'light');

  const t = useStrings(language);

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.json())
      .then((s) => {
        setSettings(s);
      })
      .catch(() => {});
  }, []);

  // Theme → <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qrmenu_theme', theme);
  }, [theme]);

  // Accent color from settings → inline --accent (overrides theme default)
  useEffect(() => {
    if (settings.accent_color) {
      document.documentElement.style.setProperty('--accent', settings.accent_color);
    }
  }, [settings.accent_color]);

  useEffect(() => { localStorage.setItem('qrmenu_lang_v2', language); }, [language]);
  useEffect(() => { localStorage.setItem('qrmenu_currency', currency); }, [currency]);

  const toggleTheme = useCallback(() => {
    setTheme((p) => (p === 'dark' ? 'light' : 'dark'));
  }, []);

  const rates = (() => {
    try { return JSON.parse(settings.currency_rates || '{}'); } catch { return {}; }
  })();

  const convertPrice = useCallback((priceAZN) => {
    const rate = rates[currency] ?? 1;
    return (Number(priceAZN) * rate);
  }, [rates, currency]);

  const formatPrice = useCallback((priceAZN) => {
    const v = convertPrice(priceAZN);
    return `${v.toFixed(2)} ${currency}`;
  }, [convertPrice, currency]);

  const value = {
    settings,
    language, setLanguage,
    currency, setCurrency,
    theme, setTheme, toggleTheme,
    t,
    tl: (v) => tl(v, language),
    convertPrice,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
