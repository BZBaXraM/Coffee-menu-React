// All data comes from the remote backend. The origin can be overridden at
// build time with VITE_API_BASE; it defaults to the production API.
export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://coffee-menu.bahram.site').replace(/\/$/, '');
// export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '');

// Base for REST calls, e.g. `${API_URL}/menu/dishes`.
export const API_URL = `${API_BASE}/api`;

export function apiBaseFor(restaurant) {
  return (restaurant?.apiBase || API_BASE).replace(/\/$/, '');
}

export function apiUrlFor(restaurant) {
  return `${apiBaseFor(restaurant)}/api`;
}

// Resolve a server-relative asset path (e.g. "/uploads/x.png") to an absolute URL.
export function assetUrl(path, base = API_BASE) {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/uploads/')) return `${(base || API_BASE).replace(/\/$/, '')}${path}`;
  return path;
}

// Parse a dish's `sizes` column (JSON array of { label, price } in AZN) into a
// clean array. Returns [] when the dish has no size variants — callers then fall
// back to the plain `price` field.
export function dishSizes(dish) {
  if (!dish || dish.sizes == null) return [];
  try {
    const arr = typeof dish.sizes === 'string' ? JSON.parse(dish.sizes) : dish.sizes;
    return Array.isArray(arr) ? arr.filter((s) => s && s.label != null && s.price != null) : [];
  } catch {
    return [];
  }
}

// WebSocket endpoint on the API host.
export function wsUrl(path = '/ws') {
  const url = new URL(API_BASE);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = path;
  return url.toString();
}

// Thin fetch helper. `path` is relative to the API root, e.g. "/menu/dishes".
export async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, opts);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

// Send a FormData body while reporting upload progress — fetch() can't report
// request-body progress, so this uses XMLHttpRequest. `onProgress` receives an
// integer 0–100. Resolves with the parsed JSON response, rejects on HTTP errors.
export function sendForm(url, { method = 'POST', headers = {}, body, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); } catch { resolve(null); }
      } else {
        let msg = `HTTP ${xhr.status}`;
        try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(body);
  });
}

export function adminHeaders(pw, extra = {}) {
  return { 'x-admin-password': pw || '', ...extra };
}

// JSON helper for admin writes (non-multipart)
export function jsonHeaders(pw) {
  return { 'Content-Type': 'application/json', ...adminHeaders(pw) };
}
