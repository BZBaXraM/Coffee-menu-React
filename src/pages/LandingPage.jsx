import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

// ─── Editable business facts ────────────────────────────────────────────────
const WHATSAPP = 'https://wa.me/994558426968?text=' +
  encodeURIComponent('Salam! MenyuQR platforması haqqında məlumat almaq istəyirəm.');
const DEMO_MAIN = '/gardenmarket/';
const NAV_LINKS = [
  ['#xususiyyetler', 'Xüsusiyyətlər'],
  ['#nece-isleyir', 'Necə işləyir'],
  ['#numuneler', 'Nümunələr'],
  ['#qiymet', 'Qiymət'],
  ['#faq', 'FAQ'],
];
// Pricing amounts are placeholders — edit freely.
const PRICING = [
  {
    name: 'Başlanğıc', price: 'Pulsuz', period: 'sınaq müddəti', popular: false,
    features: ['QR menyu və onlayn mağaza', '20-yə qədər məhsul', 'WhatsApp sifariş', '4 dil dəstəyi'],
    cta: 'Pulsuz başla',
  },
  {
    name: 'Biznes', price: '25 ₼', period: 'aylıq', popular: true,
    features: ['Limitsiz məhsul və kateqoriya', 'AI köməkçi + səslə sifariş', 'Canlı sifariş bildirişləri', 'Excel hesabatlar', 'Çatdırılma qaydaları', 'Öz loqo və rənglər'],
    cta: 'Biznes planı seç',
  },
  {
    name: 'Fərdi', price: 'Razılaşma', period: 'ilə', popular: false,
    features: ['Öz domeniniz', 'Fərdi dizayn uyğunlaşdırması', 'Birbaşa dəstək xətti', 'Xüsusi inteqrasiyalar'],
    cta: 'Əlaqə saxla',
  },
];
const FAQS = [
  ['Tətbiq yükləmək lazımdır?', 'Xeyr. Müştəri QR kodu skan edir və menyu birbaşa brauzerdə açılır — heç bir quraşdırma tələb olunmur.'],
  ['Neçə dil dəstəklənir?', 'Dörd dil: Azərbaycan, rus, ingilis və türk. Müştəri bir toxunuşla dili dəyişir, məhsul adları və təsvirlər avtomatik uyğun dildə görünür.'],
  ['Sifarişlər hara gəlir?', 'Sifariş WhatsApp nömrənizə hazır mesaj kimi gəlir, eyni anda admin paneldə saxlanır — səs siqnalı ilə anlıq bildiriş alırsınız.'],
  ['Öz domenimi qoşa bilərəm?', 'Bəli. Biznesiniz öz ünvanında (məsələn, sizinmagaza.az) işləyə bilər.'],
  ['Quraşdırma nə qədər çəkir?', 'Dəqiqələr. Məhsulları admin paneldən əlavə edirsiniz, QR kodu çap edirsiniz — vəssalam, mağazanız onlayndır.'],
];

// ─── Deterministic pseudo-QR (finder squares + hash-scattered modules) ──────
function qrModules(n = 17) {
  const cells = [];
  const inFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if ((x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0) cells.push([x, y]);
    }
  }
  return cells;
}
function QrArt({ className = '', dark = '#0B141A' }) {
  const n = 17, s = 100 / n;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx * s} y={fy * s} width={7 * s} height={7 * s} rx="4" fill="none" stroke={dark} strokeWidth="4.5" />
          <rect x={(fx + 2) * s} y={(fy + 2) * s} width={3 * s} height={3 * s} rx="2" fill={dark} />
        </g>
      ))}
      {qrModules(n).map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x * s + 1} y={y * s + 1} width={s - 2} height={s - 2} rx="1.4" fill={dark} />
      ))}
    </svg>
  );
}
function QrMark({ className = '' }) {
  return (
    <span className={`grid place-items-center rounded-xl bg-gradient-to-br from-[#0E9F6E] to-[#065F46] ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3" />
      </svg>
    </span>
  );
}

// ─── One-style inline icon set (stroke 1.8, round) ──────────────────────────
function Icon({ d, className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
const I = {
  qr: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM21 14v1M14 21h1M18 18h3v3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  sparkle: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7" /></>,
  chat: <><path d="M21 12a8 8 0 01-8 8H4l1.6-3.2A8 8 0 1121 12z" /><path d="M8.5 10.5h7M8.5 13.5h4.5" /></>,
  truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 4v5" /><path d="M7 13h4M7 16.5h2.5" /></>,
  bell: <><path d="M18 9a6 6 0 10-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z" /><path d="M10 20a2.3 2.3 0 004 0" /></>,
  sheet: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  arrow: <path d="M5 12h14m-6-6l6 6-6 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M19.5 4.5l-1.8 1.8M6.3 17.7l-1.8 1.8" /></>,
  moon: <path d="M20.5 14A8.5 8.5 0 0110 3.5 8.5 8.5 0 1020.5 14z" />,
  wa: <><path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" /><path d="M9 8.8c.5 2.6 3.5 5.4 5.9 5.9l1.2-1.5-2.2-1.1-1 .8c-.9-.5-1.9-1.5-2.4-2.4l.8-1L10.2 7.4z" /></>,
  ig: <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></>,
};

// ─── Mini store screen (used inside the hero phone) ─────────────────────────
const PHONE_PRODUCTS = [
  ['🍗', 'Toyuq', '18.00 ₼/əd'],
  ['🥚', 'Yumurta', '0.25 ₼/əd'],
  ['🍆', 'Badımcan', '0.50 ₼/kq'],
  ['🥩', 'Quzu əti', '20.00 ₼/kq'],
];
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[264px] sm:w-[288px]">
      <div className="lp-float relative rounded-[2.9rem] border-[9px] border-[#0B141A] bg-[#0B141A] shadow-[0_40px_80px_-24px_rgba(6,95,70,0.45)] dark:border-[#1d2b24] dark:bg-[#1d2b24]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0B141A] dark:bg-[#1d2b24]" />
        <div className="overflow-hidden rounded-[2.3rem] bg-[#F4F8F3] dark:bg-[#0E1512]">
          {/* store header */}
          <div className="flex items-center gap-2 px-4 pb-2 pt-8">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0E9F6E] text-[13px]">🌿</span>
            <div className="leading-tight">
              <div className="text-[12px] font-bold text-[#0B141A] dark:text-white">GardenMarket</div>
              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#0E9F6E]">Orqanik ərzaq</div>
            </div>
          </div>
          <div className="mx-4 mb-3 rounded-full bg-white px-3 py-1.5 text-[9px] text-gray-400 shadow-sm dark:bg-[#16211c] dark:text-gray-500">Məhsul axtar…</div>
          {/* product grid */}
          <div className="grid grid-cols-2 gap-2 px-4 pb-16">
            {PHONE_PRODUCTS.map(([emoji, name, price]) => (
              <div key={name} className="rounded-xl bg-white p-2 shadow-sm dark:bg-[#16211c]">
                <div className="mb-1.5 grid h-12 place-items-center rounded-lg bg-[#EAF5EE] text-xl dark:bg-[#1c2a23]">{emoji}</div>
                <div className="text-[9px] font-bold text-[#0B141A] dark:text-white">{name}</div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[8.5px] font-bold text-[#0E9F6E]">{price}</span>
                  <span className="grid h-4 w-4 place-items-center rounded-md bg-[#0E9F6E] text-[9px] font-bold text-white">+</span>
                </div>
              </div>
            ))}
          </div>
          {/* cart bar */}
          <div className="absolute inset-x-4 bottom-3 flex items-center justify-between rounded-full bg-[#0B141A] px-4 py-2 text-white dark:bg-[#0E9F6E]">
            <span className="text-[9px] font-semibold">🧺 Səbət · 3 məhsul</span>
            <span className="text-[10px] font-bold">38.50 ₼</span>
          </div>
        </div>
      </div>

      {/* floating AI bubble */}
      <div className="lp-float-alt absolute -right-8 top-16 w-44 rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur-md sm:-right-14 dark:border-white/10 dark:bg-[#12201a]/90">
        <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold text-[#065F46] dark:text-[#5EEAD4]">
          <Icon d={I.mic} className="h-3 w-3" /> Səslə sifariş
        </div>
        <div className="rounded-lg rounded-tl-none bg-[#EAF5EE] px-2 py-1.5 text-[9px] font-medium text-[#0B141A] dark:bg-[#1c2a23] dark:text-white">
          “2 kq quzu əti, 10 yumurta”
        </div>
        <div className="mt-1.5 rounded-lg bg-[#0E9F6E] px-2 py-1.5 text-center text-[9px] font-bold text-white">
          🧺 Hamısını səbətə at
        </div>
      </div>

      {/* floating QR card */}
      <div className="lp-float-alt absolute -left-10 bottom-20 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-xl backdrop-blur-md [animation-delay:1.2s] sm:-left-16 dark:border-white/10 dark:bg-[#12201a]/90">
        <QrArt className="h-16 w-16 text-[#0B141A]" dark="currentColor" />
        <div className="mt-1.5 text-center text-[8px] font-bold uppercase tracking-[0.14em] text-[#065F46] dark:text-[#5EEAD4]">Skan et</div>
      </div>
    </div>
  );
}

// ─── Animated counter ───────────────────────────────────────────────────────
function Stat({ value, suffix = '', label }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="text-center">
      <div className="lp-grotesk text-4xl font-bold text-[#065F46] dark:text-[#5EEAD4]">{n}{suffix}</div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

// ─── Bento feature card ─────────────────────────────────────────────────────
function Feature({ icon, title, desc, span, hero = false, badge, delay = 0 }) {
  return (
    <div
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${span} ${
        hero
          ? 'border-[#0E9F6E]/30 bg-gradient-to-br from-[#ECFDF5] to-white shadow-lg shadow-[#0E9F6E]/10 dark:from-[#0d211a] dark:to-[#0E1512] dark:border-[#0E9F6E]/25'
          : 'border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#101a15]'
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{badge}</span>
      )}
      <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${hero ? 'bg-[#0E9F6E] text-white' : 'bg-[#ECFDF5] text-[#065F46] dark:bg-[#16261e] dark:text-[#5EEAD4]'}`}>
        <Icon d={icon} />
      </span>
      <h3 className={`lp-grotesk font-bold text-[#0B141A] dark:text-white ${hero ? 'text-xl' : 'text-lg'}`}>{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  );
}

// ─── Showcase card ──────────────────────────────────────────────────────────
function ShowcaseCard({ logo, name, category, href, tint, rows, delay = 0 }) {
  return (
    <a
      href={href}
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className="group block overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:border-white/10 dark:bg-[#101a15]"
    >
      {/* stylised mini screen */}
      <div className="p-4 pb-0">
        <div className="overflow-hidden rounded-t-2xl border border-b-0 border-gray-200/80 dark:border-white/10">
          <div className="flex items-center gap-1.5 border-b border-gray-200/80 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-[#0c1410]">
            <span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-2 truncate text-[10px] text-gray-400">{href.startsWith('/') ? `menyuqr.com${href}` : href}</span>
          </div>
          <div className="px-4 py-4" style={{ background: tint }}>
            <img src={logo} alt={name} className="mx-auto h-14 w-14 rounded-2xl bg-white/90 object-contain p-1.5 shadow-md" loading="lazy" />
            <div className="mt-3 space-y-1.5">
              {rows.map((w, i) => (
                <div key={i} className="h-2 rounded-full bg-white/70" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-5">
        <div>
          <div className="lp-grotesk text-lg font-bold text-[#0B141A] dark:text-white">{name}</div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{category}</div>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#0E9F6E] transition group-hover:gap-2.5">
          Canlı bax <Icon d={I.arrow} className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'MenyuQR — QR menyu və onlayn mağaza platforması';
    return () => { document.title = 'Menyu QR'; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // scroll-reveal for every [data-reveal] element
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('lp-in'); io.unobserve(e.target); } }),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-[#FAFAF7] font-[Inter,system-ui,sans-serif] text-[#0B141A] antialiased dark:bg-[#0A0F0D] dark:text-[#ECF4EF]">

      {/* ── Nav ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-gray-200/70 bg-[#FAFAF7]/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0F0D]/85' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5">
            <QrMark className="h-9 w-9" />
            <span className="lp-grotesk text-xl font-bold tracking-tight">Menyu<span className="text-[#0E9F6E]">QR</span></span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Əsas">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-gray-600 transition hover:text-[#065F46] dark:text-gray-300 dark:hover:text-[#5EEAD4]">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'İşıqlı rejim' : 'Qaranlıq rejim'}
              className="grid h-11 w-11 place-items-center rounded-xl text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <Icon d={theme === 'dark' ? I.sun : I.moon} className="h-5 w-5" />
            </button>
            <a
              href={WHATSAPP}
              className="hidden rounded-xl bg-[#0E9F6E] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0E9F6E]/25 transition hover:bg-[#0b8a5f] active:scale-[0.97] sm:block"
            >
              Pulsuz başla
            </a>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menyu"
              className="grid h-11 w-11 place-items-center rounded-xl text-gray-600 hover:bg-black/5 lg:hidden dark:text-gray-300 dark:hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-gray-200/70 bg-[#FAFAF7]/95 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#0A0F0D]/95">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10">{label}</a>
            ))}
            <a href={WHATSAPP} className="mt-2 block rounded-xl bg-[#0E9F6E] px-4 py-3 text-center text-sm font-bold text-white">Pulsuz başla</a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        {/* mesh blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="lp-blob absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-[70%] rounded-full bg-[#0E9F6E]/15 blur-3xl dark:bg-[#0E9F6E]/10" />
          <div className="lp-blob absolute right-[-120px] top-24 h-[420px] w-[420px] rounded-full bg-[#F59E0B]/12 blur-3xl [animation-delay:4s] dark:bg-[#F59E0B]/8" />
          <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(14,159,110,0.18) 1px, transparent 0)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black, transparent)' }} />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div data-reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0E9F6E]/30 bg-[#ECFDF5] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#065F46] dark:bg-[#0d211a] dark:text-[#5EEAD4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E9F6E]" />
              QR menyu və onlayn mağaza platforması
            </p>
            <h1 className="lp-grotesk text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
              Biznesin üçün rəqəmsal menyu —{' '}
              <span className="bg-gradient-to-r from-[#0E9F6E] to-[#065F46] bg-clip-text text-transparent dark:to-[#5EEAD4]">bir QR kod</span> qədər asan
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Kafe, restoran, market və ya mağaza — məhsullarını əlavə et, QR kodu çap et,
              müştərilər telefonla sifariş versin. Tətbiq yükləmək lazım deyil.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={WHATSAPP} className="rounded-2xl bg-[#0E9F6E] px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-[#0E9F6E]/30 transition hover:bg-[#0b8a5f] active:scale-[0.97]">
                Pulsuz başla
              </a>
              <a href={DEMO_MAIN} className="flex items-center gap-2 rounded-2xl border-2 border-gray-300 px-7 py-3.5 text-base font-bold text-gray-700 transition hover:border-[#0E9F6E] hover:text-[#065F46] dark:border-white/20 dark:text-gray-200 dark:hover:border-[#0E9F6E] dark:hover:text-[#5EEAD4]">
                Canlı nümunəyə bax <Icon d={I.arrow} className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Icon d={I.check} className="h-4 w-4 text-[#0E9F6E]" />
              Coffee In Lab, GardenMarket və digərləri artıq MenyuQR ilə işləyir
            </p>
          </div>

          <div data-reveal style={{ transitionDelay: '120ms' }} className="pb-6 pl-10 pr-8 sm:px-16 lg:px-6">
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* ── Trust / stats ── */}
      <section className="border-y border-gray-200/70 bg-white py-12 dark:border-white/10 dark:bg-[#0D1411]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400">MenyuQR-da işləyən bizneslər</p>
          <div data-reveal className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {[['/coffee-logo.png', 'Coffee In Lab'], ['/gardenmarket-logo.svg', 'GardenMarket'], ['/driver-game-center-logo.svg', 'Driver Game Center']].map(([src, name]) => (
              <span key={name} className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-[#FAFAF7] py-2 pl-2.5 pr-5 dark:border-white/10 dark:bg-[#101a15]">
                <img src={src} alt="" className="h-8 w-8 rounded-full object-contain" loading="lazy" />
                <span className="text-sm font-semibold">{name}</span>
              </span>
            ))}
          </div>
          <div data-reveal className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat value={4} label="dil — AZ · RU · EN · TR" />
            <Stat value={3} suffix="+" label="biznes artıq onlayndır" />
            <Stat value={5} suffix=" dəq" label="orta quraşdırma vaxtı" />
            <Stat value={0} label="tətbiq yükləmə — brauzerdə açılır" />
          </div>
        </div>
      </section>

      {/* ── Features (bento) ── */}
      <section id="xususiyyetler" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div data-reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0E9F6E]">Xüsusiyyətlər</p>
          <h2 className="lp-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Satış üçün lazım olan hər şey — bir platformada</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Menyudan sifarişə, sifarişdən hesabata qədər tam dövriyyə.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Feature hero span="lg:col-span-3" icon={I.sparkle} title="AI köməkçi" desc="Ağıllı satıcı məhsul tövsiyə edir, qiymət və tərkib suallarına dəqiq cavab verir — 4 dildə." />
          <Feature hero span="lg:col-span-3" badge="Yeni" icon={I.mic} title="Səslə sifariş" desc="Müştəri Azərbaycan dilində danışır, səbət avtomatik yığılır. Yerli bazarda analoqu yoxdur." delay={60} />
          <Feature span="lg:col-span-2" icon={I.qr} title="QR menyu" desc="Skan et, menyu açılsın. Tətbiq yox, quraşdırma yox." />
          <Feature span="lg:col-span-2" icon={I.globe} title="4 dil" desc="AZ · RU · EN · TR — hər müştəri öz dilində." delay={60} />
          <Feature span="lg:col-span-2" icon={I.chat} title="Səbət + WhatsApp" desc="Sifariş birbaşa WhatsApp-a gəlir və bazaya yazılır." delay={120} />
          <Feature span="lg:col-span-2" icon={I.truck} title="Çatdırılma / götürmə" desc="Ünvan, çatdırılma haqqı və pulsuz çatdırılma həddi." />
          <Feature span="lg:col-span-2" icon={I.panel} title="Admin panel" desc="Məhsul, qiymət, şəkil, sifariş — hamısı bir yerdə." delay={60} />
          <Feature span="lg:col-span-2" icon={I.bell} title="Canlı sifarişlər" desc="Yeni sifarişdə səs siqnalı və anlıq bildiriş." delay={120} />
          <Feature span="lg:col-span-6 sm:col-span-2" icon={I.sheet} title="Excel hesabat" desc="Nə satdığını və gəlirini bir kliklə export et — sifarişlər və satılan məhsullar üzrə." />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="nece-isleyir" className="border-y border-gray-200/70 bg-white py-24 dark:border-white/10 dark:bg-[#0D1411]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div data-reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0E9F6E]">Necə işləyir</p>
            <h2 className="lp-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Üç addımda onlayn satış</h2>
          </div>
          <div className="relative grid gap-10 md:grid-cols-3">
            <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-[#0E9F6E]/40 md:block" />
            {[
              ['Məhsullarını əlavə et', 'Admin paneldən şəkil, qiymət və təsvir əlavə et.'],
              ['QR kodu al və çap et', 'Masaya, vitrinə və ya girişə yapışdır.'],
              ['Sifarişləri qəbul et', 'Müştəri skan edir, seçir, WhatsApp ilə sifariş verir.'],
            ].map(([title, desc], i) => (
              <div key={title} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className="relative text-center">
                <span className="lp-grotesk relative z-10 mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#0E9F6E] text-xl font-bold text-white shadow-lg shadow-[#0E9F6E]/30">{i + 1}</span>
                <h3 className="lp-grotesk text-xl font-bold">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI spotlight ── */}
      <section className="relative overflow-hidden bg-[#07130E] py-24 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="lp-blob absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-[#0E9F6E]/20 blur-3xl" />
          <div className="lp-blob absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#F59E0B]/10 blur-3xl [animation-delay:5s]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div data-reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4]">AI + Səslə sifariş</p>
            <h2 className="lp-grotesk text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
              Sadəcə danış —<br />səbətini <span className="text-[#5EEAD4]">AI yığsın</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-300">
              Azərbaycan dilində səslə sifariş. Müştəri danışır, məhsullar özü səbətə düşür —
              heç bir yerli platformada bu yoxdur.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Mikrofona danış — AI məhsulları və miqdarı özü tanıyır',
                'Qiymət, tərkib və tövsiyə suallarına dəqiq cavab',
                'Bir toxunuşla bütün səbəti əlavə et',
              ].map((li) => (
                <li key={li} className="flex items-start gap-3 text-[15px] text-gray-200">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0E9F6E]/20 text-[#5EEAD4]"><Icon d={I.check} className="h-3.5 w-3.5" /></span>
                  {li}
                </li>
              ))}
            </ul>
          </div>

          {/* chat mock */}
          <div data-reveal style={{ transitionDelay: '120ms' }} className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-lg">✨</span>
                <div>
                  <div className="lp-grotesk text-sm font-bold">Satıcıdan soruş</div>
                  <div className="text-xs text-gray-400">Ağıllı alış-veriş assistanı</div>
                </div>
                <div className="ml-auto flex h-8 items-end gap-[3px] pr-1" aria-hidden="true">
                  {[0.5, 0.9, 0.7, 1, 0.6].map((h, i) => (
                    <span key={i} className="lp-wave-bar w-[3px] rounded-full bg-[#5EEAD4]" style={{ height: `${h * 22}px`, animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#0E9F6E] px-4 py-2.5 text-sm font-medium">
                  🎤 “2 kq quzu əti, 10 yumurta”
                </div>
                <div className="w-fit max-w-[90%] rounded-2xl rounded-tl-md bg-white/10 px-4 py-3 text-sm">
                  <p className="mb-3 text-gray-200">2 kq quzu əti və 10 yumurta hazırdır — səbətə əlavə edə bilərsiniz:</p>
                  <div className="space-y-2 rounded-xl bg-black/25 p-3">
                    {[['🥩', 'Quzu əti', '× 2 kq', '40.00 ₼'], ['🥚', 'Yumurta', '× 10 əd', '2.50 ₼']].map(([e, n, q, p]) => (
                      <div key={n} className="flex items-center gap-2.5 text-[13px]">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">{e}</span>
                        <span className="font-semibold">{n}</span>
                        <span className="text-gray-400">{q}</span>
                        <span className="ml-auto font-bold text-[#5EEAD4]">{p}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mt-3 w-full cursor-default rounded-xl bg-[#0E9F6E] py-2.5 text-sm font-bold transition hover:bg-[#0b8a5f]">
                    🧺 Hamısını səbətə at · 42.50 ₼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase ── */}
      <section id="numuneler" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div data-reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0E9F6E]">Nümunələr</p>
          <h2 className="lp-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Canlı işləyən bizneslər</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Hər biri real müştərilərlə, real sifarişlərlə.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <ShowcaseCard logo="/coffee-logo.png" name="Coffee In Lab" category="Kafe" href="/coffee-in-lab" tint="linear-gradient(135deg,#9c6b3f,#5d3a1f)" rows={['70%', '52%', '62%']} />
          <ShowcaseCard logo="/gardenmarket-logo.svg" name="GardenMarket" category="Orqanik market" href="/gardenmarket/" tint="linear-gradient(135deg,#0E9F6E,#065F46)" rows={['64%', '78%', '48%']} delay={80} />
          <ShowcaseCard logo="/driver-game-center-logo.svg" name="Driver Game Center" category="Oyun klubu" href="/driver-game-center/" tint="linear-gradient(135deg,#1d4ed8,#0f172a)" rows={['58%', '70%', '44%']} delay={160} />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="qiymet" className="border-y border-gray-200/70 bg-white py-24 dark:border-white/10 dark:bg-[#0D1411]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div data-reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0E9F6E]">Qiymət</p>
            <h2 className="lp-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Sadə qiymət, gizli xərc yoxdur</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {PRICING.map((tier, i) => (
              <div
                key={tier.name}
                data-reveal
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`relative flex flex-col rounded-3xl border p-7 ${
                  tier.popular
                    ? 'border-[#0E9F6E] bg-gradient-to-b from-[#ECFDF5] to-white shadow-xl shadow-[#0E9F6E]/15 dark:from-[#0d211a] dark:to-[#0E1512]'
                    : 'border-gray-200/80 bg-[#FAFAF7] dark:border-white/10 dark:bg-[#101a15]'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#F59E0B] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">Ən populyar</span>
                )}
                <h3 className="lp-grotesk text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="lp-grotesk text-4xl font-bold text-[#065F46] dark:text-[#5EEAD4]">{tier.price}</span>
                  <span className="text-sm text-gray-500">{tier.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <Icon d={I.check} className="mt-0.5 h-4 w-4 shrink-0 text-[#0E9F6E]" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={WHATSAPP}
                  className={`mt-7 rounded-xl py-3 text-center text-sm font-bold transition active:scale-[0.98] ${
                    tier.popular
                      ? 'bg-[#0E9F6E] text-white shadow-lg shadow-[#0E9F6E]/25 hover:bg-[#0b8a5f]'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-[#0E9F6E] hover:text-[#065F46] dark:border-white/20 dark:text-gray-200 dark:hover:text-[#5EEAD4]'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
          <p data-reveal className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Suallarınız var?{' '}
            <a href={WHATSAPP} className="font-bold text-[#0E9F6E] underline-offset-4 hover:underline">WhatsApp ilə yazın</a> — qiyməti birlikdə dəqiqləşdirək.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div data-reveal className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0E9F6E]">FAQ</p>
          <h2 className="lp-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Tez-tez verilən suallar</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q} data-reveal style={{ transitionDelay: `${i * 50}ms` }} className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#101a15]">
                <button
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="lp-grotesk font-bold">{q}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#065F46] transition-transform duration-300 dark:bg-[#16261e] dark:text-[#5EEAD4] ${open ? 'rotate-45' : ''}`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[15px] leading-7 text-gray-600 dark:text-gray-400">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 pb-24 sm:px-6">
        <div data-reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#065F46] via-[#0E9F6E] to-[#0b8a5f] px-6 py-16 text-center text-white shadow-2xl shadow-[#0E9F6E]/30 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F59E0B]/25 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <QrArt className="absolute -bottom-8 right-8 h-40 w-40 opacity-[0.12]" dark="#ffffff" />
          </div>
          <div className="relative">
            <h2 className="lp-grotesk mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Biznesini bu gün rəqəmsallaşdır</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Dəqiqələr içində quraşdır, ilk sifarişini bu gün qəbul et.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href={WHATSAPP} className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#065F46] shadow-xl transition hover:bg-[#ECFDF5] active:scale-[0.97]">Pulsuz başla</a>
              <a href={WHATSAPP} className="flex items-center gap-2 rounded-2xl border-2 border-white/50 px-8 py-4 text-base font-bold text-white transition hover:border-white hover:bg-white/10">
                <Icon d={I.wa} className="h-5 w-5" /> WhatsApp ilə yaz
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-[#07130E] py-14 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <a href="/" className="flex items-center gap-2.5">
                <QrMark className="h-9 w-9" />
                <span className="lp-grotesk text-xl font-bold text-white">Menyu<span className="text-[#5EEAD4]">QR</span></span>
              </a>
              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                Kafe, restoran və mağazalar üçün QR menyu və onlayn mağaza platforması.
                Skan et, seç, sifariş ver — bu qədər sadə.
              </p>
            </div>
            <div>
              <h4 className="lp-grotesk mb-4 text-sm font-bold uppercase tracking-wider text-white">Keçidlər</h4>
              <ul className="space-y-2.5 text-sm">
                {NAV_LINKS.map(([href, label]) => (
                  <li key={href}><a href={href} className="text-gray-400 transition hover:text-[#5EEAD4]">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="lp-grotesk mb-4 text-sm font-bold uppercase tracking-wider text-white">Nümunələr</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/coffee-in-lab" className="text-gray-400 transition hover:text-[#5EEAD4]">Coffee In Lab</a></li>
                <li><a href="/gardenmarket/" className="text-gray-400 transition hover:text-[#5EEAD4]">GardenMarket</a></li>
                <li><a href="/driver-game-center/" className="text-gray-400 transition hover:text-[#5EEAD4]">Driver Game Center</a></li>
              </ul>
              <h4 className="lp-grotesk mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-white">Əlaqə</h4>
              <div className="flex gap-2.5">
                <a href={WHATSAPP} aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-[#0E9F6E] hover:text-white"><Icon d={I.wa} className="h-5 w-5" /></a>
                <a href="https://instagram.com" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-[#0E9F6E] hover:text-white"><Icon d={I.ig} className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-xs text-gray-500 sm:flex-row">
            <span>© 2026 MenyuQR. Bütün hüquqlar qorunur.</span>
            <span>Azərbaycanda hazırlanıb 🇦🇿</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
