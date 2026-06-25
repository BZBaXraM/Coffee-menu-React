import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'qrmenu_cart';

// Unique cart-line key: a dish with a chosen size is a distinct line from the
// same dish in another size, so S and M live as two rows.
const lineKey = (id, size) => (size ? `${id}::${size}` : String(id));

function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    // Backfill `key` for carts persisted before size variants existed.
    return raw.map((i) => ({ ...i, key: i.key || lineKey(i.id, i.size) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  // `size` is an optional { label, price } variant (e.g. milkshake S/M).
  const add = (dish, qty = 1, size = null) => {
    const key = lineKey(dish.id, size?.label);
    const price = size ? size.price : dish.price;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...dish, key, size: size?.label || null, price, qty }];
    });
  };

  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQty = (key, qty) => {
    if (qty <= 0) return remove(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
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
