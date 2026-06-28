import { useEffect, useState, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';
import { useApp, tl } from '../context/AppContext.jsx';
import { LANGUAGES } from '../i18n.js';
import Pagination from '../components/Pagination.jsx';
import { API_URL, assetUrl, wsUrl } from '../api.js';
import { AdminLangProvider, useAdminLang, ADMIN_LANG_CODES } from '../adminStrings.jsx';
import { CategoryIcon, ICON_OPTIONS } from '../categoryIcons.jsx';

const LANG_CODES = LANGUAGES.map((l) => l.code);

// ---------- small helpers ----------
function parseML(value) {
  try {
    const o = JSON.parse(value);
    return typeof o === 'object' && o ? o : { en: value || '' };
  } catch {
    return { en: value || '' };
  }
}

function MultiLang({ label, value, onChange, textarea }) {
  const { lang: adminLang } = useAdminLang();
  const [lang, setLang] = useState(adminLang);
  const Field = textarea ? 'textarea' : 'input';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
        <div className="flex gap-1">
          {LANG_CODES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setLang(c)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${lang === c ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Field
        value={value[lang] || ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        rows={textarea ? 2 : undefined}
        className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input {...props} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
    </label>
  );
}

// ---------- main ----------
export default function AdminPage() {
  return (
    <AdminLangProvider>
      <AdminPanel />
    </AdminLangProvider>
  );
}

function AdminPanel() {
  const { theme, toggleTheme } = useApp();
  const { lang: adminLang, setLang: setAdminLang, t } = useAdminLang();
  const [pw, setPw] = useState(() => sessionStorage.getItem('admin_pw') || '');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginInput, setLoginInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState('dishes');
  const [error, setError] = useState('');

  const headers = useCallback((json) => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'x-admin-password': pw,
  }), [pw]);

  const validate = useCallback(async (candidate) => {
    const res = await fetch(`${API_URL}/admin/dishes?limit=1`, { headers: { 'x-admin-password': candidate } });
    return res.ok;
  }, []);

  // silent re-validate on load
  useEffect(() => {
    (async () => {
      if (pw && (await validate(pw))) setAuthed(true);
      setChecking(false);
    })();
  }, [pw, validate]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    if (await validate(loginInput)) {
      sessionStorage.setItem('admin_pw', loginInput);
      setPw(loginInput);
      setAuthed(true);
    } else {
      setError(t.wrongPassword);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_pw');
    setPw(''); setAuthed(false); setLoginInput('');
  };

  if (checking) return null;

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-surface p-6">
          <div className="text-center">
            <div className="text-4xl">☕</div>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">{t.panel}</h1>
            <p className="text-sm text-muted">Coffee In Lab</p>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder={t.password}
              autoFocus
              className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-accent"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-ink">{t.signIn}</button>
        </form>
      </div>
    );
  }

  const tabs = [
    ['dishes', t.tabDishes],
    ['categories', t.tabCategories],
    ['promotions', t.tabPromotions],
    ['orders', t.tabOrders],
    ['settings', t.tabSettings],
    ['qr', t.tabQr],
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="font-display text-lg font-bold text-ink">☕ {t.admin}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const i = ADMIN_LANG_CODES.indexOf(adminLang);
                setAdminLang(ADMIN_LANG_CODES[(i + 1) % ADMIN_LANG_CODES.length]);
              }}
              className="grid h-9 min-w-9 place-items-center rounded-lg border border-line bg-bg px-2 text-xs font-semibold uppercase text-ink"
              title="Язык / Language / Dil"
            >
              {adminLang.toUpperCase()}
            </button>
            <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-bg">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <a href="/" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">{t.viewMenu}</a>
            <button onClick={logout} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">{t.logout}</button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === id ? 'bg-accent text-accent-ink' : 'text-muted hover:bg-bg'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'dishes' && <DishesTab headers={headers} />}
        {tab === 'categories' && <CategoriesTab headers={headers} />}
        {tab === 'promotions' && <PromotionsTab headers={headers} />}
        {tab === 'orders' && <OrdersTab headers={headers} />}
        {tab === 'settings' && <SettingsTab headers={headers} />}
        {tab === 'qr' && <QRTab headers={headers} />}
      </main>
    </div>
  );
}

// ---------- Dishes ----------
function DishesTab({ headers }) {
  const { t, lang } = useAdminLang();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/admin/dishes?page=${page}&limit=20`, { headers: headers() })
      .then((r) => r.json()).then((d) => { setItems(d.items || []); setTotalPages(d.totalPages || 1); });
  }, [page, headers]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetch(`${API_URL}/admin/categories`, { headers: headers() }).then((r) => r.json()).then(setCats); }, [headers]);

  const blank = { name: { en: '' }, description: { en: '' }, ingredients: { en: '' }, price: '', category_id: cats[0]?.id || '', calories: '', weight: '', sizes: '[]', is_featured: 0, is_available: 1 };

  const save = async (form, file) => {
    const fd = new FormData();
    fd.append('name', JSON.stringify(form.name));
    fd.append('description', JSON.stringify(form.description));
    fd.append('ingredients', JSON.stringify(form.ingredients));
    ['price', 'category_id', 'calories', 'weight', 'is_featured', 'is_available'].forEach((k) => fd.append(k, form[k] ?? ''));
    // Normalize sizes: drop blank rows and coerce prices to numbers.
    let sizes = [];
    try { sizes = JSON.parse(form.sizes || '[]'); } catch { /* ignore */ }
    sizes = (Array.isArray(sizes) ? sizes : [])
      .map((s) => ({ label: String(s.label || '').trim(), price: Number(s.price) }))
      .filter((s) => s.label && Number.isFinite(s.price));
    fd.append('sizes', JSON.stringify(sizes));
    // new upload wins; otherwise send the current path (empty string = remove existing photo)
    if (file) fd.append('image', file);
    else fd.append('image', form.image ?? '');
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `${API_URL}/admin/dishes/${form.id}` : `${API_URL}/admin/dishes`;
    await fetch(url, { method, headers: headers(), body: fd });
    setEditing(null); load();
  };

  const del = async (id) => {
    if (!confirm(t.confirmDeleteDrink)) return;
    await fetch(`${API_URL}/admin/dishes/${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">{t.drinks} ({items.length})</h2>
        <button onClick={() => setEditing(blank)} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">{t.new}</button>
      </div>
      <div className="grid gap-2">
        {items.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-surface-2 text-xl">
              {d.image ? <img src={assetUrl(d.image)} className="h-full w-full rounded-lg object-cover" alt="" /> : <CategoryIcon category={cats.find((c) => c.id === d.category_id)} size={18} boxed={false} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{tl(d.name, lang)}</div>
              <div className="text-xs text-muted">{d.price} AZN {d.is_featured ? '· ★' : ''} {d.is_available ? '' : `· ${t.hidden}`}</div>
            </div>
            <button onClick={() => setEditing({ ...d, name: parseML(d.name), description: parseML(d.description), ingredients: parseML(d.ingredients) })} className="rounded-lg border border-line px-2 py-1 text-xs text-ink">{t.edit}</button>
            <button onClick={() => del(d.id)} className="rounded-lg border border-line px-2 py-1 text-xs text-red-500">{t.del}</button>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {editing && <DishForm form={editing} cats={cats} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function DishForm({ form: initial, cats, onCancel, onSave }) {
  const { t, lang } = useAdminLang();
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Size variants (e.g. milkshake S/M). Stored on the dish as a JSON string.
  const [sizes, setSizes] = useState(() => {
    try {
      const arr = JSON.parse(initial.sizes || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });
  const syncSizes = (arr) => {
    setSizes(arr);
    set('sizes', JSON.stringify(arr));
  };
  const updateSize = (i, key, val) => syncSizes(sizes.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  const addSize = () => syncSizes([...sizes, { label: '', price: '' }]);
  const removeSize = (i) => syncSizes(sizes.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(form, file); }}
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-surface p-5"
      >
        <h3 className="font-display text-lg font-bold text-ink">{form.id ? t.editTitle : t.newTitle} · {t.drink}</h3>
        <MultiLang label={t.name} value={form.name} onChange={(v) => set('name', v)} />
        <MultiLang label={t.description} value={form.description} onChange={(v) => set('description', v)} textarea />
        <MultiLang label={t.ingredients} value={form.ingredients} onChange={(v) => set('ingredients', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.priceAzn} type="number" step="0.25" value={form.price} onChange={(e) => set('price', e.target.value)} required />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{t.category}</span>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
              {cats.map((c) => <option key={c.id} value={c.id}>{tl(c.name, lang)}</option>)}
            </select>
          </label>
          <Field label={t.calories} type="number" value={form.calories || ''} onChange={(e) => set('calories', e.target.value)} />
          <Field label={t.weight} type="number" value={form.weight || ''} onChange={(e) => set('weight', e.target.value)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">{t.sizesOptional}</label>
            <button type="button" onClick={addSize} className="rounded-lg border border-line px-2 py-1 text-xs text-ink">{t.addSize}</button>
          </div>
          {sizes.length === 0 ? (
            <p className="text-xs text-muted">{t.noSizes}</p>
          ) : (
            <div className="space-y-2">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => updateSize(i, 'label', e.target.value)}
                    placeholder={t.sizeLabelPh}
                    className="w-1/2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    step="0.25"
                    value={s.price}
                    onChange={(e) => updateSize(i, 'price', e.target.value)}
                    placeholder={t.priceAzn}
                    className="w-1/2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                  <button type="button" onClick={() => removeSize(i)} className="shrink-0 rounded-lg border border-line px-2 py-2 text-xs text-red-500">✕</button>
                </div>
              ))}
              <p className="text-[11px] text-muted">{t.sizeTip}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-ink">
          {[['is_featured', t.featured], ['is_available', t.available]].map(([k, lbl]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={!!Number(form[k])} onChange={(e) => set(k, e.target.checked ? 1 : 0)} /> {lbl}
            </label>
          ))}
        </div>
        <div className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{t.photoOptional}</span>
          {(file || form.image) ? (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
              <img src={file ? URL.createObjectURL(file) : assetUrl(form.image)} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                {file && <div className="truncate text-sm font-medium text-ink">{file.name}</div>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-lg border border-line px-2 py-1 text-xs text-ink hover:border-accent">
                    {t.edit}
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => { setFile(null); set('image', ''); }}
                    className="rounded-lg border border-line px-2 py-1 text-xs text-red-500"
                  >
                    {t.removePhoto}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-surface-2 px-4 py-6 text-center transition-colors hover:border-accent">
              <ImageIcon size={28} className="text-muted" />
              <span className="text-sm font-medium text-ink">{t.uploadHint}</span>
              <span className="text-[11px] text-muted">{t.uploadFormats}</span>
              <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} className="hidden" />
            </label>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-line py-2 text-sm text-ink">{t.cancel}</button>
          <button className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-accent-ink">{t.save}</button>
        </div>
      </form>
    </div>
  );
}

// ---------- Categories ----------
function CategoriesTab({ headers }) {
  const { t, lang } = useAdminLang();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => fetch(`${API_URL}/admin/categories`, { headers: headers() }).then((r) => r.json()).then(setItems), [headers]);
  useEffect(() => { load(); }, [load]);

  const save = async (form, file) => {
    const fd = new FormData();
    fd.append('name', JSON.stringify(form.name));
    fd.append('icon', form.icon || '☕');
    fd.append('icon_type', form.icon_type || 'svg');
    fd.append('icon_key', form.icon_key || '');
    fd.append('sort_order', Number(form.sort_order) || 0);
    fd.append('is_active', form.is_active ?? 1);
    // new upload wins; otherwise send the current path (empty string = removed)
    if (form.icon_type === 'image') {
      if (file) fd.append('iconFile', file);
      else fd.append('icon_url', form.icon_url ?? '');
    } else {
      fd.append('icon_url', ''); // switching back to a built-in clears any old upload
    }
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `${API_URL}/admin/categories/${form.id}` : `${API_URL}/admin/categories`;
    await fetch(url, { method, headers: headers(), body: fd });
    setEditing(null); load();
  };
  const del = async (id) => { if (confirm(t.confirmDeleteCategory)) { await fetch(`${API_URL}/admin/categories/${id}`, { method: 'DELETE', headers: headers() }); load(); } };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">{t.categories}</h2>
        <button onClick={() => setEditing({ name: { en: '' }, icon: '☕', icon_type: 'svg', icon_key: 'espresso', icon_url: '', sort_order: items.length + 1, is_active: 1 })} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">{t.new}</button>
      </div>
      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <CategoryIcon category={c} size={20} />
            <div className="flex-1 text-sm font-semibold text-ink">{tl(c.name, lang)}</div>
            <span className="text-xs text-muted">#{c.sort_order}</span>
            <button onClick={() => setEditing({ ...c, name: parseML(c.name) })} className="rounded-lg border border-line px-2 py-1 text-xs text-ink">{t.edit}</button>
            <button onClick={() => del(c.id)} className="rounded-lg border border-line px-2 py-1 text-xs text-red-500">{t.del}</button>
          </div>
        ))}
      </div>
      {editing && <CategoryForm form={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function CategoryForm({ form: initial, onCancel, onSave }) {
  const { t } = useAdminLang();
  const [form, setForm] = useState({ icon_type: 'svg', icon_key: 'espresso', icon_url: '', ...initial });
  const [file, setFile] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const customPreview = file ? URL.createObjectURL(file) : (form.icon_url ? assetUrl(form.icon_url) : null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onCancel}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form, file); }} className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-surface p-5">
        <h3 className="font-display text-lg font-bold text-ink">{form.id ? t.editTitle : t.newTitle} · {t.categoryWord}</h3>
        <MultiLang label={t.name} value={form.name} onChange={(v) => set('name', v)} />

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{t.icon}</label>
          <div className="mb-2 inline-flex rounded-lg border border-line p-0.5 text-xs">
            {[['svg', t.iconBuiltIn], ['image', t.iconCustom]].map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('icon_type', val)}
                className={`rounded-md px-3 py-1 font-semibold ${form.icon_type === val ? 'bg-accent text-accent-ink' : 'text-muted'}`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {form.icon_type === 'image' ? (
            <div className="flex items-center gap-3">
              {customPreview && (
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-surface-2">
                  <img src={customPreview} alt="" className="h-7 w-7 object-contain" />
                </span>
              )}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-ink" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set('icon_key', opt.key)}
                  title={opt.label}
                  className={`grid place-items-center rounded-lg border p-1.5 ${form.icon_key === opt.key ? 'border-accent ring-1 ring-accent' : 'border-line'}`}
                >
                  <CategoryIcon category={{ icon_type: 'svg', icon_key: opt.key }} size={18} />
                </button>
              ))}
            </div>
          )}
        </div>

        <Field label={t.sortOrder} type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-line py-2 text-sm text-ink">{t.cancel}</button>
          <button className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-accent-ink">{t.save}</button>
        </div>
      </form>
    </div>
  );
}

// ---------- Promotions ----------
function PromotionsTab({ headers }) {
  const { t, lang } = useAdminLang();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => fetch(`${API_URL}/admin/promotions`, { headers: headers() }).then((r) => r.json()).then(setItems), [headers]);
  useEffect(() => { load(); }, [load]);

  const save = async (form) => {
    const fd = new FormData();
    fd.append('title', JSON.stringify(form.title));
    fd.append('description', JSON.stringify(form.description));
    fd.append('discount_percent', form.discount_percent || 0);
    fd.append('is_active', form.is_active ?? 1);
    fd.append('sort_order', form.sort_order ?? 0);
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `${API_URL}/admin/promotions/${form.id}` : `${API_URL}/admin/promotions`;
    await fetch(url, { method, headers: headers(), body: fd });
    setEditing(null); load();
  };
  const del = async (id) => { if (confirm(t.confirmDeletePromotion)) { await fetch(`${API_URL}/admin/promotions/${id}`, { method: 'DELETE', headers: headers() }); load(); } };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">{t.promotions}</h2>
        <button onClick={() => setEditing({ title: { en: '' }, description: { en: '' }, discount_percent: 10, is_active: 1, sort_order: items.length + 1 })} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">{t.new}</button>
      </div>
      <div className="grid gap-2">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <div className="flex-1 text-sm font-semibold text-ink">{tl(p.title, lang)}</div>
            <span className="text-xs text-accent">−{p.discount_percent}%</span>
            <button onClick={() => setEditing({ ...p, title: parseML(p.title), description: parseML(p.description) })} className="rounded-lg border border-line px-2 py-1 text-xs text-ink">{t.edit}</button>
            <button onClick={() => del(p.id)} className="rounded-lg border border-line px-2 py-1 text-xs text-red-500">{t.del}</button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); save(editing); }} className="w-full max-w-md space-y-3 rounded-2xl bg-surface p-5">
            <h3 className="font-display text-lg font-bold text-ink">{editing.id ? t.editTitle : t.newTitle} · {t.promotionWord}</h3>
            <MultiLang label={t.title} value={editing.title} onChange={(v) => setEditing((f) => ({ ...f, title: v }))} />
            <MultiLang label={t.description} value={editing.description} onChange={(v) => setEditing((f) => ({ ...f, description: v }))} textarea />
            <Field label={t.discount} type="number" value={editing.discount_percent} onChange={(e) => setEditing((f) => ({ ...f, discount_percent: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-line py-2 text-sm text-ink">{t.cancel}</button>
              <button className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-accent-ink">{t.save}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------- Orders ----------
function OrdersTab({ headers }) {
  const { t } = useAdminLang();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const statusLabels = { new: t.statusNew, preparing: t.statusPreparing, ready: t.statusReady, done: t.statusDone, cancelled: t.statusCancelled };

  const load = useCallback((p = page) => {
    fetch(`${API_URL}/admin/orders?page=${p}&limit=20`, { headers: headers() })
      .then((r) => r.json()).then((d) => { setItems(d.items || []); setTotalPages(d.totalPages || 1); });
  }, [page, headers]);

  useEffect(() => { load(page); }, [page, load]);

  // live updates
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(wsUrl('/ws'));
      ws.onmessage = (ev) => {
        try { if (JSON.parse(ev.data).type === 'new_order') { setPage(1); load(1); } } catch { /* ignore */ }
      };
    } catch { /* ignore */ }
    return () => ws?.close();
  }, [load]);

  const setStatus = async (id, status) => {
    await fetch(`${API_URL}/admin/orders/${id}/status`, { method: 'PUT', headers: headers(true), body: JSON.stringify({ status }) });
    load(page);
  };

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">{t.orders}</h2>
      <div className="grid gap-2">
        {items.length === 0 && <p className="text-muted">{t.noOrders}</p>}
        {items.map((o) => {
          let list = [];
          try { list = JSON.parse(o.items); } catch { /* ignore */ }
          return (
            <div key={o.id} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-ink">#{o.id} · {o.total} {o.currency}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted" title={o.table_number ? t.fromQr : ''}>
                    {o.table_number ? `🪑 #${o.table_number} (QR)` : '—'}
                  </span>
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-ink">
                    {['new', 'preparing', 'ready', 'done', 'cancelled'].map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                </div>
              </div>
              <ul className="mt-1 text-xs text-muted">
                {list.map((it, i) => <li key={i}>• {it.name} ×{it.qty}</li>)}
              </ul>
              <div className="mt-1 text-[11px] text-muted">{new Date(o.created_at).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------- Settings ----------
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function SettingsTab({ headers }) {
  const { t } = useAdminLang();
  const [s, setS] = useState(null);
  const [hours, setHours] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings`, { headers: headers() })
      .then((r) => r.json())
      .then((d) => {
        delete d.admin_password; // don't prefill the password
        let parsed = {};
        try { parsed = JSON.parse(d.opening_hours || '{}'); } catch { /* ignore */ }
        setHours(parsed && typeof parsed === 'object' ? parsed : {});
        setS(d);
      });
  }, [headers]);
  if (!s) return <p className="text-muted">{t.loading}</p>;

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setDay = (day, v) => setHours((p) => ({ ...p, [day]: v }));
  const name = parseML(s.restaurant_name);

  const save = async (e) => {
    e.preventDefault();
    // Keep only non-empty days so a blank field hides that day on the menu.
    const cleanHours = {};
    for (const day of WEEKDAYS) {
      const v = (hours[day] || '').trim();
      if (v) cleanHours[day] = v;
    }
    const body = { ...s, restaurant_name: JSON.stringify(name), opening_hours: JSON.stringify(cleanHours) };
    await fetch(`${API_URL}/settings`, { method: 'PUT', headers: headers(true), body: JSON.stringify(body) });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <form onSubmit={save} className="max-w-lg space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">{t.settings}</h2>
      <MultiLang label={t.cafeName} value={name} onChange={(v) => set('restaurant_name', JSON.stringify(v))} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.phone} value={s.phone || ''} onChange={(e) => set('phone', e.target.value)} />
        <Field label={t.instagram} value={s.instagram || ''} onChange={(e) => set('instagram', e.target.value)} />
        <Field label={t.wifiName} value={s.wifi_name || ''} onChange={(e) => set('wifi_name', e.target.value)} />
        <Field label={t.wifiPassword} value={s.wifi_password || ''} onChange={(e) => set('wifi_password', e.target.value)} />
        <Field label={t.address} value={s.address || ''} onChange={(e) => set('address', e.target.value)} />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{t.accentColor}</span>
          <input type="color" value={s.accent_color || '#9C6B3F'} onChange={(e) => set('accent_color', e.target.value)} className="h-10 w-full rounded-lg border border-line bg-bg" />
        </label>
        <Field label={t.menuUrl} value={s.menu_url || ''} onChange={(e) => set('menu_url', e.target.value)} />
        <Field label={t.newAdminPassword} type="password" placeholder={t.leaveBlank} value={s.admin_password || ''} onChange={(e) => set('admin_password', e.target.value)} />
      </div>

      <div>
        <Field label={t.whatsapp} value={s.whatsapp_number || ''} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="+994..." />
        <p className="mt-1 text-[11px] text-muted">{t.whatsappHint}</p>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t.workingHours}</div>
        <div className="space-y-2 rounded-xl border border-line bg-surface-2 p-3">
          {WEEKDAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-ink">{t[day]}</span>
              <input
                value={hours[day] || ''}
                onChange={(e) => setDay(day, e.target.value)}
                placeholder="08:00–22:00"
                className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted">{t.hoursHint}</p>
      </div>

      <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink">{saved ? t.saved : t.saveSettings}</button>
    </form>
  );
}

// ---------- QR ----------
function QRTab({ headers }) {
  const { t } = useAdminLang();
  const [table, setTable] = useState('');
  const [qr, setQr] = useState(null);
  const [url, setUrl] = useState('');

  const gen = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/settings/qrcode`, { method: 'POST', headers: headers(true), body: JSON.stringify({ table: table || undefined }) });
    const d = await res.json();
    setQr(d.qr); setUrl(d.url);
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">{t.qrCode}</h2>
      <form onSubmit={gen} className="flex items-end gap-2">
        <Field label={t.tableNumber} value={table} onChange={(e) => setTable(e.target.value)} />
        <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink">{t.generate}</button>
      </form>
      {qr && (
        <div className="rounded-2xl border border-line bg-surface p-5 text-center">
          <img src={qr} alt="QR" className="mx-auto w-56" />
          <p className="mt-2 break-all text-xs text-muted">{url}</p>
          <a href={qr} download="coffee-qr.png" className="mt-3 inline-block rounded-lg border border-line px-3 py-2 text-sm text-ink">{t.download}</a>
        </div>
      )}
    </div>
  );
}
