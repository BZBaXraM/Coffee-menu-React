import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'qrmenu_cart';

function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = (dish, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === dish.id);
      if (found) {
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...dish, qty }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const totalAZN = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, count, totalAZN }}>
      {children}
    </CartContext.Provider>
  );
}
