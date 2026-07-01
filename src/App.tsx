import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ExternalLink, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------
   GUEST APP – Versione completa e pulita
   ✅ Header fisso (logo + bandiere + tasto indietro)
   ✅ Home con tutte le 15 icone
   ✅ Clic su icona → PDF o testo integrato nella pagina
   ✅ Nessun download, nessun overlay
------------------------------------------------------------- */
const LANG_LABEL: Record<Lang, string> = {
  it: "LINGUA",
  en: "LANGUAGE",
  de: "SPRACHE",
  es: "IDIOMA",
  fr: "LANGUE",
};

const BRAND = { primary: "#9C3A30", accent: "#FCC45B" } as const;
type Lang = "it" | "en" | "de" | "fr" | "es";

type Item = {
  type: "text" | "link" | "pdf" | "pdf-embed" | "place" | "html";
  title: string;
  value?: string;   // per 'text' e 'html'
  href?: string;    // per 'link' e pdf
  address?: string; // per 'place'
  map?: string;     // per 'place'
};


type Category = { key: string; label: string; description: string; items: Item[] };
type AppContent = {
  houseId: string;
  houseName: string;
  address: string;
  wifi: { ssid: string; password: string };
  categories: Category[];
};

/* === BANDIERE === */
const CircleFlag: React.FC<{ code: Lang; size?: number }> = ({ code, size = 20 }) => {
  const Flag = () => {
    switch (code) {
      case "it":
        return (
          <>
            <rect width="1" height="2" x="0" fill="#009246" />
            <rect width="1" height="2" x="1" fill="#ffffff" />
            <rect width="1" height="2" x="2" fill="#ce2b37" />
          </>
        );
      case "en":
        return (
          <>
            <rect width="3" height="2" fill="#012169" />
            <path d="M0,0 L3,2" stroke="#ffffff" strokeWidth={0.3} />
            <path d="M3,0 L0,2" stroke="#ffffff" strokeWidth={0.3} />
            <path d="M0,0 L3,2" stroke="#c8102e" strokeWidth={0.18} />
            <path d="M3,0 L0,2" stroke="#c8102e" strokeWidth={0.18} />
            <rect x={0} y={0.8} width={3} height={0.4} fill="#ffffff" />
            <rect x={1.25} y={0} width={0.5} height={2} fill="#ffffff" />
            <rect x={0} y={0.9} width={3} height={0.2} fill="#c8102e" />
            <rect x={1.35} y={0} width={0.3} height={2} fill="#c8102e" />
          </>
        );
      case "de":
        return (
          <>
            <rect width="3" height="0.6667" y="0" fill="#000000" />
            <rect width="3" height="0.6667" y="0.6667" fill="#dd0000" />
            <rect width="3" height="0.6667" y="1.3334" fill="#ffce00" />
          </>
        );
      case "fr":
        return (
          <>
            <rect width="1" height="2" x="0" fill="#0055a4" />
            <rect width="1" height="2" x="1" fill="#ffffff" />
            <rect width="1" height="2" x="2" fill="#ef4135" />
          </>
        );
      case "es":
        return (
          <>
            <rect width="3" height="2" fill="#aa151b" />
            <rect width="3" height="1" y="0.5" fill="#f1bf00" />
          </>
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <clipPath id={`cf-${code}`}>
          <circle cx="30" cy="30" r="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#cf-${code})`}>
        <svg width="60" height="60" viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice">
          <Flag />
        </svg>
      </g>
      <circle cx="30" cy="30" r="28" fill="none" stroke={BRAND.accent} strokeWidth="2" />
    </svg>
  );
};
/* === COMPONENTE ROW === */
const Row: React.FC<{ icon?: React.ReactNode; title: string; subtitle?: string; href?: string }> = ({
  icon,
  title,
  subtitle,
  href,
}) => (
  <a
    href={href}
    target={href ? "_blank" : undefined}
    rel={href ? "noreferrer" : undefined}
    className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50"
  >
    {icon && <div className="shrink-0">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className="font-medium truncate">{title}</div>
      {subtitle && <div className="text-sm text-gray-600 truncate">{subtitle}</div>}
    </div>
  </a>
);

/* === ICONA HOME === */
const IconTile: React.FC<{ label: string; imgSrc: string; onClick: () => void }> = ({
  label,
  imgSrc,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-start gap-2 bg-transparent border-0 focus:outline-none transform transition-transform active:scale-90 hover:scale-95"
    aria-label={label}
    style={{ touchAction: "manipulation", width: "80px" }}
  >
    {/* Contenitore fisso per l’icona */}
    <div
      className="flex items-center justify-center"
      style={{
        width: "100px",
        height: "100px",
        padding: "4px",
        boxSizing: "border-box",
      }}
    >
      <img
        src={imgSrc}
        alt={label}
        className="block h-full w-full object-contain [-webkit-user-drag:none] select-none"
      />
    </div>

    {/* Etichetta testo lunga: mantiene una sola riga */}
    <span
      style={{
        fontFamily: "Cochin, serif",
        color: "#9C3A30",
        textTransform: "uppercase",
        fontWeight: 600,
        textAlign: "center",
        lineHeight: 1.1,
        maxWidth: "100%",
        display: "block",
        fontSize: "0.75rem",          // leggermente più piccolo
      }}
      title={label} // mostra il nome completo al passaggio (utile anche su mobile long-press)
    >
      {label}
    </span>
  </button>
);

//function cleanHtml(html?: string): string {
//if (!html) return "";
//let s = html;
  //s = s.replace(/<header[\s\S]*?<\/header>/gi, "");                     // header
  //s = s.replace(/<img[^>]+src=["'][^"']*logo\.png["'][^>]*>/gi, "");    // logo
  //s = s.replace(/<hr[^>]*>/gi, "");                                     // righe
  //s = s.replace(/<\/?(html|body|main)[^>]*>/gi, "");                    // wrapper pagina
  //return s;

function cleanHtml(html?: string): string {
  if (!html) return "";

  return html.replace(/\)\s*no-repeat[^>]*>/gi, ">");
}

const HtmlBlock: React.FC<{ html?: string }> = ({ html }) => {
  const safeHtml: string = cleanHtml(html);

  // Base path (in produzione con Vite base: "/wp-content/uploads/app/")
  // In dev di solito è "/"
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normBase = base.endsWith("/") ? base : base + "/";

  // Prefissa src/href relativi (evita http/https, data:, //, #, mailto:, tel:)
  const withBase = safeHtml.replace(
    /(src|href)=(['"])(?!https?:|data:|\/\/|#|mailto:|tel:)([^'"]+)\2/gi,
    (_m, attr, q, path) => {
      const p = path.startsWith("/") ? path.slice(1) : path; // evita doppio slash
      return `${attr}=${q}${normBase}${p}${q}`;
    }
  );

  return (
    <div
      className="max-w-none"
      style={{
        fontSize: "clamp(14px, 3.5vw, 16px)",
        lineHeight: 1.5,
        color: "#000000",
        paddingInline: "14px", // ✅ respiro laterale
        boxSizing: "border-box",
      }}
      dangerouslySetInnerHTML={{ __html: withBase }}
    />
  );
};



// i18n etichette icone/titoli per lingua
const I18N: Record<Lang, { labels: Record<string, string> }> = {
  it: { labels: {
    welcome: "Benvenuti",
    address: "Indirizzo",
    check: "Check-in/Out",
    wifi: "Wi-Fi",
    rules: "Regole",
    faq: "FAQ",
    recycling: "Rifiuti",
    market: "Market",
    restaurants: "Ristoranti",
    bars: "Bar",
    nightlife: "Locali",
    beaches: "Spiagge",
    activities: "Attività",
    transport: "Trasporti",
    reviews: "Recensioni",
  }},
  en: { labels: {
    welcome: "Welcome",
    address: "Address",
    check: "Check-in/Out",
    wifi: "Wi-Fi",
    rules: "House rules",
    faq: "FAQ",
    recycling: "Recycling",
    market: "Supermarket",
    restaurants: "Restaurants",
    bars: "Bars",
    nightlife: "Nightlife",
    beaches: "Beaches",
    activities: "Activities",
    transport: "Transport",
    reviews: "Reviews",
  }},
  de: { labels: {
    welcome: "Willkommen",
    address: "Adresse",
    check: "Check-in/Out",
    wifi: "WLAN",
    rules: "Hausordnung",
    faq: "FAQ",
    recycling: "Recycling",
    market: "Supermarkt",
    restaurants: "Restaurants",
    bars: "Bars",
    nightlife: "Nachtleben",
    beaches: "Strände",
    activities: "Aktivitäten",
    transport: "Verkehr",
    reviews: "Bewertungen",
  }},
  fr: { labels: {
    welcome: "Bienvenue",
    address: "Adresse",
    check: "Arrivée/Départ",
    wifi: "Wi-Fi",
    rules: "Règlement",
    faq: "FAQ",
    recycling: "Tri",
    market: "Supermarché",
    restaurants: "Restaurants",
    bars: "Bars",
    nightlife: "Vie nocturne",
    beaches: "Plages",
    activities: "Activités",
    transport: "Transports",
    reviews: "Avis",
  }},
  es: { labels: {
    welcome: "Bienvenidos",
    address: "Dirección",
    check: "Check-in/Out",
    wifi: "Wi-Fi",
    rules: "Normas",
    faq: "FAQ",
    recycling: "Reciclaje",
    market: "Supermercado",
    restaurants: "Restaurantes",
    bars: "Bares",
    nightlife: "Vida nocturna",
    beaches: "Playas",
    activities: "Actividades",
    transport: "Transporte",
    reviews: "Reseñas",
  }},
};
const I18N_WIFI = {
  it: {
    title: "WI-FI",
    name: "Nome rete Wi-Fi",
    password: "Password",
    copy: "Copia",
    copied: "✅ Copiato!",
    qrtext: "Se vuoi condividere facilmente l'accesso alla rete Wi-Fi, usa questo QR code.",
  },
  en: {
    title: "WI-FI",
    name: "Wi-Fi Network Name",
    password: "Password",
    copy: "Copy",
    copied: "✅ Copied!",
    qrtext: "If you want to share Wi-Fi access quickly, use this QR code.",
  },
  de: {
    title: "WI-FI",
    name: "WLAN-Netzwerkname",
    password: "Passwort",
    copy: "Kopieren",
    copied: "✅ Kopiert!",
    qrtext: "Wenn Sie den WLAN-Zugang schnell teilen möchten, verwenden Sie diesen QR-Code.",
  },
  es: {
    title: "WI-FI",
    name: "Nombre de la red Wi-Fi",
    password: "Contraseña",
    copy: "Copiar",
    copied: "✅ ¡Copiado!",
    qrtext: "Si quieres compartir el acceso al Wi-Fi rápidamente, utiliza este código QR.",
  },
  fr: {
    title: "WI-FI",
    name: "Nom du réseau Wi-Fi",
    password: "Mot de passe",
    copy: "Copier",
    copied: "✅ Copié !",
    qrtext: "Pour partager facilement l'accès au Wi-Fi, utilisez ce code QR.",
  },
};
// --- DEMO CONTENT (mettilo SOPRA alla funzione App) ---
const demoContent: AppContent = {
  houseId: "casavacanze",
  houseName: "Casa Vacanze",
  address: "Via della Pace 26, 09016 Iglesias (SU)",
  wifi: { ssid: "DomuMea-Guest", password: "Benvenuti2025" },
  categories: [
    { key: "welcome",    label: "Benvenuti",    description: "Messaggio di benvenuto", items: [
      { type: "html", title: "Benvenuti a Domu Mea", value: "<p>Cari ospiti, benvenuti!</p>" }
    ]},
    { key: "wifi",       label: "Wi-Fi",        description: "Dettagli rete", items: [
      { type: "text", title: "SSID", value: "DomuMea-Guest" },
      { type: "text", title: "Password", value: "Benvenuti2025" }
    ]},
    { key: "rules",      label: "Regole",       description: "Regole della casa", items: [] },
    { key: "address",    label: "Indirizzo",    description: "Come arrivare", items: [] },
    { key: "check",      label: "Check-in/Out", description: "Orari e istruzioni", items: [] },
    { key: "faq",        label: "FAQ",          description: "Domande frequenti", items: [] },
    { key: "recycling",  label: "Rifiuti",      description: "Raccolta differenziata", items: [] },
    { key: "market",     label: "Market",       description: "Spesa e prodotti", items: [] },
    { key: "restaurants",label: "Ristoranti",   description: "Consigliati in zona", items: [] },
    { key: "bars",       label: "Bar",          description: "Caffè e colazioni", items: [] },
    { key: "nightlife",  label: "Locali",       description: "Vita notturna", items: [] },
    { key: "beaches",    label: "Spiagge",      description: "Le migliori baie", items: [] },
    { key: "activities", label: "Attività",     description: "Escursioni e tour", items: [] },
    { key: "transport",  label: "Trasporti",    description: "Bus/taxi/noleggi", items: [] },
    { key: "reviews",    label: "Recensioni",   description: "Lascia un feedback", items: [] }
  ],
};

function isPdf(url?: string): boolean {
  if (!url) return false;
  try {
    const p = new URL(url, window.location.origin).pathname.toLowerCase();
    return p.endsWith(".pdf");
  } catch {
    return url.toLowerCase().endsWith(".pdf");
  }
}
import QRCode from "qrcode";

// escape per il formato WIFI: (backslash su caratteri speciali)
function escWifi(s: string) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

// QR Wi-Fi (supporta WPA/WEP/nopass)
const WifiQR: React.FC<{
  ssid: string;
  password?: string;
  encryption?: "WPA" | "WEP" | "nopass";
  size?: number; // px
}> = ({ ssid, password = "", encryption = "WPA", size = 180 }) => {
  const [dataUrl, setDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    const payload =
      `WIFI:T:${encryption};S:${escWifi(ssid)};` +
      (encryption !== "nopass" ? `P:${escWifi(password)};` : "") +
      `;`;
    QRCode.toDataURL(payload, { margin: 0, scale: 6 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [ssid, password, encryption]);

  if (!dataUrl) return null;
  return (
    <img
      src={dataUrl}
      alt="QR Wi-Fi"
      style={{ width: size, height: size }}
      className="block rounded-md border"
    />
  );
};

export default function App() {
  const [content, setContent] = useState<AppContent>(demoContent);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("it");
  const [langOpen, setLangOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

const handleCopy = async (text: string, key: string) => {
  await navigator.clipboard.writeText(text);

  setCopiedKey(key);

  setTimeout(() => {
    setCopiedKey(null);
  }, 1000);
};


  /* === CARICA JSON === */
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("house") || "domumea";

  const base = (import.meta as any).env?.BASE_URL || "/wp-content/uploads/app/";
  const mk = (p: string) => new URL(p, window.location.origin + base).toString();

  const tryUrls = [
    mk(`data/${id}.${lang}.json`),
    mk(`data/${id}.json`),
  ];

  (async () => {
    for (const url of tryUrls) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) {
          setContent(await r.json());
          return;
        }
      } catch {}
    }
  })();
}, [lang]);


  /* === TUTTE LE ICONE === */
 const ICONS = useMemo(
  () => [
    { key: "welcome", img: "handicons/benvenuti.svg" },
    { key: "address", img: "handicons/indirizzo.svg" },
    { key: "check", img: "handicons/check-out.svg" },
    { key: "wifi", img: "handicons/wifi.svg" },
    { key: "rules", img: "handicons/regole-della-casa.svg" },
    { key: "faq", img: "handicons/faq.svg" },
    { key: "recycling", img: "handicons/raccolta-differenziata.svg" },
    { key: "market", img: "handicons/supermarket.svg" },
    { key: "restaurants", img: "handicons/ristoranti.svg" },
    { key: "bars", img: "handicons/bar.svg" },
    { key: "nightlife", img: "handicons/locali-notturni.svg" },
    { key: "beaches", img: "handicons/spiagge.svg" },
    { key: "activities", img: "handicons/attivita.svg" },
    { key: "transport", img: "handicons/trasporti.svg" },
    { key: "reviews", img: "handicons/recensioni.svg" },
  ],
  []
);
type HomeTile = { key: string; iconImg: string; label: string };

const homeTiles: HomeTile[] = useMemo(() => {
  return ICONS
    .filter(i => content.categories.some(c => c.key === i.key))
    .map(i => ({
      key: i.key,
      iconImg: i.img,
      label: I18N[lang]?.labels[i.key] ?? i.key,
    }));
}, [content, ICONS, lang]);

  if (!content)
    return (
      <div className="text-center py-20 text-gray-500">Caricamento contenuti…</div>
    );

  const activeCategory = content.categories.find((c) => c.key === activeKey) || null;


/* === RENDER === */
return (
  <div
    className="min-h-screen"
    style={{
      backgroundImage: 'url("backgrounds/sfondo1.png")',
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "top center",
    }}
  >
    {/* Velo bianco sopra lo sfondo */}
    <div className="min-h-screen flex flex-col bg-white/95">
      
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#ffffff",
          borderBottom: `1px solid ${BRAND.primary}`,
        }}
      >
     <div
  style={{
    display: "grid",
    gridTemplateColumns: "56px 1fr 56px",
    alignItems: "center",
    padding: "4px 16px",
  }}
>
  {/* SINISTRA */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
    {activeCategory && (
      <button
        onClick={() => setActiveKey(null)}
        aria-label="Torna alla home"
        style={{ padding: 4, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer" }}
      >
        <ChevronLeft style={{ width: 22, height: 22, color: BRAND.primary }} />
      </button>
    )}
  </div>

  {/* CENTRO - LOGO (centrato matematicamente) */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    <img
      src="logo.png"
      alt="Logo Morada"
      style={{ width: 92, height: 80, objectFit: "contain", cursor: "pointer" }}
      onClick={() => setActiveKey(null)}
    />
  </div>

  {/* DESTRA - bandiera attiva + popup */}
<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
  <button
    onClick={() => setLangOpen((v) => !v)}
    aria-label="Seleziona lingua"
    style={{
      padding: 0,
      borderRadius: 999,
      border: "none",
      background: "transparent",
      cursor: "pointer",
    }}
  >
    <CircleFlag code={lang} size={22} />
  </button>
</div>
</div>
 </header>


{/* POPUP LINGUE */}
{langOpen && (
  <div
    onClick={() => setLangOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      background: "rgba(0,0,0,0.15)",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 76,
        right: 12,
        background: "#fff",
        borderRadius: 14,
        padding: 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: `1px solid rgba(156,58,48,0.18)`,
        minWidth: 160,
      }}
    >
      <div
  style={{
    fontSize: 11,
    color: BRAND.primary,
    fontWeight: 700,
    letterSpacing: "0.08em",
    marginBottom: 8,
  }}
>
  {LANG_LABEL[lang]}
</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {([
          { code: "it", label: "Italiano" },
          { code: "en", label: "English" },
          { code: "de", label: "Deutsch" },
          { code: "es", label: "Español" },
          { code: "fr", label: "Français" },
        ] as { code: Lang; label: string }[]).map((opt) => (
          <button
            key={opt.code}
            onClick={() => {
              setLang(opt.code);
              setLangOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: opt.code === lang ? "rgba(252,196,91,0.25)" : "transparent",
              textAlign: "left",
            }}
          >
            <CircleFlag code={opt.code} size={20} />
            <span style={{ fontSize: 13, color: "#000", fontWeight: 600 }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}
      {/* MAIN */}
      <main
          className="mx-auto w-full max-w-3xl px-4 sm:px-5 pb-6 relative flex-1"
          style={{
            paddingTop: 10,
            paddingBottom: 90,
          }}
        >

        <AnimatePresence initial={false} mode="wait">
          {!activeCategory ? (
      // ======= HOME (griglia icone)
      <motion.div
  key="home"
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
 className="grid grid-cols-3 w-full place-items-center gap-x-8 gap-y-4"

>
  {homeTiles.map((t) => (
    <IconTile
      key={t.key}
      label={t.label}
      imgSrc={t.iconImg}
     onClick={() => {
    setLangOpen(false);
    setActiveKey(t.key);
}}

      
    />
  ))}
</motion.div>

    ) : (
      // ======= PAGINA CATEGORIA (SOLO ITEMS)
      <motion.div
        key={activeCategory.key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="space-y-5"
      >
       {/* --- SOLO QUI: SEZIONE WI-FI PULITA (niente testi duplicati) --- */}
      {activeCategory?.key === "wifi" && content.wifi && (
  <div>
    {/* Titolo */}
    <h2
  style={{
    color: BRAND.primary,
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill="none"
    stroke={BRAND.primary}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h.01"></path>
    <path d="M2 8.82a15 15 0 0 1 20 0"></path>
    <path d="M5 12.859a10 10 0 0 1 14 0"></path>
    <path d="M8.5 16.429a5 5 0 0 1 7 0"></path>
  </svg>
  {I18N_WIFI[lang].title}
</h2>


    {/* Riquadro giallo con nome rete + password */}
    <div
      style={{
        background: "#FFF8E5",
        border: `1px solid ${BRAND.accent}`,
        borderRadius: "12px",
        padding: "12px 14px",
        marginBottom: "26px",
      }}
    >
      {/* Nome rete */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            color: BRAND.primary,
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          {I18N_WIFI[lang].name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "16px" }}>{content.wifi.ssid}</div>
<button
  onClick={() =>
    handleCopy(content.wifi.ssid || "", "ssid")
  }
  style={{
    background: copiedKey === "ssid" ? "#22c55e" : BRAND.primary,
    color: "white",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "13px",
    border: "none",
    whiteSpace: "nowrap",
    transition: "all 0.25s ease",
    transform:
      copiedKey === "ssid"
        ? "scale(1.05)"
        : "scale(1)",
  }}
>
  {copiedKey === "ssid"
  ? I18N_WIFI[lang].copied
  : I18N_WIFI[lang].copy}
</button>
       
        </div>
      </div>

      {/* Password */}
      <div>
        <div
          style={{
            color: BRAND.primary,
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          {I18N_WIFI[lang].password}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "16px" }}>{content.wifi.password}</div>
<button
  onClick={() =>
    handleCopy(content.wifi.password || "", "password")
  }
  style={{
    background:
      copiedKey === "password"
        ? "#22c55e"
        : BRAND.primary,
    color: "white",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "13px",
    border: "none",
    whiteSpace: "nowrap",
    transition: "all 0.25s ease",
    transform:
      copiedKey === "password"
        ? "scale(1.05)"
        : "scale(1)",
  }}
>
{copiedKey === "password"
  ? I18N_WIFI[lang].copied
  : I18N_WIFI[lang].copy}
</button>
          
        </div>
      </div>
    </div>

    {/* QR Code centrato */}
    <div
      style={{
        marginTop: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <WifiQR
        ssid={content.wifi.ssid}
        password={content.wifi.password}
        encryption="WPA"
        size={190}
      />

      <p
        style={{
          marginTop: "18px",
          fontSize: "14px",
          color: "#444",
          maxWidth: "260px",
          textAlign: "center",
        }}
      >
        {I18N_WIFI[lang].qrtext}
      </p>
    </div>
  </div>
)}




        {/* --- SOLO ITEMS (niente label/description categoria) --- */}
        <div className="space-y-4 pt-2">
          {activeCategory.items.map((it, idx) => {
            switch (it.type) {
              case "text":
                return <Row key={idx} title={it.title} subtitle={it.value ?? ""} />;

              case "link":
                return (
                  <Row
                    key={idx}
                    title={it.title}
                    href={it.href ?? "#"}
                    icon={<ExternalLink className="h-5 w-5" />}
                  />
                );

              case "html": {
                const anyItem = it as any;

                // Contenuto HTML multilingua
                const htmlForLang =
                  anyItem[`value_${lang}`] || anyItem.value || "";

                // Titolo multilingua
                const titleForLang =
                  anyItem[`title_${lang}`] || it.title || "";

                return (
                  <div key={idx} className="py-2">
                    {titleForLang && (
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: BRAND.primary }}
                      >
                        {titleForLang}
                      </h3>
                    )}

                    <HtmlBlock html={htmlForLang} />
                  </div>
                );
              }

              case "pdf":
              case "pdf-embed":
                if (isPdf(it.href)) {
                  return (
                    <div key={idx} className="py-2">
                      <div className="w-full" style={{ height: "80vh", border: "1px solid #eee" }}>
                        <iframe
                          src={`${it.href}#view=FitH`}
                          title={it.title}
                          className="w-full h-full"
                          style={{ border: "none" }}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <Row
                    key={idx}
                    title={it.title}
                    href={it.href ?? "#"}
                    icon={<ExternalLink className="h-5 w-5" />}
                  />
                );

              case "place":
                return (
                  <Row
                    key={idx}
                    title={it.title}
                    subtitle={it.address ?? ""}
                    href={it.map ?? undefined}
                    icon={<MapPin className="h-5 w-5" />}
                  />
                );

              default:
                return null;
            }
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</main>

    {/* FOOTER */}
      <footer className="mx-auto max-w-3xl px-4 pb-4">
        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} MORADA SRL. Tutti i diritti riservati.
        </div>
      </footer>

    </div>
  </div>
);
}
