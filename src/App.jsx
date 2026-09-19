import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import {
  Search, Home, Library, User, Settings, X, Menu, ChevronLeft, ChevronRight,
  Heart, MessageCircle, Star, Bookmark, Download, Sun, Moon, Coffee,
  Maximize, Minimize, EyeOff, Eye, ArrowUp, ArrowDown, Play, Pause,
  Flag, Pin, ThumbsUp, Reply, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  TrendingUp, Sparkles, Clock, CheckCircle, PauseCircle, XCircle, PlusCircle,
  LogOut, Camera, Award, BarChart2, Filter, Globe, Type, Palette, Grid,
  List as ListIcon, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Send, Loader,
  Info, Mail, BookOpen, Users, Layers, BarChart3, Bell, Languages, Compass,
  Image as ImageIcon, Trash2, Sliders, Layout, LayoutGrid, Wand2, ArrowUpDown, Check
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://komiverso-server.onrender.com/api";
const COVERS = "https://komiverso-server.onrender.com/covers";

const SOCIAL_LINKS = {
  discord: "https://discord.gg/c9TMgFfNGH",
  tiktok: "https://www.tiktok.com/@komi.verso?_r=1&_t=ZS-99pgvlGtSCL",
  paypal: "https://paypal.me/DiegoRivas497",
};

const APK_DOWNLOAD_URL = "https://komi-verso-downloadapp.vercel.app/";

// === CONFIGURACIÓN DE ANUNCIOS ===
// 👉 Pon aquí tu key real de Adsterra (la de la unidad "Banner 300x250" del SITIO WEB, no la de la app).
const EXOCLICK_ZONE_ID = "1112834";
const ADSTERRA_KEY = "f9070d64740e53c83baf5a67aedd9520"; // <-- CAMBIA ESTO por la key de Adsterra de tu web
const AD_MIN_SECONDS = 15;
const AD_EVERY_N_CHAPTERS = 3;
const ADSENSE_CONFIGURADO = !!EXOCLICK_ZONE_ID || !!ADSTERRA_KEY;
const EXOCLICK_SCRIPT_SRC = "https://a.magsrv.com/ad-provider.js";

// Ambas redes se piden al mismo tiempo, cada una en su propio slot independiente.
// Ninguna espera a la otra ni depende de que la otra falle: si ExoClick no
// devuelve anuncio, el slot de Adsterra igual se muestra (y viceversa).
function buildAdHtml() {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
html,body{margin:0;padding:0;background:transparent;overflow:hidden;}
.kv-ad-row{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:14px;padding-top:6px;}
.kv-ad-slot{width:300px;height:250px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
</style>
</head><body>
<div class="kv-ad-row">
  <div id="slotExoclick" class="kv-ad-slot"></div>
  <div id="slotAdsterra" class="kv-ad-slot"></div>
</div>
<script>
${EXOCLICK_ZONE_ID ? `
(function(){
  var ins=document.createElement("ins");
  ins.className="eas6a97888e2";
  ins.setAttribute("data-zoneid","${EXOCLICK_ZONE_ID}");
  document.getElementById("slotExoclick").appendChild(ins);
  var exo=document.createElement("script");
  exo.async=true; exo.setAttribute("data-cfasync","false");
  exo.src="${EXOCLICK_SCRIPT_SRC}";
  exo.onload=function(){ try{(window.AdProvider=window.AdProvider||[]).push({serve:{}});}catch(e){} };
  document.body.appendChild(exo);
})();` : ``}
${ADSTERRA_KEY ? `
(function(){
  var opts=document.createElement("script"); opts.type="text/javascript";
  opts.text="atOptions = { key: '${ADSTERRA_KEY}', format: 'iframe', height: 250, width: 300, params: {} };";
  document.getElementById("slotAdsterra").appendChild(opts);
  var invoke=document.createElement("script"); invoke.type="text/javascript";
  invoke.src="//www.highperformanceformat.com/${ADSTERRA_KEY}/invoke.js";
  document.getElementById("slotAdsterra").appendChild(invoke);
})();` : ``}
</script></body></html>`;
}

const PLANS = [
  { id: "free", nombre: "Free", precio: "$0", periodo: "", detalle: "Anuncios cada 4 capítulos" },
  { id: "fan", nombre: "Fan", precio: "$7", periodo: "USD / mes", detalle: "Te quitamos los anuncios y nos estarias apoyando un montón ♥." },
];

function resolveAssetUrl(src) {
  if (!src) return src;
  if (src.startsWith("/api/")) return `${API}${src.slice(4)}`;
  return src;
}

const FONTS = [
  { id: "inter", label: "Inter", family: "'Inter', sans-serif", url: "Inter:wght@400;500;600;700" },
  { id: "manrope", label: "Manrope", family: "'Manrope', sans-serif", url: "Manrope:wght@400;500;600;700" },
  { id: "space", label: "Space Grotesk", family: "'Space Grotesk', sans-serif", url: "Space+Grotesk:wght@400;500;700" },
  { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif", url: "Poppins:wght@400;500;600;700" },
  { id: "nunito", label: "Nunito", family: "'Nunito', sans-serif", url: "Nunito:wght@400;600;700" },
  { id: "lora", label: "Lora", family: "'Lora', serif", url: "Lora:wght@400;500;600;700" },
  { id: "merriweather", label: "Merriweather", family: "'Merriweather', serif", url: "Merriweather:wght@400;700" },
  { id: "bitter", label: "Bitter", family: "'Bitter', serif", url: "Bitter:wght@400;600;700" },
  { id: "crimson", label: "Crimson Text", family: "'Crimson Text', serif", url: "Crimson+Text:wght@400;600;700" },
  { id: "comic", label: "Comic Neue", family: "'Comic Neue', cursive", url: "Comic+Neue:wght@400;700" },
  { id: "jetbrains", label: "JetBrains Mono", family: "'JetBrains Mono', monospace", url: "JetBrains+Mono:wght@400;600" },
];

const PRESETS = [
  { id: "tinta", label: "Tinta", mode: "dark", bg: "#0F1115", surface: "#171A21", surface2: "#1F232D", accent: "#E8543E", text: "#ECEAE6", muted: "#8B90A0", border: "#262B36" },
  { id: "sumi", label: "Sumi-e", mode: "dark", bg: "#121212", surface: "#1B1B1B", surface2: "#242424", accent: "#D4AF37", text: "#EDEDED", muted: "#8F8F8F", border: "#2A2A2A" },
  { id: "sakura", label: "Sakura", mode: "light", bg: "#FFF7F8", surface: "#FFFFFF", surface2: "#FDEEF0", accent: "#E8547A", text: "#2A1E22", muted: "#8A7075", border: "#F3DDE1" },
  { id: "midnight", label: "Medianoche", mode: "dark", bg: "#0B0F1A", surface: "#121729", surface2: "#1A2038", accent: "#5B7CFA", text: "#E7E9F5", muted: "#8188A8", border: "#232A46" },
  { id: "forest", label: "Bosque", mode: "dark", bg: "#0E1512", surface: "#151F1A", surface2: "#1C2A23", accent: "#4FCB8E", text: "#E4EEE8", muted: "#7E9689", border: "#22322A" },
  { id: "paper", label: "Papel", mode: "light", bg: "#F7F4EC", surface: "#FFFFFF", surface2: "#EFEBDD", accent: "#B05A2E", text: "#2B2620", muted: "#847A69", border: "#E5DFCB" },
  { id: "neon", label: "Neo Tokio", mode: "dark", bg: "#08080D", surface: "#121017", surface2: "#1B1822", accent: "#FF3D8A", text: "#F2EEFB", muted: "#8B85A0", border: "#26212E" },
  { id: "ocean", label: "Océano", mode: "dark", bg: "#081319", surface: "#0E1E26", surface2: "#132A34", accent: "#37C9C1", text: "#E4F4F3", muted: "#7CA0A2", border: "#1B3640" },
  { id: "lavanda", label: "Lavanda", mode: "light", bg: "#F7F5FC", surface: "#FFFFFF", surface2: "#EEE9F9", accent: "#8B5CF6", text: "#241E33", muted: "#867E99", border: "#E3DBF3" },
  { id: "obsidiana", label: "Obsidiana", mode: "dark", bg: "#000000", surface: "#0A0A0A", surface2: "#141414", accent: "#F5F5F5", text: "#F2F2F2", muted: "#7A7A7A", border: "#1F1F1F" },
  { id: "manhwa", label: "Webtoon", mode: "light", bg: "#FFFFFF", surface: "#F9F9FB", surface2: "#F0F1F5", accent: "#00D564", text: "#1A1A1A", muted: "#767676", border: "#E7E7EC" },
  { id: "vino", label: "Vino", mode: "dark", bg: "#150A0D", surface: "#1E0F13", surface2: "#28141A", accent: "#D6455E", text: "#F1E4E6", muted: "#9C7E83", border: "#33191F" },
  { id: "arena", label: "Arena", mode: "light", bg: "#FAF3E7", surface: "#FFFDF8", surface2: "#F1E5CE", accent: "#C77B3B", text: "#2E2417", muted: "#8A7B62", border: "#E9DBBB" },
  { id: "grafito", label: "Grafito", mode: "dark", bg: "#131417", surface: "#1A1B20", surface2: "#212228", accent: "#9AA5FF", text: "#E9E9EE", muted: "#84869A", border: "#26272E" },
  { id: "citrico", label: "Cítrico", mode: "light", bg: "#FDFBF1", surface: "#FFFFFF", surface2: "#F5F1D9", accent: "#E8A83B", text: "#242017", muted: "#8C8468", border: "#EDE6C4" },
];

const XP_PER_CHAPTER = 15;
const LEVEL_THRESHOLDS = (() => {
  const t = [0];
  for (let i = 1; i <= 50; i++) t.push(Math.floor(t[i - 1] + 40 + i * 18));
  return t;
})();
function levelFromXp(xp) {
  let lv = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lv = i + 1;
    else break;
  }
  return Math.min(50, lv);
}
function xpProgress(xp) {
  const level = levelFromXp(xp);
  const cur = LEVEL_THRESHOLDS[level - 1] || 0;
  const next = LEVEL_THRESHOLDS[level] || (cur + 100);
  return { level, cur, next, into: xp - cur, need: next - cur, pct: Math.min(100, Math.round(((xp - cur) / (next - cur || 1)) * 100)) };
}
const RANKS = [
  { minLevel: 1, id: "novato", label: "Novato", icon: "·" },
  { minLevel: 5, id: "lector", label: "Lector", icon: "·" },
  { minLevel: 10, id: "asiduo", label: "Lector asiduo", icon: "·" },
  { minLevel: 15, id: "veterano", label: "Veterano", icon: "★" },
  { minLevel: 20, id: "erudito", label: "Erudito", icon: "·" },
  { minLevel: 30, id: "leyenda", label: "Leyenda", icon: "◆" },
  { minLevel: 40, id: "mitico", label: "Mítico", icon: "◇" },
  { minLevel: 50, id: "inmortal", label: "Inmortal", icon: "▲" },
];
function rankForLevel(level) {
  let r = RANKS[0];
  for (const x of RANKS) if (level >= x.minLevel) r = x;
  return r;
}
const TITLE_DEFS = [
  { id: "primer_paso", label: "Primer paso", minChapters: 1 },
  { id: "constante", label: "Lector constante", minChapters: 25 },
  { id: "devorador", label: "Devorador de historias", minChapters: 100 },
  { id: "biblioteca", label: "Biblioteca ambulante", minChapters: 250 },
  { id: "archivero", label: "Archivero", minChapters: 500 },
  { id: "rango_lector", label: "Rango: Lector", minLevel: 5 },
  { id: "rango_asiduo", label: "Rango: Asiduo", minLevel: 10 },
  { id: "rango_veterano", label: "Rango: Veterano", minLevel: 15 },
  { id: "rango_erudito", label: "Rango: Erudito", minLevel: 20 },
  { id: "rango_leyenda", label: "Rango: Leyenda", minLevel: 30 },
  { id: "rango_mitico", label: "Rango: Mítico", minLevel: 40 },
  { id: "rango_inmortal", label: "Rango: Inmortal", minLevel: 50 },
];
function titlesUnlocked(xp, chaptersRead) {
  const level = levelFromXp(xp);
  return TITLE_DEFS.filter(t => {
    if (t.minChapters != null && chaptersRead >= t.minChapters) return true;
    if (t.minLevel != null && level >= t.minLevel) return true;
    return false;
  }).map(t => t.label);
}

const DEFAULT_TAB_ORDER = ["home", "search", "calendar", "library", "profile"];
const TAB_META = {
  home: { labelKey: "home", Icon: Home },
  search: { labelKey: "search", Icon: Search },
  calendar: { labelKey: "calendar", Icon: CalendarIcon },
  library: { labelKey: "library", Icon: Library },
  profile: { labelKey: "profile", Icon: User },
};

const GENRE_MAP = {
  "Acción": "391b0423-d847-456f-aff0-8b0cfc03066b", "Aventura": "87cc87cd-a395-47af-b27a-93258283bbc6",
  "Romance": "423e2eae-a7a2-4a8b-ac03-a8351462d71d", "Comedia": "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  "Drama": "b9af3a63-f058-46de-a9a0-e0c13906197a", "Fantasía": "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
  "Terror": "cdad7e68-1419-41dd-bdce-27753074a640", "Misterio": "ee968100-4191-4968-93d3-f82d72be7e46",
  "Psicológico": "3b60b75c-a2d7-4860-ab56-05f391bb889c", "Escolar": "caaa44eb-cd40-4177-b930-79d3ef2afe87",
  "Histórico": "33771934-028e-4cb3-8744-691e866a923e", "Isekai": "ace04997-f6bd-436e-b261-779182193d3d",
  "Artes marciales": "799c202e-7daa-44eb-9cf7-8a3c0441531e", "Magia": "a1f53773-c69a-4ce5-8cab-fffcd90b1565",
  "Ciencia ficción": "256c8bd9-4904-4360-bf4f-508a76d67183", "Reencarnación": "0bc90acb-1c75-4c2d-86c1-4bd3cbf3e8e6",
  "Superpoderes": "5bd0e105-4481-44ca-b6e7-7544da56b1a3", "Tragedia": "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
  "Trama": "577b2a58-a165-49d1-8025-8bd60d6425d0", "Vida cotidiana": "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
};
const DEMOGRAPHICS = { "Shounen": "shounen", "Shoujo": "shoujo", "Seinen": "seinen", "Josei": "josei" };
const GENRE_ID_TO_NAME = Object.fromEntries(Object.entries(GENRE_MAP).map(([name, id]) => [id, name]));
const ORIGINS = { "Manga (Japón)": "ja", "Manhwa (Corea)": "ko", "Manhua (China)": "zh" };
const STATUSES = { "En emisión": "ongoing", "Finalizado": "completed", "Hiatus": "hiatus", "Cancelado": "cancelled" };

const LANGS = [
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "pt", label: "Português", flag: "🇧🇷" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
];

const I18N = {
  es: {
    home: "Inicio", search: "Buscar", calendar: "Calendario", library: "Biblioteca", profile: "Perfil",
    settings: "Configuración", enter: "Entrar", login: "Iniciar sesión", signup: "Crear cuenta",
    logout: "Cerrar sesión", favorites: "Favoritos", reading: "En lectura", completed: "Completados",
    pending: "Pendientes", paused: "Pausados", dropped: "Abandonados", history: "Historial",
    continueReading: "Continuar leyendo", trending: "Tendencias", recentlyUpdated: "Actualizados recientemente",
    topRated: "Mejor valorados", popularManhwa: "Manhwa populares", newTitles: "Nuevas obras",
    seeAll: "Ver todo", update: "Actualizar", searchingNews: "Buscando novedades…", contentLoaded: "Contenido cargado",
    chapters: "Capítulos", similar: "Similares", comments: "Comentarios", addToList: "Añadir a lista",
    favorite: "Favorito", inFavorites: "En favoritos", noSynopsis: "Sin sinopsis disponible.",
    noChapters: "No hay capítulos traducidos disponibles todavía.", filterLang: "Idioma",
    allLangs: "Todos", langEs: "Español", langEsLa: "Español (LATAM)", langEn: "Inglés",
    chapter: "Capítulo", language: "Idioma", date: "Fecha", status: "Estado",
    myAccount: "Mi cuenta", myLists: "Mis listas", statistics: "Estadísticas",
    explore: "Explorar", allTitles: "Todos los títulos", manga: "Manga", manhwa: "Manhwa",
    manhua: "Manhua", novels: "Novelas", genres: "Géneros", community: "Comunidad",
    reviews: "Reseñas", publicLists: "Listas públicas", appearance: "Apariencia",
    reader: "Lector", notifications: "Notificaciones", account: "Cuenta", information: "Información",
    about: "Acerca de", contact: "Contacto", reportProblem: "Reportar problema", suggestion: "Sugerencias",
    theme: "Tema", readingFont: "Fuente de lectura", uiLanguage: "Idioma de la interfaz",
    interfaceLangNote: "los capitulos pueden caer, repórtalo.",
    noResults: "Sin resultados. Prueba con otros filtros.", retry: "Reintentar",
    loginToSave: "Inicia sesión para guardar tu biblioteca, favoritos e historial.",
    loginToProfile: "Inicia sesión para ver tu perfil.", loginToComment: "Inicia sesión para comentar y dejar reseñas",
    emptyList: "Lista vacía.", noHistory: "Sin historial todavía.", saveChanges: "Guardar cambios", saved: "Guardado ✓",
    removeFromLists: "Quitar de listas", showSpoiler: "Mostrar spoiler", publish: "Publicar",
    containsSpoiler: "Contiene spoiler", writeComment: "Escribe un comentario…", newest: "nuevos", popular: "populares",
    noComments: "Aún no hay comentarios. ¡Sé el primero!", nextChapter: "Siguiente capítulo", prevChapter: "Anterior",
    endOfChapter: "Fin del capítulo", vertical: "Vertical", paged: "Página", zoomIn: "Zoom+", zoomOut: "Zoom-",
    reset: "Reset", width: "Ancho", height: "Alto", dark: "Oscuro", sepia: "Sepia", highQual: "Alta cal.", saver: "Ahorro",
    auto: "Auto", fullscreen: "Pantalla", top: "Arriba", bottom: "Final", speed: "Velocidad",
    shortcuts: "Atajos: ←/→ · f pantalla · h ocultar · d oscuro", onlyFavorites: "Solo mis favoritos ❤️",
    calendarEstimate: "Estimado según lanzamientos recientes de obras en emisión.", noWorks: "Sin obras.",
    readerLevel: "Nivel de lector", achievements: "Logros", username: "Nombre de usuario", bio: "Biografía",
    chaptersRead: "Capítulos leídos", hoursEst: "Horas estimadas", categories: "Categorías",
    originAll: "Origen: todos", statusAll: "Estado: todos", demoAll: "Demografía: todas", langAll: "Idioma: todos",
    sortBy: "Ordenar por", relevance: "Relevancia", popularity: "Popularidad", rating: "Calificación",
    updateSort: "Actualización", year: "Año", name: "Nombre", titleAuthor: "Título, autor, artista…",
    forgotPassword: "Olvidé mi contraseña", createAccount: "Crear cuenta", alreadyHave: "Ya tengo cuenta",
    recoverPassword: "Recuperar contraseña", resetBtn: "Restablecer", backToLogin: "Volver a inicio de sesión",
    email: "Correo", password: "Contraseña", newPassword: "Nueva contraseña", confirmPassword: "Confirmar contraseña",
    noVerification: "Sin verificación por correo — el registro queda activo de inmediato.",
    recoverNote: "Como no hay verificación por correo, cualquiera con este email podría restablecer la contraseña. Úsalo solo para tu propia demo.",
    passwordUpdated: "Contraseña actualizada. Ya puedes iniciar sesión.",
    completeFields: "Completa todos los campos.", minPassword: "La contraseña debe tener al menos 4 caracteres.",
    completeEmailPass: "Completa correo y contraseña.", passwordsMismatch: "Las contraseñas no coinciden.",
    enterEmailNewPass: "Ingresa tu correo y la nueva contraseña.",
    aboutText: "KōmiVerso es una alternativa a otros lectores, su host actual es gratuito asi que presentara muchas caidas, esperamos con el apoyo de nuestros lectores y con ingresos de la misma app poder ofrecer un mejor servicio.",
    contactText: "¿Sugerencias o problemas? Escríbenos a komisupport@gmail.com",
    reportSent: "Problema reportado. Gracias por avisarnos.", reportPlaceholder: "Describe el problema…",
    sendReport: "Enviar reporte", close: "Cerrar",
    suggestionTitleLabel: "Título", suggestionTitlePh: "Un título corto para tu idea…",
    suggestionDescLabel: "Descripción", suggestionDescPh: "Describe tu sugerencia…",
    suggestionHelpLabel: "¿Cómo ayudaría esto?", suggestionHelpPh: "Explica cómo mejoraría la app o a la comunidad…",
    suggestionMissing: "Completa el título, la descripción y cómo ayudaría.",
    suggestionSent: "¡Sugerencia enviada! Gracias por tu aporte.",
    suggestionError: "No se pudo enviar. Intenta de nuevo más tarde.",
    reportError: "No se pudo enviar el reporte. Revisa tu conexión e inténtalo de nuevo.",
    sendSuggestion: "Enviar sugerencia", sendingSuggestion: "Enviando…",
  },
  en: {
    home: "Home", search: "Search", calendar: "Calendar", library: "Library", profile: "Profile",
    settings: "Settings", enter: "Sign in", login: "Sign in", signup: "Create account",
    logout: "Sign out", favorites: "Favorites", reading: "Reading", completed: "Completed",
    pending: "Plan to read", paused: "On hold", dropped: "Dropped", history: "History",
    continueReading: "Continue reading", trending: "Trending", recentlyUpdated: "Recently updated",
    topRated: "Top rated", popularManhwa: "Popular manhwa", newTitles: "New titles",
    seeAll: "See all", update: "Refresh", searchingNews: "Looking for updates…", contentLoaded: "Content loaded",
    chapters: "Chapters", similar: "Similar", comments: "Comments", addToList: "Add to list",
    favorite: "Favorite", inFavorites: "In favorites", noSynopsis: "No synopsis available.",
    noChapters: "No translated chapters available yet.", filterLang: "Language",
    allLangs: "All", langEs: "Spanish", langEsLa: "Spanish (LATAM)", langEn: "English",
    chapter: "Chapter", language: "Language", date: "Date", status: "Status",
    myAccount: "My account", myLists: "My lists", statistics: "Statistics",
    explore: "Explore", allTitles: "All titles", manga: "Manga", manhwa: "Manhwa",
    manhua: "Manhua", novels: "Novels", genres: "Genres", community: "Community",
    reviews: "Reviews", publicLists: "Public lists", appearance: "Appearance",
    reader: "Reader", notifications: "Notifications", account: "Account", information: "Information",
    about: "About", contact: "Contact", reportProblem: "Report a problem",
    theme: "Theme", readingFont: "Reading font", uiLanguage: "Interface language",
    interfaceLangNote: "Available chapters depend on existing translations on MangaDex for each language.",
    noResults: "No results. Try different filters.", retry: "Retry",
    loginToSave: "Sign in to save your library, favorites and history.",
    loginToProfile: "Sign in to view your profile.", loginToComment: "Sign in to comment and leave reviews",
    emptyList: "Empty list.", noHistory: "No history yet.", saveChanges: "Save changes", saved: "Saved ✓",
    removeFromLists: "Remove from lists", showSpoiler: "Show spoiler", publish: "Post",
    containsSpoiler: "Contains spoiler", writeComment: "Write a comment…", newest: "newest", popular: "popular",
    noComments: "No comments yet. Be the first!", nextChapter: "Next chapter", prevChapter: "Previous",
    endOfChapter: "End of chapter", vertical: "Vertical", paged: "Paged", zoomIn: "Zoom+", zoomOut: "Zoom-",
    reset: "Reset", width: "Width", height: "Height", dark: "Dark", sepia: "Sepia", highQual: "HQ", saver: "Saver",
    auto: "Auto", fullscreen: "Fullscreen", top: "Top", bottom: "End", speed: "Speed",
    shortcuts: "Shortcuts: ←/→ · f fullscreen · h hide · d dark", onlyFavorites: "Only my favorites ❤️",
    calendarEstimate: "Estimate based on recent releases of ongoing series.", noWorks: "No titles.",
    readerLevel: "Reader level", achievements: "Achievements", username: "Username", bio: "Bio",
    chaptersRead: "Chapters read", hoursEst: "Estimated hours", categories: "Categories",
    originAll: "Origin: all", statusAll: "Status: all", demoAll: "Demographic: all", langAll: "Language: all",
    sortBy: "Sort by", relevance: "Relevance", popularity: "Popularity", rating: "Rating",
    updateSort: "Updated", year: "Year", name: "Name", titleAuthor: "Title, author, artist…",
    forgotPassword: "Forgot password", createAccount: "Create account", alreadyHave: "I already have an account",
    recoverPassword: "Reset password", resetBtn: "Reset", backToLogin: "Back to sign in",
    email: "Email", password: "Password", newPassword: "New password", confirmPassword: "Confirm password",
    noVerification: "No email verification — registration is active immediately.",
    recoverNote: "Since there is no email verification, anyone with this email could reset the password. Use only for your own demo.",
    passwordUpdated: "Password updated. You can sign in now.",
    completeFields: "Fill in all fields.", minPassword: "Password must be at least 4 characters.",
    completeEmailPass: "Enter email and password.", passwordsMismatch: "Passwords do not match.",
    enterEmailNewPass: "Enter your email and the new password.",
    aboutText: "KōmiVerso is a manga, manhwa and manhua reader powered by MangaDex. Built for a smooth, customizable reading experience.",
    contactText: "Suggestions or issues? Write to soporte@komiverso.app",
    reportSent: "Problem reported. Thank you.", reportPlaceholder: "Describe the problem…",
    sendReport: "Send report", close: "Close",
  },
  pt: {
    home: "Início", search: "Buscar", calendar: "Calendário", library: "Biblioteca", profile: "Perfil",
    settings: "Configurações", enter: "Entrar", login: "Entrar", signup: "Criar conta",
    logout: "Sair", favorites: "Favoritos", reading: "Lendo", completed: "Completos",
    pending: "Pendentes", paused: "Pausados", dropped: "Abandonados", history: "Histórico",
    continueReading: "Continuar lendo", trending: "Em alta", recentlyUpdated: "Atualizados recentemente",
    topRated: "Mais bem avaliados", popularManhwa: "Manhwa populares", newTitles: "Novas obras",
    seeAll: "Ver tudo", update: "Atualizar", searchingNews: "Buscando novidades…", contentLoaded: "Conteúdo carregado",
    chapters: "Capítulos", similar: "Similares", comments: "Comentários", addToList: "Adicionar à lista",
    favorite: "Favorito", inFavorites: "Nos favoritos", noSynopsis: "Sinopse não disponível.",
    noChapters: "Ainda não há capítulos traduzidos.", filterLang: "Idioma",
    allLangs: "Todos", langEs: "Espanhol", langEsLa: "Espanhol (LATAM)", langEn: "Inglês",
    chapter: "Capítulo", language: "Idioma", date: "Data", status: "Status",
    myAccount: "Minha conta", myLists: "Minhas listas", statistics: "Estatísticas",
    explore: "Explorar", allTitles: "Todos os títulos", manga: "Manga", manhwa: "Manhwa",
    manhua: "Manhua", novels: "Novelas", genres: "Gêneros", community: "Comunidade",
    reviews: "Resenhas", publicLists: "Listas públicas", appearance: "Aparência",
    reader: "Leitor", notifications: "Notificações", account: "Conta", information: "Informação",
    about: "Sobre", contact: "Contato", reportProblem: "Reportar problema",
    theme: "Tema", readingFont: "Fonte de leitura", uiLanguage: "Idioma da interface",
    interfaceLangNote: "Os capítulos disponíveis dependem das traduções existentes no MangaDex para cada idioma.",
    noResults: "Sem resultados. Tente outros filtros.", retry: "Tentar de novo",
    loginToSave: "Entre para salvar sua biblioteca, favoritos e histórico.",
    loginToProfile: "Entre para ver seu perfil.", loginToComment: "Entre para comentar e deixar resenhas",
    emptyList: "Lista vazia.", noHistory: "Sem histórico ainda.", saveChanges: "Salvar alterações", saved: "Salvo ✓",
    removeFromLists: "Remover das listas", showSpoiler: "Mostrar spoiler", publish: "Publicar",
    containsSpoiler: "Contém spoiler", writeComment: "Escreva um comentário…", newest: "recentes", popular: "populares",
    noComments: "Ainda não há comentários. Seja o primeiro!", nextChapter: "Próximo capítulo", prevChapter: "Anterior",
    endOfChapter: "Fim do capítulo", vertical: "Vertical", paged: "Página", zoomIn: "Zoom+", zoomOut: "Zoom-",
    reset: "Reset", width: "Largura", height: "Altura", dark: "Escuro", sepia: "Sépia", highQual: "Alta qual.", saver: "Economia",
    auto: "Auto", fullscreen: "Tela cheia", top: "Topo", bottom: "Final", speed: "Velocidade",
    shortcuts: "Atalhos: ←/→ · f tela · h ocultar · d escuro", onlyFavorites: "Só meus favoritos ❤️",
    calendarEstimate: "Estimativa com base em lançamentos recentes de obras em andamento.", noWorks: "Sem obras.",
    readerLevel: "Nível de leitor", achievements: "Conquistas", username: "Nome de usuário", bio: "Biografia",
    chaptersRead: "Capítulos lidos", hoursEst: "Horas estimadas", categories: "Categorias",
    originAll: "Origem: todas", statusAll: "Status: todos", demoAll: "Demografia: todas", langAll: "Idioma: todos",
    sortBy: "Ordenar por", relevance: "Relevância", popularity: "Popularidade", rating: "Avaliação",
    updateSort: "Atualização", year: "Ano", name: "Nome", titleAuthor: "Título, autor, artista…",
    forgotPassword: "Esqueci a senha", createAccount: "Criar conta", alreadyHave: "Já tenho conta",
    recoverPassword: "Recuperar senha", resetBtn: "Redefinir", backToLogin: "Voltar ao login",
    email: "E-mail", password: "Senha", newPassword: "Nova senha", confirmPassword: "Confirmar senha",
    noVerification: "Sem verificação por e-mail — o registro fica ativo imediatamente.",
    recoverNote: "Como não há verificação por e-mail, qualquer um com este e-mail poderia redefinir a senha. Use apenas para sua demo.",
    passwordUpdated: "Senha atualizada. Você já pode entrar.",
    completeFields: "Preencha todos os campos.", minPassword: "A senha deve ter pelo menos 4 caracteres.",
    completeEmailPass: "Preencha e-mail e senha.", passwordsMismatch: "As senhas não coincidem.",
    enterEmailNewPass: "Digite seu e-mail e a nova senha.",
    aboutText: "KōmiVerso é um leitor de manga, manhwa e manhua alimentado pelo MangaDex. Feito para uma leitura fluida e personalizável.",
    contactText: "Sugestões ou problemas? Escreva para soporte@komiverso.app",
    reportSent: "Problema reportado. Obrigado.", reportPlaceholder: "Descreva o problema…",
    sendReport: "Enviar reporte", close: "Fechar",
  },
  fr: {
    home: "Accueil", search: "Rechercher", calendar: "Calendrier", library: "Bibliothèque", profile: "Profil",
    settings: "Paramètres", enter: "Connexion", login: "Connexion", signup: "Créer un compte",
    logout: "Déconnexion", favorites: "Favoris", reading: "En cours", completed: "Terminés",
    pending: "À lire", paused: "En pause", dropped: "Abandonnés", history: "Historique",
    continueReading: "Continuer la lecture", trending: "Tendances", recentlyUpdated: "Récemment mis à jour",
    topRated: "Mieux notés", popularManhwa: "Manhwa populaires", newTitles: "Nouveaux titres",
    seeAll: "Tout voir", update: "Actualiser", searchingNews: "Recherche de nouveautés…", contentLoaded: "Contenu chargé",
    chapters: "Chapitres", similar: "Similaires", comments: "Commentaires", addToList: "Ajouter à la liste",
    favorite: "Favori", inFavorites: "Dans les favoris", noSynopsis: "Pas de synopsis disponible.",
    noChapters: "Aucun chapitre traduit disponible pour le moment.", filterLang: "Langue",
    allLangs: "Tous", langEs: "Espagnol", langEsLa: "Espagnol (LATAM)", langEn: "Anglais",
    chapter: "Chapitre", language: "Langue", date: "Date", status: "Statut",
    myAccount: "Mon compte", myLists: "Mes listes", statistics: "Statistiques",
    explore: "Explorer", allTitles: "Tous les titres", manga: "Manga", manhwa: "Manhwa",
    manhua: "Manhua", novels: "Romans", genres: "Genres", community: "Communauté",
    reviews: "Avis", publicLists: "Listes publiques", appearance: "Apparence",
    reader: "Lecteur", notifications: "Notifications", account: "Compte", information: "Informations",
    about: "À propos", contact: "Contact", reportProblem: "Signaler un problème",
    theme: "Thème", readingFont: "Police de lecture", uiLanguage: "Langue de l'interface",
    interfaceLangNote: "Les chapitres disponibles dépendent des traductions existantes sur MangaDex pour chaque langue.",
    noResults: "Aucun résultat. Essayez d'autres filtres.", retry: "Réessayer",
    loginToSave: "Connectez-vous pour enregistrer votre bibliothèque, favoris et historique.",
    loginToProfile: "Connectez-vous pour voir votre profil.", loginToComment: "Connectez-vous pour commenter",
    emptyList: "Liste vide.", noHistory: "Pas encore d'historique.", saveChanges: "Enregistrer", saved: "Enregistré ✓",
    removeFromLists: "Retirer des listes", showSpoiler: "Afficher le spoiler", publish: "Publier",
    containsSpoiler: "Contient un spoiler", writeComment: "Écrire un commentaire…", newest: "récents", popular: "populaires",
    noComments: "Pas encore de commentaires. Soyez le premier !", nextChapter: "Chapitre suivant", prevChapter: "Précédent",
    endOfChapter: "Fin du chapitre", vertical: "Vertical", paged: "Page", zoomIn: "Zoom+", zoomOut: "Zoom-",
    reset: "Reset", width: "Largeur", height: "Hauteur", dark: "Sombre", sepia: "Sépia", highQual: "HQ", saver: "Éco",
    auto: "Auto", fullscreen: "Plein écran", top: "Haut", bottom: "Fin", speed: "Vitesse",
    shortcuts: "Raccourcis : ←/→ · f plein écran · h cacher · d sombre", onlyFavorites: "Uniquement mes favoris ❤️",
    calendarEstimate: "Estimation basée sur les sorties récentes des séries en cours.", noWorks: "Aucune œuvre.",
    readerLevel: "Niveau de lecteur", achievements: "Succès", username: "Nom d'utilisateur", bio: "Bio",
    chaptersRead: "Chapitres lus", hoursEst: "Heures estimées", categories: "Catégories",
    originAll: "Origine : toutes", statusAll: "Statut : tous", demoAll: "Démographie : toutes", langAll: "Langue : toutes",
    sortBy: "Trier par", relevance: "Pertinence", popularity: "Popularité", rating: "Note",
    updateSort: "Mise à jour", year: "Année", name: "Nom", titleAuthor: "Titre, auteur, artiste…",
    forgotPassword: "Mot de passe oublié", createAccount: "Créer un compte", alreadyHave: "J'ai déjà un compte",
    recoverPassword: "Réinitialiser le mot de passe", resetBtn: "Réinitialiser", backToLogin: "Retour à la connexion",
    email: "E-mail", password: "Mot de passe", newPassword: "Nouveau mot de passe", confirmPassword: "Confirmer",
    noVerification: "Pas de vérification e-mail — l'inscription est active immédiatement.",
    recoverNote: "Sans vérification e-mail, quiconque avec cet e-mail pourrait réinitialiser le mot de passe. Démo uniquement.",
    passwordUpdated: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    completeFields: "Remplissez tous les champs.", minPassword: "Le mot de passe doit contenir au moins 4 caractères.",
    completeEmailPass: "Entrez e-mail et mot de passe.", passwordsMismatch: "Les mots de passe ne correspondent pas.",
    enterEmailNewPass: "Entrez votre e-mail et le nouveau mot de passe.",
    aboutText: "KōmiVerso est un lecteur de manga, manhwa et manhua alimenté par MangaDex. Conçu pour une lecture fluide et personnalisable.",
    contactText: "Suggestions ou problèmes ? Écrivez à soporte@komiverso.app",
    reportSent: "Problème signalé. Merci.", reportPlaceholder: "Décrivez le problème…",
    sendReport: "Envoyer", close: "Fermer",
  },
  ja: {
    home: "ホーム", search: "検索", calendar: "カレンダー", library: "ライブラリ", profile: "プロフィール",
    settings: "設定", enter: "ログイン", login: "ログイン", signup: "アカウント作成",
    logout: "ログアウト", favorites: "お気に入り", reading: "読書中", completed: "読了",
    pending: "積読", paused: "一時停止", dropped: "中断", history: "履歴",
    continueReading: "続きを読む", trending: "トレンド", recentlyUpdated: "最近更新",
    topRated: "高評価", popularManhwa: "人気マンファ", newTitles: "新作",
    seeAll: "すべて見る", update: "更新", searchingNews: "更新を検索中…", contentLoaded: "読み込み完了",
    chapters: "チャプター", similar: "類似作品", comments: "コメント", addToList: "リストに追加",
    favorite: "お気に入り", inFavorites: "お気に入り済み", noSynopsis: "あらすじなし",
    noChapters: "翻訳チャプターはまだありません。", filterLang: "言語",
    allLangs: "すべて", langEs: "スペイン語", langEsLa: "スペイン語 (LATAM)", langEn: "英語",
    chapter: "チャプター", language: "言語", date: "日付", status: "状態",
    myAccount: "マイアカウント", myLists: "マイリスト", statistics: "統計",
    explore: "探索", allTitles: "すべてのタイトル", manga: "漫画", manhwa: "マンファ",
    manhua: "マンファ", novels: "小説", genres: "ジャンル", community: "コミュニティ",
    reviews: "レビュー", publicLists: "公開リスト", appearance: "外観",
    reader: "リーダー", notifications: "通知", account: "アカウント", information: "情報",
    about: "について", contact: "お問い合わせ", reportProblem: "問題を報告",
    theme: "テーマ", readingFont: "読書フォント", uiLanguage: "UI言語",
    interfaceLangNote: "利用可能なチャプターはMangaDexの各言語の翻訳に依存します。",
    noResults: "結果なし。別のフィルターを試してください。", retry: "再試行",
    loginToSave: "ライブラリ・お気に入り・履歴を保存するにはログインしてください。",
    loginToProfile: "プロフィールを見るにはログインしてください。", loginToComment: "コメントするにはログイン",
    emptyList: "リストは空です。", noHistory: "履歴はまだありません。", saveChanges: "保存", saved: "保存済み ✓",
    removeFromLists: "リストから削除", showSpoiler: "ネタバレを表示", publish: "投稿",
    containsSpoiler: "ネタバレあり", writeComment: "コメントを書く…", newest: "新着", popular: "人気",
    noComments: "まだコメントがありません。最初に書きましょう！", nextChapter: "次のチャプター", prevChapter: "前へ",
    endOfChapter: "チャプター終了", vertical: "縦", paged: "ページ", zoomIn: "拡大", zoomOut: "縮小",
    reset: "リセット", width: "幅", height: "高さ", dark: "ダーク", sepia: "セピア", highQual: "高画質", saver: "節約",
    auto: "自動", fullscreen: "全画面", top: "上へ", bottom: "末尾", speed: "速度",
    shortcuts: "ショートカット: ←/→ · f 全画面 · h 隠す · d ダーク", onlyFavorites: "お気に入りのみ ❤️",
    calendarEstimate: "連載中作品の最近の更新に基づく推定。", noWorks: "作品なし。",
    readerLevel: "読者レベル", achievements: "実績", username: "ユーザー名", bio: "自己紹介",
    chaptersRead: "読んだチャプター", hoursEst: "推定時間", categories: "カテゴリ",
    originAll: "原産地: すべて", statusAll: "状態: すべて", demoAll: "対象: すべて", langAll: "言語: すべて",
    sortBy: "並び替え", relevance: "関連性", popularity: "人気", rating: "評価",
    updateSort: "更新", year: "年", name: "名前", titleAuthor: "タイトル、作者、アーティスト…",
    forgotPassword: "パスワードを忘れた", createAccount: "アカウント作成", alreadyHave: "アカウントあり",
    recoverPassword: "パスワード再設定", resetBtn: "再設定", backToLogin: "ログインに戻る",
    email: "メール", password: "パスワード", newPassword: "新しいパスワード", confirmPassword: "確認",
    noVerification: "メール確認なし — 登録はすぐに有効になります。",
    recoverNote: "メール確認がないため、このメールを知る誰でもパスワードを再設定できます。デモ専用。",
    passwordUpdated: "パスワードを更新しました。ログインできます。",
    completeFields: "すべての項目を入力してください。", minPassword: "パスワードは4文字以上。",
    completeEmailPass: "メールとパスワードを入力。", passwordsMismatch: "パスワードが一致しません。",
    enterEmailNewPass: "メールと新しいパスワードを入力。",
    aboutText: "KōmiVersoはMangaDexを利用した漫画・マンファ・マンファリーダーです。滑らかでカスタマイズ可能な読書体験のために作られました。",
    contactText: "ご意見・問題は soporte@komiverso.app まで。",
    reportSent: "報告しました。ありがとうございます。", reportPlaceholder: "問題を記述…",
    sendReport: "送信", close: "閉じる",
  },
};

const LangCtx = createContext(null);
const useLang = () => useContext(LangCtx);
function useT() {
  const { lang } = useLang();
  return useCallback((key) => (I18N[lang] || I18N.es)[key] || I18N.es[key] || key, [lang]);
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const GLOBAL_CSS = `
@keyframes kv-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes kv-slide-in { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
.kv-page-enter { animation: kv-fade-in 0.28s ease both; }
.kv-drawer-enter { animation: kv-slide-in 0.28s ease both; }
.kv-density-compact .kv-pad { padding: calc(0.5rem * var(--density-pad, 1)) !important; }
.kv-density-spacious .kv-pad { padding: calc(1.15rem * var(--density-pad, 1)) !important; }
.kv-density-compact .gap-3 { gap: 0.5rem !important; }
.kv-density-compact .gap-2 { gap: 0.35rem !important; }
.kv-density-compact .gap-4 { gap: 0.65rem !important; }
.kv-density-spacious .gap-3 { gap: 1.1rem !important; }
.kv-density-spacious .gap-2 { gap: 0.75rem !important; }
.kv-density-spacious .gap-4 { gap: 1.35rem !important; }
.kv-density-compact .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
.kv-density-compact .py-2 { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
.kv-density-spacious .py-3 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
.kv-density-spacious .py-2 { padding-top: 0.65rem !important; padding-bottom: 0.65rem !important; }
.kv-density-compact .px-4 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
.kv-density-spacious .px-4 { padding-left: 1.35rem !important; padding-right: 1.35rem !important; }
.kv-density-compact .mb-4 { margin-bottom: 0.75rem !important; }
.kv-density-spacious .mb-4 { margin-bottom: 1.5rem !important; }
.kv-density-compact .mb-3 { margin-bottom: 0.5rem !important; }
.kv-density-spacious .mb-3 { margin-bottom: 1.1rem !important; }
`;

async function sget(key, shared = false) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function sset(key, value, shared = false) {
  try { return await window.storage.set(key, JSON.stringify(value), shared); }
  catch (err) { console.error(`sset("${key}") falló:`, err); return null; }
}
function simpleHash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return "h" + Math.abs(h).toString(36) + str.length;
}

const ThemeCtx = createContext(null);
const useTheme = () => useContext(ThemeCtx);

const DEFAULT_READER_PREFS = {
  mode: "vertical",
  direction: "ltr",
  fit: "width",
  quality: "full",
  dark: true,
  sepia: false,
  scrollSpeed: 30,
};
const DEFAULT_NOTIF_PREFS = {
  chapterUpdates: true,
  favorites: true,
  comments: false,
};

function ThemeProvider({ children }) {
  const [presetId, setPresetId] = useState("tinta");
  const [fontId, setFontId] = useState("inter");
  const [lang, setLang] = useState("es");
  const [readerPrefs, setReaderPrefsState] = useState(DEFAULT_READER_PREFS);
  const [notifPrefs, setNotifPrefsState] = useState(DEFAULT_NOTIF_PREFS);
  const [wallpaperUrl, setWallpaperUrlState] = useState(null);
  const [wallpaperOpacity, setWallpaperOpacityState] = useState(0.16);
  const [customAccent, setCustomAccentState] = useState(null);
  const [density, setDensityState] = useState("comfortable");
  const [amoled, setAmoledState] = useState(false);
  const [libraryView, setLibraryViewState] = useState("grid");
  const [coverSize, setCoverSizeState] = useState("md");
  const [tabOrder, setTabOrderState] = useState(DEFAULT_TAB_ORDER);
  const [loaded, setLoaded] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState(new Set());

  useEffect(() => {
    (async () => {
      const prefs = await sget("prefs");
      if (prefs) {
        setPresetId(prefs.presetId || "tinta");
        setFontId(prefs.fontId || "inter");
        setLang(prefs.lang || "es");
        if (prefs.reader) setReaderPrefsState({ ...DEFAULT_READER_PREFS, ...prefs.reader });
        if (prefs.notifications) setNotifPrefsState({ ...DEFAULT_NOTIF_PREFS, ...prefs.notifications });
        if (prefs.wallpaperUrl) setWallpaperUrlState(prefs.wallpaperUrl);
        if (prefs.wallpaperOpacity !== undefined) setWallpaperOpacityState(prefs.wallpaperOpacity);
        if (prefs.customAccent) setCustomAccentState(prefs.customAccent);
        if (prefs.density) setDensityState(prefs.density);
        if (prefs.amoled != null) setAmoledState(!!prefs.amoled);
        if (prefs.libraryView) setLibraryViewState(prefs.libraryView);
        if (prefs.coverSize) setCoverSizeState(prefs.coverSize);
        if (Array.isArray(prefs.tabOrder) && prefs.tabOrder.length) setTabOrderState(prefs.tabOrder);
      }
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (loaded) sset("prefs", { presetId, fontId, lang, reader: readerPrefs, notifications: notifPrefs, wallpaperUrl, wallpaperOpacity, customAccent, density, amoled, libraryView, coverSize, tabOrder });
  }, [presetId, fontId, lang, readerPrefs, notifPrefs, wallpaperUrl, wallpaperOpacity, customAccent, density, amoled, libraryView, coverSize, tabOrder, loaded]);

  const setReaderPrefs = (patch) => setReaderPrefsState(prev => ({ ...prev, ...patch }));
  const setNotifPrefs = (patch) => setNotifPrefsState(prev => ({ ...prev, ...patch }));
  const setWallpaperUrl = (url) => setWallpaperUrlState(url);
  const setWallpaperOpacity = (v) => setWallpaperOpacityState(v);
  const setCustomAccent = (color) => setCustomAccentState(color);
  const setDensity = (d) => setDensityState(d);
  const setAmoled = (v) => setAmoledState(!!v);
  const setLibraryView = (v) => setLibraryViewState(v);
  const setCoverSize = (v) => setCoverSizeState(v);
  const setTabOrder = (v) => setTabOrderState(v);

  const preset = PRESETS.find(p => p.id === presetId) || PRESETS[0];
  const font = FONTS.find(f => f.id === fontId) || FONTS[0];

  useEffect(() => {
    if (loadedFonts.has(font.id)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.url}&display=swap`;
    document.head.appendChild(link);
    setLoadedFonts(prev => new Set(prev).add(font.id));
  }, [font]);

  useEffect(() => {
    if (!document.getElementById("kv-global-css")) {
      const style = document.createElement("style");
      style.id = "kv-global-css";
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const DENSITY_SCALE = { compact: 0.85, comfortable: 1, spacious: 1.18 };
  const DENSITY_PAD = { compact: 0.7, comfortable: 1, spacious: 1.25 };
  const DENSITY_GAP = { compact: 0.65, comfortable: 1, spacious: 1.3 };

  const effectiveBg = amoled && preset.mode === "dark" ? "#000000" : preset.bg;
  const effectiveSurface = amoled && preset.mode === "dark" ? "#050505" : preset.surface;
  const effectiveSurface2 = amoled && preset.mode === "dark" ? "#0d0d0d" : preset.surface2;

  const vars = {
    "--bg": effectiveBg, "--surface": effectiveSurface, "--surface2": effectiveSurface2,
    "--accent": customAccent || preset.accent, "--text": preset.text, "--muted": preset.muted, "--border": preset.border,
    "--font-body": font.family,
    "--density-scale": DENSITY_SCALE[density] || 1,
    "--density-pad": DENSITY_PAD[density] || 1,
    "--density-gap": DENSITY_GAP[density] || 1,
  };

  return (
    <ThemeCtx.Provider value={{
      preset, presetId, setPresetId, font, fontId, setFontId, vars,
      readerPrefs, setReaderPrefs, notifPrefs, setNotifPrefs,
      wallpaperUrl, setWallpaperUrl, wallpaperOpacity, setWallpaperOpacity,
      customAccent, setCustomAccent, density, setDensity,
      amoled, setAmoled, libraryView, setLibraryView, coverSize, setCoverSize,
      tabOrder, setTabOrder,
    }}>
      <LangCtx.Provider value={{ lang, setLang }}>
        <div style={{ ...vars, background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: `calc(1rem * var(--density-scale))`, minHeight: "100vh", position: "relative" }} className={`kv-density-${density || "comfortable"}`}>
          {wallpaperUrl && (
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                backgroundImage: `url(${wallpaperUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: wallpaperOpacity,
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          )}
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
        </div>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

async function apiJson(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

async function authHeaders() {
  const session = await sget("session");
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function markChapterRead(mangaId, chapterId) {
  const headers = await authHeaders();
  if (!headers.Authorization) return;
  try {
    await apiJson("/progreso", {
      method: "POST",
      headers,
      body: JSON.stringify({ mangaId, chapterId }),
    });
  } catch (e) {
    console.warn("No se pudo marcar el capítulo como leído:", e);
  }
}

async function getReadChapters(mangaId) {
  const headers = await authHeaders();
  if (!headers.Authorization) return [];
  try {
    return await apiJson(`/progreso/${encodeURIComponent(mangaId)}`, { headers });
  } catch (e) {
    return [];
  }
}

async function markChaptersBatch(mangaId, chapterIds, leido = true) {
  const headers = await authHeaders();
  if (!headers.Authorization) return false;
  try {
    await apiJson("/progreso/lote", {
      method: "POST",
      headers,
      body: JSON.stringify({ mangaId, chapterIds, leido }),
    });
    return true;
  } catch (e) {
    console.warn("No se pudo actualizar el lote de capítulos:", e);
    return false;
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await sget("session");
      if (session?.token && session?.user) {
        setUser(session.user); setToken(session.token);
        try {
          const data = await apiJson("/auth/me", { headers: { Authorization: `Bearer ${session.token}` } });
          const freshUser = {
            ...data.usuario,
            email: data.usuario.correo,
            username: data.usuario.username || data.usuario.correo.split("@")[0],
          };
          if (JSON.stringify(freshUser) !== JSON.stringify(session.user)) {
            setUser(freshUser);
            await sset("session", { token: session.token, user: freshUser });
          }
        } catch {
        }
      }
      setReady(true);
    })();
  }, []);

  const requestCode = async (correo) => {
    correo = correo.trim().toLowerCase();
    return await apiJson("/auth/solicitar-codigo", {
      method: "POST",
      body: JSON.stringify({ correo }),
    });
  };

  const verifyCode = async (correo, codigo) => {
    correo = correo.trim().toLowerCase();
    const data = await apiJson("/auth/verificar-codigo", {
      method: "POST",
      body: JSON.stringify({ correo, codigo }),
    });
    const sessionUser = {
      ...data.usuario,
      email: data.usuario.correo,
      username: data.usuario.username || data.usuario.correo.split("@")[0],
    };
    await sset("session", { token: data.token, user: sessionUser });
    setUser(sessionUser); setToken(data.token);
    return sessionUser;
  };

  const logout = async () => { await sset("session", null); setUser(null); setToken(null); };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const data = await apiJson("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const freshUser = {
        ...data.usuario,
        email: data.usuario.correo,
        username: data.usuario.username || data.usuario.correo.split("@")[0],
      };
      setUser(freshUser);
      await sset("session", { token, user: freshUser });
      return freshUser;
    } catch {
      return null;
    }
  };

  const updateProfile = async (patch) => {
    if (!user) return;
    const headers = { ...(await authHeaders()) };
    const data = await apiJson("/auth/profile", { method: "PATCH", headers, body: JSON.stringify(patch) });
    const sessionUser = {
      ...data.usuario,
      email: data.usuario.correo,
      username: data.usuario.username || data.usuario.correo.split("@")[0],
    };
    await sset("session", { token, user: sessionUser });
    setUser(sessionUser);
  };

  return (
    <AuthCtx.Provider value={{ user, token, ready, requestCode, verifyCode, logout, updateProfile, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

const LIST_KEYS = ["favoritos", "leyendo", "completados", "pendientes", "pausados", "abandonados"];
const EMPTY_LIB = { favoritos: [], leyendo: [], completados: [], pendientes: [], pausados: [], abandonados: [] };

function useLibrary(email) {
  const [lib, setLib] = useState(EMPTY_LIB);

  const refresh = useCallback(async () => {
    if (!email) { setLib(EMPTY_LIB); return; }
    try {
      const l = await apiJson(`/library/${encodeURIComponent(email)}`);
      setLib({
        favoritos: l.favoritos || [],
        leyendo: l.leyendo || [],
        completados: l.completados || [],
        pendientes: l.pendientes || [],
        pausados: l.pausados || [],
        abandonados: l.abandonados || [],
      });
    } catch {
      const l = await sget(`library:${email}`, true);
      if (l) setLib(l);
    }
  }, [email]);

  useEffect(() => { refresh(); }, [refresh]);

  const setStatus = async (manga, listKey) => {
    const next = {
      favoritos: [...lib.favoritos],
      leyendo: [...lib.leyendo],
      completados: [...lib.completados],
      pendientes: [...lib.pendientes],
      pausados: [...lib.pausados],
      abandonados: [...lib.abandonados],
    };
    const statusLists = ["leyendo", "completados", "pendientes", "pausados", "abandonados"];
    statusLists.forEach(k => { next[k] = next[k].filter(m => m.id !== manga.id); });
    if (listKey && statusLists.includes(listKey)) next[listKey] = [{ ...manga, updatedAt: Date.now() }, ...next[listKey]];
    setLib(next);
    if (!email) return;
    try {
      await apiJson("/library/set-status", {
        method: "POST",
        body: JSON.stringify({ email, manga: { id: manga.id, title: manga.title, cover: manga.cover }, listKey }),
      });
      await refresh();
    } catch (e) {
      console.warn("set-status API failed, local only", e);
      await sset(`library:${email}`, next, true);
    }
  };
  const toggleFavorite = async (manga) => {
    const has = lib.favoritos.some(m => m.id === manga.id);
    const next = {
      ...lib,
      favoritos: has
        ? lib.favoritos.filter(m => m.id !== manga.id)
        : [{ ...manga, updatedAt: Date.now() }, ...lib.favoritos],
    };
    setLib(next);
    if (!email) return;
    try {
      await apiJson("/library/toggle-favorite", {
        method: "POST",
        body: JSON.stringify({ email, manga: { id: manga.id, title: manga.title, cover: manga.cover } }),
      });
      await refresh();
    } catch (e) {
      console.warn("toggle-favorite API failed, local only", e);
      await sset(`library:${email}`, next, true);
    }
  };
  const statusOf = (id) => {
    for (const k of ["leyendo", "completados", "pendientes", "pausados", "abandonados"]) if (lib[k].some(m => m.id === id)) return k;
    return null;
  };
  const isFav = (id) => lib.favoritos.some(m => m.id === id);

  return { lib, setStatus, toggleFavorite, statusOf, isFav, refresh };
}

function useHistory(email, auth) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!email) { setHistory([]); return; }
    (async () => { const h = await sget(`history:${email}`, true); if (h) setHistory(h); })();
  }, [email]);

  const record = async (entry) => {
    if (!email) return;
    const isNewChapter = !history.some(h => h.mangaId === entry.mangaId && h.chapterId === entry.chapterId);
    const next = [entry, ...history.filter(h => !(h.mangaId === entry.mangaId && h.chapterId === entry.chapterId))].slice(0, 500);
    setHistory(next);
    await sset(`history:${email}`, next, true);

    if (isNewChapter && auth?.user && auth?.updateProfile) {
      try {
        const prevXp = auth.user.xp ?? 0;
        const newXp = prevXp + XP_PER_CHAPTER;
        const newLevel = levelFromXp(newXp);
        const unlocked = titlesUnlocked(newXp, next.length);
        const prevTitles = Array.isArray(auth.user.titles) ? auth.user.titles : [];
        const mergedTitles = [...new Set([...prevTitles, ...unlocked])];
        await auth.updateProfile({
          xp: newXp,
          level: newLevel,
          titles: mergedTitles,
          activeTitle: auth.user.activeTitle || mergedTitles[mergedTitles.length - 1] || null,
        });
      } catch (e) {
        console.warn("No se pudo guardar XP en la cuenta:", e);
      }
    }
  };
  const progressForManga = (mangaId) => history.find(h => h.mangaId === mangaId);

  return { history, record, progressForManga };
}

function mangaFromApi(m) {
  return {
    id: m.id,
    title: m.title || "Sin título",
    altTitles: m.altTitles || [],
    synopsis: m.synopsis || "",
    status: m.status || "ongoing",
    year: m.year || null,
    demographic: m.demographic || null,
    origin: m.origin || m.tipo || null,
    tags: m.tags || m.categorias || [],
    lastVolume: m.lastVolume || null,
    lastChapter: m.lastChapter ?? null,
    contentRating: m.contentRating || null,
    author: m.author || "Desconocido",
    artist: m.artist || "Desconocido",
    coverFile: m.coverFile || null,
    cover: m.cover || null,
    coverLarge: m.coverLarge || m.cover || null,
    updatedAt: m.updatedAt || null,
    tipo: m.tipo || null,
    capitulos: m.capitulos || [],
  };
}

async function mwFetch(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    let detail = "";
    try { const body = await res.json(); detail = body?.detail || body?.error || ""; } catch {}
    const err = new Error(detail ? `ManhwaWeb error ${res.status}: ${detail}` : `ManhwaWeb error ${res.status}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  return await res.json();
}

async function searchManga(params = {}) {
  const qs = new URLSearchParams();
  if (params.title) qs.set("title", params.title);

  const origin = params["originalLanguage[]"];
  if (origin) qs.set("origin", Array.isArray(origin) ? origin[0] : origin);

  if (params.type) qs.set("type", params.type);

  const status = params["status[]"];
  if (status) qs.set("status", Array.isArray(status) ? status.join(",") : status);

  const demographic = params["publicationDemographic[]"];
  if (demographic) qs.set("demographic", Array.isArray(demographic) ? demographic.join(",") : demographic);

  const genres = params["includedTags[]"];
  if (genres?.length) {
    const ids = Array.isArray(genres) ? genres : [genres];
    const names = ids.map(id => GENRE_ID_TO_NAME[id] || id);
    qs.set("genres", names.join(","));
  }

  const limit = params.limit || 30;
  qs.set("limit", String(limit));

  let sort = "latest";
  if (params["order[createdAt]"]) sort = "createdAt";
  else if (params["order[rating]"]) sort = "rating";
  else if (params["order[followedCount]"]) sort = "followedCount";
  else if (params["order[latestUploadedChapter]"]) sort = "latestUploadedChapter";
  else if (params["order[title]"]) sort = "title";
  qs.set("sort", sort);

  const data = await mwFetch(`/manhwa?${qs.toString()}`);
  return { list: (data.data || []).map(mangaFromApi), total: data.total || 0 };
}

const mangaDetailCache = new Map();

async function getMangaById(id, forceRefresh = false) {
  const cacheKey = String(id);

  if (!forceRefresh && mangaDetailCache.has(cacheKey)) {
    return mangaDetailCache.get(cacheKey);
  }

  const data = await mwFetch(`/manhwa/${encodeURIComponent(id)}`);
  const manga = mangaFromApi(data);

  mangaDetailCache.set(cacheKey, manga);

  return manga;
}

const chaptersCache = new Map();

async function getChapters(mangaId, forceRefresh = false) {
  const cacheKey = String(mangaId);

  if (!forceRefresh && chaptersCache.has(cacheKey)) {
    return chaptersCache.get(cacheKey);
  }

  const data = await getMangaById(mangaId);

  const seen = new Map();
  const chapters = (data.capitulos || []).map((c, i) => {
    const num = c.chapter ?? i;
    let cid = c.id != null ? String(c.id) : "";
    const broken = !cid || cid.includes("{") || /mangaId/i.test(cid) || /chapter\.chapter/i.test(cid);
    if (broken) cid = `${mangaId}-${num}`;
    const base = cid;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    if (n > 1) cid = `${base}-${c.lang || "x"}-${n}`;
    return {
      id: cid,
      chapter: num,
      title: c.title || "",
      lang: c.lang || "es",
      pages: c.pages || 0,
      publishAt: c.publishAt || null,
      readableAt: c.readableAt || null,
      group: c.group || "—",
      link: c.link || null,
    };
  });

  chaptersCache.set(cacheKey, chapters);

  return chapters;
}

async function getChapterPages(chapterId) {
  const raw = String(chapterId);
  const m = raw.match(/^(.*)-(\d+)(?:-[a-z]{2}-\d+)?$/i);
  let mangaId, chapter;
  if (m) {
    mangaId = m[1];
    chapter = m[2];
  } else {
    const sep = raw.lastIndexOf("-");
    if (sep <= 0) throw new Error("ID de capítulo inválido");
    mangaId = raw.slice(0, sep);
    chapter = raw.slice(sep + 1).replace(/-[a-z]{2}-\d+$/i, "");
  }
  return await mwFetch(`/manhwa/${encodeURIComponent(mangaId)}/chapter/${encodeURIComponent(chapter)}`);
}

async function getTags() {
  return [];
}

function ProxyImg({ src, className, style, alt = "" }) {
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => { setGaveUp(false); }, [src]);
  if (!src || gaveUp) return null;
  return (
    <img
      src={resolveAssetUrl(src)}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      onError={() => setGaveUp(true)}
    />
  );
}
function Btn({ children, variant = "solid", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all active:scale-[0.97] disabled:opacity-50";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = {
    solid: { background: "var(--accent)", color: "#fff" },
    outline: { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--muted)" },
    surface: { background: "var(--surface2)", color: "var(--text)" },
  };
  return <button className={`${base} ${sizes[size]} ${className}`} style={variants[variant]} {...props}>{children}</button>;
}
function Modal({ open, onClose, children, title, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`w-full ${wide ? "sm:max-w-lg" : "sm:max-w-sm"} rounded-2xl max-h-[90vh] overflow-y-auto`} style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} style={{ color: "var(--muted)" }}><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, ...props }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>{label}</span>
      <input {...props} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />
    </label>
  );
}
function Cover({ manga, onClick, showStatus, revealDelay = 0 }) {
  return (
    <Reveal delay={revealDelay}>
      <div onClick={onClick} className="cursor-pointer group flex-shrink-0" style={{ width: 132 }}>
        <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "2/3", background: "var(--surface2)" }}>
          {manga.cover ? <ProxyImg src={manga.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--muted)" }}>Sin portada</div>}
          {showStatus && <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>{statusLabel(manga.status)}</span>}
        </div>
        <p className="text-xs mt-1.5 leading-tight line-clamp-2 font-medium">{manga.title}</p>
      </div>
    </Reveal>
  );
}
function statusLabel(s) { return { ongoing: "🟢 Emisión", completed: "✅ Final", hiatus: "⏸ Hiatus", cancelled: "❌ Cancel." }[s] || s; }

function Row({ title, icon, children, onSeeAll, seeAllLabel = "Ver todo" }) {
  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-3 px-4">
        <h2 className="font-bold text-base flex items-center gap-1.5">{icon}{title}</h2>
        {onSeeAll && <button onClick={onSeeAll} className="text-xs font-medium" style={{ color: "var(--accent)" }}>{seeAllLabel}</button>}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: "none" }}>{children}</div>
    </section>
  );
}

function AuthModals({ authModal, setAuthModal }) {
  const { requestCode, verifyCode } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [ok, setOk] = useState("");

  const reset = () => { setEmail(""); setCode(""); setErr(""); setOk(""); };
  const close = () => { setAuthModal(null); reset(); };

  const doRequest = async () => {
    setErr(""); setOk("");
    if (!email.trim()) return setErr("Ingresa tu correo.");
    setBusy(true);
    try {
      await requestCode(email);
      setOk("Te enviamos un código a tu correo.");
      setAuthModal("verify");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doVerify = async () => {
    setErr(""); setOk("");
    if (!code) return setErr("Introduce el código de 6 dígitos.");
    setBusy(true);
    try {
      await verifyCode(email, code);
      close();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doResend = async () => {
    setErr(""); setOk("");
    setBusy(true);
    try { await requestCode(email); setOk("Código reenviado."); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Modal open={authModal === "login"} onClose={close} title="Entrar">
        <Field label="Correo" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
        {err && <p className="text-xs mb-3" style={{ color: "#EF4444" }}>{err}</p>}
        <Btn onClick={doRequest} disabled={busy} className="w-full mb-3">{busy ? <Loader size={16} className="animate-spin" /> : "Enviar código"}</Btn>
        <p className="text-[11px]" style={{ color: "var(--muted)" }}>Te mandamos un código de 6 dígitos a tu correo. Si no tienes cuenta, se crea automáticamente.</p>
      </Modal>

      <Modal open={authModal === "verify"} onClose={close} title="Verificar correo">
        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
          Introduce el código enviado a <strong style={{ color: "var(--text)" }}>{email || "tu correo"}</strong>.
        </p>
        <Field label="Código de 6 dígitos" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" inputMode="numeric" />
        {err && <p className="text-xs mb-3" style={{ color: "#EF4444" }}>{err}</p>}
        {ok && <p className="text-xs mb-3" style={{ color: "#22C55E" }}>{ok}</p>}
        <Btn onClick={doVerify} disabled={busy} className="w-full mb-2">{busy ? <Loader size={16} className="animate-spin" /> : "Verificar y entrar"}</Btn>
        <button onClick={doResend} disabled={busy} className="w-full text-xs py-2" style={{ color: "var(--accent)" }}>Reenviar código</button>
        <div className="text-xs text-center mt-2">
          <button style={{ color: "var(--muted)" }} onClick={() => { setCode(""); setErr(""); setOk(""); setAuthModal("login"); }}>Volver</button>
        </div>
      </Modal>
    </>
  );
}

function HomePage({ nav, history, lib }) {
  const t = useT();
  const [trending, setTrending] = useState(null);
  const [latest, setLatest] = useState(null);
  const [topRated, setTopRated] = useState(null);
  const [newTitles, setNewTitles] = useState(null);
  const [manhwa, setManhwa] = useState(null);

  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback((keepData = false) => {
    if (!keepData) { setTrending(null); setLatest(null); setTopRated(null); setNewTitles(null); setManhwa(null); }
    setFailed(false); setRefreshing(true);
    const tasks = [
      searchManga({ "order[followedCount]": "desc", limit: 15 }).then(r => setTrending(r.list)),
      searchManga({ "order[latestUploadedChapter]": "desc", limit: 15 }).then(r => setLatest(r.list)),
      searchManga({ "order[rating]": "desc", limit: 15 }).then(r => setTopRated(r.list)),
      searchManga({ "order[createdAt]": "desc", limit: 15 }).then(r => setNewTitles(r.list)),
      searchManga({ "order[followedCount]": "desc", limit: 15, "originalLanguage[]": ["ko"] }).then(r => setManhwa(r.list)),
    ];
    Promise.allSettled(tasks).then(results => {
      if (results.some(r => r.status === "rejected")) setFailed(true);
      setRefreshing(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  const continuing = history.history.slice(0, 15);

  const Skeleton = () => <div className="flex gap-3 px-4 overflow-hidden">{[...Array(5)].map((_, i) => <div key={i} className="rounded-xl flex-shrink-0 animate-pulse" style={{ width: 132, aspectRatio: "2/3", background: "var(--surface2)" }} />)}</div>;

  if (failed && !trending && !latest) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>No se pudo conectar con KomiVerso, por favor ten paciencia y vuelve a intentarlo :).</p>
        <Btn size="sm" variant="outline" onClick={load}>{t("retry")}</Btn>
      </div>
    );
  }

  return (
    <div className="pb-6 pt-2 kv-page-enter">
      <div className="flex items-center justify-between px-4 mb-3">
        <span className="text-xs" style={{ color: "var(--muted)" }}>{refreshing ? t("searchingNews") : t("contentLoaded")}</span>
        <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium disabled:opacity-50" style={{ background: "var(--surface2)" }}>
          <RotateCcw size={13} className={refreshing ? "animate-spin" : ""} /> {t("update")}
        </button>
      </div>
      {continuing.length > 0 && (
        <Row title={t("continueReading")} icon={<Clock size={17} />}>
          {continuing.map((h, i) => (
            <Reveal key={h.mangaId + h.chapterId} delay={i * 40}>
              <div onClick={() => nav("manga", h.mangaId)} className="cursor-pointer flex-shrink-0" style={{ width: 132 }}>
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "2/3", background: "var(--surface2)" }}>
                  {h.cover && <ProxyImg src={h.cover} className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="h-full" style={{ width: `${h.percent || 0}%`, background: "var(--accent)" }} />
                  </div>
                </div>
                <p className="text-xs mt-1.5 leading-tight line-clamp-1 font-medium">{h.mangaTitle}</p>
                <p className="text-[10px]" style={{ color: "var(--muted)" }}>Cap. {h.chapterNum} · {h.percent || 0}%</p>
              </div>
            </Reveal>
          ))}
        </Row>
      )}

      <Row title={t("trending")} icon={<TrendingUp size={17} />} onSeeAll={() => nav("search", { sort: "followedCount" })} seeAllLabel={t("seeAll")}>
        {trending === null ? <Skeleton /> : trending.map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus revealDelay={i * 35} />)}
      </Row>
      <Row title={`🆕 ${t("recentlyUpdated")}`} icon={<Sparkles size={17} />} onSeeAll={() => nav("search", { sort: "latestUploadedChapter" })} seeAllLabel={t("seeAll")}>
        {latest === null ? <Skeleton /> : latest.map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus revealDelay={i * 35} />)}
      </Row>
      <Row title={t("topRated")} icon={<Star size={17} />} onSeeAll={() => nav("search", { sort: "rating" })} seeAllLabel={t("seeAll")}>
        {topRated === null ? <Skeleton /> : topRated.map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus revealDelay={i * 35} />)}
      </Row>
      <Row title={t("popularManhwa")} icon={<TrendingUp size={17} />} onSeeAll={() => nav("search", { origin: "ko" })} seeAllLabel={t("seeAll")}>
        {manhwa === null ? <Skeleton /> : manhwa.map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus revealDelay={i * 35} />)}
      </Row>
      <Row title={`🆕 ${t("newTitles")}`} icon={<PlusCircle size={17} />} onSeeAll={() => nav("search", { sort: "createdAt" })} seeAllLabel={t("seeAll")}>
        {newTitles === null ? <Skeleton /> : newTitles.map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus revealDelay={i * 35} />)}
      </Row>
    </div>
  );
}

function SearchPage({ nav, initial }) {
  const [q, setQ] = useState(initial?.q || "");
  const [genres, setGenres] = useState([]);
  const [origin, setOrigin] = useState(initial?.origin || "");
  const [status, setStatus] = useState("");
  const [demo, setDemo] = useState("");
  const [sort, setSort] = useState(initial?.sort || "relevance");
  const [lang, setLang] = useState("");
  const [results, setResults] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const run = useCallback(() => {
    setResults(null);
    const params = { limit: 30, [`order[${sort}]`]: "desc" };
    if (q) params.title = q;
    if (genres.length) params["includedTags[]"] = genres.map(g => GENRE_MAP[g]);
    if (origin) params["originalLanguage[]"] = [origin];
    if (status) params["status[]"] = [status];
    if (demo) params["publicationDemographic[]"] = [demo];
    if (lang) params["availableTranslatedLanguage[]"] = [lang];
    searchManga(params).then(r => setResults(r.list)).catch(() => setResults("error"));
  }, [q, genres, origin, status, demo, sort, lang]);

  useEffect(() => { run(); }, []);
  useEffect(() => { const t = setTimeout(run, 450); return () => clearTimeout(t); }, [q, genres, origin, status, demo, sort, lang]);
  useEffect(() => {
    if (!initial) return;
    if (initial.q !== undefined) setQ(initial.q);
    if (initial.origin !== undefined) setOrigin(initial.origin);
    if (initial.sort !== undefined) setSort(initial.sort);
  }, [initial]);

  const toggleGenre = (g) => setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  return (
    <div className="px-4 pt-3 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Título, autor, artista…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <button onClick={() => setShowFilters(v => !v)} className="p-2.5 rounded-xl" style={{ background: showFilters ? "var(--accent)" : "var(--surface2)", color: showFilters ? "#fff" : "var(--text)", border: "1px solid var(--border)" }}><Filter size={16} /></button>
      </div>

      {showFilters && (
        <div className="mb-4 p-3 rounded-xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>Categorías</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(GENRE_MAP).map(g => (
                <button key={g} onClick={() => toggleGenre(g)} className="text-xs px-2.5 py-1 rounded-full" style={{ background: genres.includes(g) ? "var(--accent)" : "var(--surface2)", color: genres.includes(g) ? "#fff" : "var(--text)" }}>{g}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={origin} onChange={e => setOrigin(e.target.value)} className="text-xs px-2 py-2 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <option value="">Origen: todos</option>
              {Object.entries(ORIGINS).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="text-xs px-2 py-2 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <option value="">Estado: todos</option>
              {Object.entries(STATUSES).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
            <select value={demo} onChange={e => setDemo(e.target.value)} className="text-xs px-2 py-2 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <option value="">Demografía: todas</option>
              {Object.entries(DEMOGRAPHICS).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
            <select value={lang} onChange={e => setLang(e.target.value)} className="text-xs px-2 py-2 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <option value="">Idioma: todos</option>
              <option value="es">Español</option><option value="en">Inglés</option>
            </select>
          </div>
          <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>Ordenar por</p>
            <div className="flex flex-wrap gap-1.5">
              {[["relevance", "Relevancia"], ["followedCount", "Popularidad"], ["rating", "Calificación"], ["latestUploadedChapter", "Actualización"], ["createdAt", "Año"], ["title", "Nombre"]].map(([v, l]) => (
                <button key={v} onClick={() => setSort(v)} className="text-xs px-2.5 py-1 rounded-full" style={{ background: sort === v ? "var(--accent)" : "var(--surface2)", color: sort === v ? "#fff" : "var(--text)" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {results === null ? (
        <div className="grid grid-cols-3 gap-3">{[...Array(9)].map((_, i) => <div key={i} className="rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "var(--surface2)" }} />)}</div>
      ) : results === "error" ? (
        <div className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>
          <p className="mb-3">No se pudo conectar con KomiVerso, por favor ten paciencia y vuelve a intentarlo :).</p>
          <Btn size="sm" variant="outline" onClick={run}>Reintentar</Btn>
        </div>
      ) : results.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>Sin resultados. Prueba con otros filtros.</p>
      ) : (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4">
          {results.map(m => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} showStatus />)}
        </div>
      )}
    </div>
  );
}

function MangaPage({ id, nav, lib, auth, setAuthModal }) {
  const t = useT();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [tab, setTab] = useState("capitulos");
  const [chapLang, setChapLang] = useState("all");
  const [chapOrder, setChapOrder] = useState("desc");
  const [showListMenu, setShowListMenu] = useState(false);
  const [related, setRelated] = useState(null);
  const [readChapters, setReadChapters] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const pressTimer = useRef(null);
  const pressFired = useRef(false);
  const pressStartPos = useRef(null);

  useEffect(() => {
    setManga(null);
    setChapLang("all");

    getMangaById(id).then(setManga).catch(() => setManga(false));

    if (auth.user) {
      getReadChapters(id).then(setReadChapters);
    } else {
      setReadChapters([]);
    }

    const cached = chaptersCache.get(String(id));

    if (cached) {
      setChapters(cached);
    } else {
      setChapters(null);
      getChapters(id).then(setChapters).catch(() => setChapters([]));
    }
  }, [id, auth.user]);

  useEffect(() => {
    if (manga && manga.tags?.length) {
      const genreIds = manga.tags.map(tg => GENRE_MAP[tg]).filter(Boolean).slice(0, 2);
      if (genreIds.length) searchManga({ "includedTags[]": genreIds, limit: 10 }).then(r => setRelated(r.list.filter(x => x.id !== id))).catch(() => setRelated([]));
      else setRelated([]);
    }
  }, [manga]);

  const langCounts = useMemo(() => {
    if (!chapters) return {};
    const c = { all: chapters.length, es: 0, "es-la": 0, en: 0, other: 0 };
    chapters.forEach(ch => {
      if (ch.lang === "es") c.es++;
      else if (ch.lang === "es-la") c["es-la"]++;
      else if (ch.lang === "en") c.en++;
      else c.other++;
    });
    return c;
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    if (chapLang === "all") {
      const priority = { es: 0, "es-la": 1, en: 2 };
      const byNum = new Map();
      chapters.forEach(ch => {
        const key = String(ch.chapter ?? "") + "|" + (ch.title || "");
        const prev = byNum.get(key);
        const p = priority[ch.lang] ?? 9;
        if (!prev || p < (priority[prev.lang] ?? 9)) byNum.set(key, ch);
      });
      return Array.from(byNum.values());
    }
    if (chapLang === "other") return chapters.filter(c => !["es", "es-la", "en"].includes(c.lang));
    return chapters.filter(c => c.lang === chapLang);
  }, [chapters, chapLang]);

  const sortedChapters = useMemo(() => {
    const arr = [...filteredChapters];
    arr.sort((a, b) => {
      const na = parseFloat(a.chapter) || 0;
      const nb = parseFloat(b.chapter) || 0;
      return chapOrder === "desc" ? nb - na : na - nb;
    });
    return arr;
  }, [filteredChapters, chapOrder]);

  if (manga === false) return <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>No se pudo cargar esta obra.</div>;
  if (!manga) return <div className="p-6 flex justify-center"><Loader className="animate-spin" /></div>;

  const status = lib.statusOf(id);
  const fav = lib.isFav(id);
  const mangaMini = { id: manga.id, title: manga.title, cover: manga.cover };

  const requireAuth = (fn) => { if (!auth.user) { setAuthModal("login"); return; } fn(); };

  const tabLabels = { capitulos: t("chapters"), similares: t("similar"), comentarios: t("comments") };

  const toggleSelected = (chapterId) => {
    setSelected(prev => prev.includes(chapterId) ? prev.filter(x => x !== chapterId) : [...prev, chapterId]);
  };
  const handlePressStart = (chapterId, e) => {
    pressFired.current = false;
    pressStartPos.current = e && e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    pressTimer.current = setTimeout(() => {
      pressFired.current = true;
      requireAuth(() => { setSelectMode(true); setSelected([chapterId]); });
    }, 500);
  };
  const clearPressTimer = () => { clearTimeout(pressTimer.current); };
  const handlePressMove = (e) => {
    const start = pressStartPos.current;
    if (!start || !e.touches || !e.touches[0]) return;
    const dx = Math.abs(e.touches[0].clientX - start.x);
    const dy = Math.abs(e.touches[0].clientY - start.y);
    if (dx > 10 || dy > 10) clearPressTimer();
  };
  const handleRowClick = (c) => {
    if (pressFired.current) { pressFired.current = false; return; }
    if (selectMode) { toggleSelected(c.id); return; }
    nav("reader", { mangaId: id, chapterId: c.id, mangaTitle: manga.title, cover: manga.cover });
  };
  const salirDeSeleccion = () => { setSelectMode(false); setSelected([]); };
  const seleccionarTodos = () => setSelected(sortedChapters.map(c => c.id));
  const marcarSeleccionados = async (leido) => {
    if (!selected.length) return;
    const ok = await markChaptersBatch(id, selected, leido);
    if (ok) {
      setReadChapters(prev => leido
        ? [...new Set([...prev, ...selected])]
        : prev.filter(cid => !selected.includes(cid)));
    }
    salirDeSeleccion();
  };

  return (
    <div className="pb-8 kv-page-enter">
      <div className="relative overflow-hidden" style={{ background: "var(--surface2)" }}>
        {manga.cover && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <ProxyImg
              src={manga.coverLarge || manga.cover}
              className="w-full h-full"
              style={{ objectFit: "cover", filter: "blur(18px) brightness(0.4)", transform: "scale(1.12)" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), var(--bg))" }} />
          </div>
        )}
        <div className="relative px-4 pt-5 pb-4 flex gap-4 items-end">
          <div
            className="w-28 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
            style={{ aspectRatio: "2/3", background: "var(--surface)", border: "2px solid var(--border)" }}
          >
            {manga.cover ? (
              <ProxyImg
                src={manga.coverLarge || manga.cover}
                className="w-full h-full"
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="font-bold text-lg leading-tight">{manga.title}</h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {manga.author}{manga.artist !== manga.author ? ` · ${manga.artist}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-3 flex flex-wrap gap-1.5">
        <span className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: "var(--surface2)" }}>{statusLabel(manga.status)}</span>
        {manga.year && <span className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: "var(--surface2)" }}>{manga.year}</span>}
        {manga.demographic && <span className="text-[11px] px-2 py-1 rounded-md font-medium capitalize" style={{ background: "var(--surface2)" }}>{manga.demographic}</span>}
        <span className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: "var(--surface2)" }}>{{ ja: "Manga", ko: "Manhwa", zh: "Manhua" }[manga.origin] || manga.origin}</span>
      </div>

      <div className="px-4 mt-3 flex flex-wrap gap-1.5">
        {manga.tags.slice(0, 6).map(tg => <span key={tg} className="text-[10px] px-2 py-0.5 rounded-full" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>{tg}</span>)}
      </div>

      <div className="px-4 mt-4 flex gap-2">
        <Btn onClick={() => requireAuth(() => lib.toggleFavorite(mangaMini))} variant={fav ? "solid" : "outline"} className="flex-1"><Heart size={15} fill={fav ? "#fff" : "none"} /> {fav ? t("inFavorites") : t("favorite")}</Btn>
        <div className="relative flex-1">
          <Btn onClick={() => requireAuth(() => setShowListMenu(v => !v))} variant="outline" className="w-full"><Bookmark size={15} /> {status ? status[0].toUpperCase() + status.slice(1) : t("addToList")}</Btn>
          {showListMenu && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl overflow-hidden shadow-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {["leyendo", "completados", "pendientes", "pausados", "abandonados"].map(k => (
                <button key={k} onClick={() => { lib.setStatus(mangaMini, k); setShowListMenu(false); }} className="w-full text-left px-3 py-2 text-xs capitalize" style={{ background: status === k ? "var(--surface2)" : "transparent" }}>{k}</button>
              ))}
              {status && <button onClick={() => { lib.setStatus(mangaMini, null); setShowListMenu(false); }} className="w-full text-left px-3 py-2 text-xs" style={{ color: "#EF4444" }}>{t("removeFromLists")}</button>}
            </div>
          )}
        </div>
      </div>

      <p className="px-4 mt-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{manga.synopsis ? manga.synopsis.slice(0, 500) : t("noSynopsis")}</p>

      <div className="flex gap-4 px-4 mt-5 border-b" style={{ borderColor: "var(--border)" }}>
        {["capitulos", "similares", "comentarios"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className="pb-2 text-sm font-medium" style={{ color: tab === tb ? "var(--accent)" : "var(--muted)", borderBottom: tab === tb ? "2px solid var(--accent)" : "2px solid transparent" }}>{tabLabels[tb]}</button>
        ))}
      </div>

      {tab === "capitulos" && (
        <div className="px-4 mt-3">
          {chapters !== null && chapters.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1" style={{ scrollbarWidth: "none" }}>
              {[
                { id: "all", label: t("allLangs"), count: langCounts.all },
                { id: "es", label: t("langEs"), count: langCounts.es },
                { id: "es-la", label: t("langEsLa"), count: langCounts["es-la"] },
                { id: "en", label: t("langEn"), count: langCounts.en },
              ].filter(x => x.id === "all" || x.count > 0).map(x => (
                <button key={x.id} onClick={() => setChapLang(x.id)} className="text-xs px-2.5 py-1.5 rounded-full flex-shrink-0 font-medium" style={{ background: chapLang === x.id ? "var(--accent)" : "var(--surface2)", color: chapLang === x.id ? "#fff" : "var(--text)" }}>
                  {x.label} ({x.count})
                </button>
              ))}
              {langCounts.other > 0 && (
                <button onClick={() => setChapLang("other")} className="text-xs px-2.5 py-1.5 rounded-full flex-shrink-0 font-medium" style={{ background: chapLang === "other" ? "var(--accent)" : "var(--surface2)", color: chapLang === "other" ? "#fff" : "var(--text)" }}>
                  Other ({langCounts.other})
                </button>
              )}
              <button onClick={() => setChapOrder(o => o === "desc" ? "asc" : "desc")} className="text-xs px-2.5 py-1.5 rounded-full flex-shrink-0 font-medium flex items-center gap-1" style={{ background: "var(--surface2)", color: "var(--text)" }}>
                <ArrowUpDown size={12} /> {chapOrder === "desc" ? "Mayor a menor" : "Menor a mayor"}
              </button>
            </div>
          )}
          {chapters === null ? <div className="flex justify-center py-8"><Loader className="animate-spin" size={20} /></div> :
            chapters.length === 0 ? <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>{t("noChapters")}</p> :
              sortedChapters.length === 0 ? <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>{t("noChapters")}</p> :
              <table className="w-full text-sm">
                <thead><tr style={{ color: "var(--muted)" }} className="text-xs text-left">{selectMode && <th className="w-8"></th>}<th className="py-2 font-medium">{t("chapter")}</th><th className="font-medium">{t("language")}</th><th className="font-medium">{t("date")}</th><th className="font-medium text-right">{t("status")}</th></tr></thead>
                <tbody>
                  {sortedChapters.map(c => {
                    const leido = readChapters.includes(c.id);
                    const marcado = selected.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleRowClick(c)}
                        onMouseDown={() => handlePressStart(c.id)}
                        onMouseUp={clearPressTimer}
                        onMouseLeave={clearPressTimer}
                        onTouchStart={(e) => handlePressStart(c.id, e)}
                        onTouchMove={handlePressMove}
                        onTouchEnd={clearPressTimer}
                        className="cursor-pointer select-none"
                        style={{ borderTop: "1px solid var(--border)", background: marcado ? "var(--surface2)" : "transparent" }}
                      >
                        {selectMode && (
                          <td className="py-2.5">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ border: marcado ? "none" : "1px solid var(--muted)", background: marcado ? "var(--accent)" : "transparent" }}>
                              {marcado && <Check size={11} color="#fff" strokeWidth={3} />}
                            </div>
                          </td>
                        )}
                        <td className="py-2.5" style={{ color: leido ? "var(--muted)" : "var(--text)" }}>Cap. {c.chapter ?? "—"}{c.title ? ` · ${c.title.slice(0, 24)}` : ""}</td>
                        <td className="uppercase text-xs" style={{ color: "var(--muted)" }}>{c.lang}</td>
                        <td className="text-xs" style={{ color: "var(--muted)" }}>{fmtDate(c.readableAt)}</td>
                        <td className="text-right">{leido ? "✅" : "🟢"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>}
        </div>
      )}

      {selectMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 px-3 py-3 overflow-x-auto" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{selected.length} sel.</span>
          <Btn size="sm" variant="outline" onClick={seleccionarTodos} className="flex-shrink-0">Todos</Btn>
          <Btn size="sm" variant="solid" onClick={() => marcarSeleccionados(true)} className="flex-shrink-0"><Check size={13} /> Marcar leídos</Btn>
          <Btn size="sm" variant="outline" onClick={() => marcarSeleccionados(false)} className="flex-shrink-0">No leídos</Btn>
          <Btn size="sm" variant="outline" onClick={salirDeSeleccion} className="flex-shrink-0 ml-auto"><X size={13} /></Btn>
        </div>
      )}

      {tab === "similares" && (
        <div className="px-4 mt-3 grid grid-cols-3 gap-x-3 gap-y-4">
          {related === null ? <Loader className="animate-spin" size={20} /> : related.length === 0 ? <p className="text-sm col-span-3" style={{ color: "var(--muted)" }}>Sin recomendaciones aún.</p> :
            related.slice(0, 9).map((m, i) => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} revealDelay={i * 40} />)}
        </div>
      )}

      {tab === "comentarios" && (
        <CommentsSection mangaId={id} auth={auth} setAuthModal={setAuthModal} />
      )}
    </div>
  );
}
function fmtDate(iso) { if (!iso) return "—"; const d = new Date(iso); const today = new Date(); const diffDays = Math.floor((today - d) / 86400000); if (diffDays === 0) return "Hoy"; if (diffDays === 1) return "Ayer"; return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined }); }

function CommentsSection({ mangaId, chapterId, auth, setAuthModal }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState(""); const [spoiler, setSpoiler] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [revealed, setRevealed] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const qs = chapterId ? `?chapterId=${encodeURIComponent(chapterId)}` : "";
      const data = await apiJson(`/comentarios/${mangaId}${qs}`);
      setComments(data);
    } catch {
      setComments([]);
    }
  }, [mangaId, chapterId]);

  useEffect(() => { setComments(null); load(); }, [load]);

  const post = async (parentId = null) => {
    if (!auth.user) { setAuthModal("login"); return; }
    const body = parentId ? replyText : text;
    if (!body.trim()) return;
    setBusy(true);
    try {
      const headers = await authHeaders();
      await apiJson("/comentarios", {
        method: "POST",
        headers,
        body: JSON.stringify({ mangaId, chapterId: chapterId || null, texto: body.trim(), spoiler: parentId ? false : spoiler, parentId }),
      });
      if (parentId) { setReplyText(""); setReplyTo(null); } else { setText(""); setSpoiler(false); }
      await load();
    } catch (e) {
      alert(e.message || "No se pudo publicar el comentario");
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("¿Borrar este comentario?")) return;
    try {
      const headers = await authHeaders();
      await apiJson(`/comentarios/${id}`, { method: "DELETE", headers });
      await load();
    } catch (e) {
      alert(e.message || "No se pudo borrar el comentario");
    }
  };

  const toggleReveal = (id) => setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const renderComment = (c, isReply = false) => {
    const mine = auth.user?.id && c.usuarioId === auth.user.id;
    const hidden = c.spoiler && !revealed.has(c.id);
    return (
      <div key={c.id} className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)", marginLeft: isReply ? 20 : 0 }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--surface2)" }}>
            {c.usuario?.avatar ? <img src={c.usuario.avatar} className="w-full h-full object-cover" /> : c.usuario?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-semibold">{c.usuario?.username}</span>
          <span className="text-[10px] ml-auto" style={{ color: "var(--muted)" }}>{fmtDate(c.creadoEn)}</span>
        </div>

        {hidden ? (
          <button onClick={() => toggleReveal(c.id)} className="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "var(--surface2)", color: "var(--muted)" }}><AlertTriangle size={12} /> Mostrar spoiler</button>
        ) : (
          <p className="text-sm">{c.texto}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {!isReply && (
            <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}><Reply size={13} /> Responder</button>
          )}
          {mine && (
            <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}><X size={12} /> Borrar</button>
          )}
        </div>

        {replyTo === c.id && (
          <div className="flex gap-2 items-start mt-2">
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe una respuesta…" rows={2} className="flex-1 px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
            <Btn size="sm" disabled={busy} onClick={() => post(c.id)}><Send size={13} /></Btn>
          </div>
        )}

        {c.replies?.length > 0 && (
          <div className="mt-2 space-y-2">{c.replies.map(r => renderComment(r, true))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 mt-3">
      <div className="mb-3">
        {auth.user ? (
          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold" style={{ background: "var(--surface2)" }}>{auth.user.avatar ? <img src={auth.user.avatar} className="w-full h-full object-cover" /> : auth.user.username?.[0]?.toUpperCase()}</div>
            <div className="flex-1">
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe un comentario…" rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
              <div className="flex items-center justify-between mt-1.5">
                <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}><input type="checkbox" checked={spoiler} onChange={e => setSpoiler(e.target.checked)} /> Contiene spoiler</label>
                <Btn size="sm" disabled={busy} onClick={() => post(null)}><Send size={13} /> Publicar</Btn>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setAuthModal("login")} className="text-sm w-full text-center py-3 rounded-lg" style={{ background: "var(--surface2)", color: "var(--muted)" }}>Inicia sesión para comentar y dejar reseñas</button>
        )}
      </div>

      {comments === null ? <Loader className="animate-spin" size={18} /> : comments.length === 0 ? <p className="text-sm py-4" style={{ color: "var(--muted)" }}>Aún no hay comentarios. ¡Sé el primero!</p> : (
        <div className="space-y-3">{comments.map(c => renderComment(c))}</div>
      )}
    </div>
  );
}

function useAdBlockDetected(depKey) {
  const [blocked, setBlocked] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setBlocked(null);
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner ads eas6a97888e2 pub_300x250 textads banner-ads";
    bait.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:2px;height:2px;";
    document.body.appendChild(bait);
    const cleanup = () => { if (bait.parentNode) bait.parentNode.removeChild(bait); };
    const timer = setTimeout(async () => {
      const hiddenByCss = !document.body.contains(bait) || bait.offsetParent === null || bait.clientHeight === 0 || getComputedStyle(bait).display === "none";
      cleanup();
      let scriptBlocked = false;
      try { await fetch(EXOCLICK_SCRIPT_SRC, { mode: "no-cors", cache: "no-store" }); }
      catch { scriptBlocked = true; }
      if (!cancelled) setBlocked(hiddenByCss || scriptBlocked);
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); cleanup(); };
  }, [depKey, tick]);
  return [blocked, () => setTick((t) => t + 1)];
}

function AdBlockNotice({ onRetry, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-sm text-center">
        <div className="text-4xl mb-3">🛡️</div>
        <h2 className="font-bold text-lg mb-2">Desactiva tu bloqueador de anuncios</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Los anuncios nos ayudan a mantener KōmiVerso gratis. Desactiva tu adblock para este sitio (o añádelo a la lista de excepciones) y vuelve a intentarlo. También puedes suscribirte para leer sin anuncios.
        </p>
        <div className="flex flex-col gap-2">
          <Btn onClick={onRetry} className="w-full">Ya lo desactivé, reintentar</Btn>
          <Btn variant="outline" onClick={onBack} className="w-full">Volver</Btn>
        </div>
      </div>
    </div>
  );
}

// Gate de anuncio "a prueba de evasión":
// - Mientras esté visible, se atrapa el gesto/botón "atrás" del navegador (popstate)
//   para que no se pueda saltar el anuncio saliendo de la página.
// - onDone solo puede llamarse cuando el contador llega a 0 (el botón está
//   deshabilitado hasta entonces), y quien lo invoca (ReaderPage) es quien
//   limpia la "deuda de anuncio" persistida — ver más abajo.
function ChapterAdGate({ onDone }) {
  const [seconds, setSeconds] = useState(AD_MIN_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Truco anti "atrás": empuja un estado extra al historial y, si el usuario
    // intenta volver (gesto táctil o botón), lo volvemos a empujar en el acto,
    // así el gate nunca desaparece por esa vía mientras no se complete.
    window.history.pushState({ kvAdGate: true }, "");
    const onPopState = () => { window.history.pushState({ kvAdGate: true }, ""); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>Publicidad</span>
      <div className="flex items-center justify-center rounded-lg" style={{ width: 300, height: 530, background: "rgba(255,255,255,0.04)" }}>
        {ADSENSE_CONFIGURADO ? (
          <iframe
            title="ad"
            srcDoc={buildAdHtml()}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: 300, height: 530, border: 0 }}
          />
        ) : (
          <p className="text-xs text-center px-3" style={{ color: "var(--muted)" }}>(Aquí se mostrará un anuncio real en cuanto conectes ExoClick y/o Adsterra, arriba en App.jsx)</p>
        )}
      </div>
      <Btn disabled={seconds > 0} onClick={onDone} className="w-56">{seconds > 0 ? `Continuar (${seconds})` : "Continuar"}</Btn>
    </div>
  );
}

function paginateNovel(paragraphs, budget) {
  const out = [];
  let cur = [];
  let size = 0;
  for (const p of paragraphs) {
    const len = p.length + 40;
    if (cur.length && size + len > budget) { out.push(cur); cur = []; size = 0; }
    cur.push(p);
    size += len;
  }
  if (cur.length) out.push(cur);
  return out;
}

function NovelText({ paragraphs, fontPx, serif, narrow, color }) {
  return (
    <article className="mx-auto px-5 py-6" style={{ maxWidth: narrow ? "44rem" : "100%", color, fontSize: fontPx, lineHeight: 1.85, fontFamily: serif ? "Georgia, 'Times New Roman', serif" : "inherit", overflowWrap: "anywhere" }}>
      {paragraphs.map((p, i) => <p key={i} style={{ marginBottom: "1em" }}>{p}</p>)}
    </article>
  );
}

function ReaderPage({ target, nav, history, auth, goBack }) {
  const { mangaId, chapterId, mangaTitle, cover } = target;
  const { readerPrefs } = useTheme();
  const [pages, setPages] = useState(null);
  const [pageError, setPageError] = useState("");
  const [chapters, setChapters] = useState(null);
  const [mode, setMode] = useState(readerPrefs?.mode || "vertical");
  const [direction, setDirection] = useState(readerPrefs?.direction || "ltr");
  const [page, setPage] = useState(0);
  const [fit, setFit] = useState(readerPrefs?.fit || "width");
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(readerPrefs?.dark !== undefined ? readerPrefs.dark : true);
  const [sepia, setSepia] = useState(readerPrefs?.sepia || false);
  const [hideUI, setHideUI] = useState(false);
  const [quality, setQuality] = useState(readerPrefs?.quality || "full");
  const [fullscreen, setFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(readerPrefs?.scrollSpeed || 30);
  const [percent, setPercent] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [serif, setSerif] = useState(true);
  const scrollRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const markedReadRef = useRef(false);
  const [adBlocked, retryAdCheck] = useAdBlockDetected(chapterId);
  const [adGatePassed, setAdGatePassed] = useState(false);
  const showAds = !auth?.user || auth.user.plan !== "fan";

  useEffect(() => {
    let active = true;
    setPages(null); setPage(0); setPercent(0); setPageError("");
    markedReadRef.current = false;
    if (!showAds) {
      setAdGatePassed(true);
    } else {
      setAdGatePassed(false);
      (async () => {
        // "Deuda de anuncio": si ya se determinó antes que tocaba anuncio y no
        // se completó (el usuario salió con el gesto/botón atrás, cerró la
        // pestaña, etc.), la deuda queda guardada y persigue al usuario sin
        // importar a qué capítulo entre después — no se resuelve por volver
        // atrás y reabrir el mismo capítulo (o cualquier otro).
        let debt = !!(await sget("ad:debt"));
        if (!debt) {
          const key = "ad:chapterOpens";
          let n = Number(await sget(key)) || 0;
          n += 1;
          await sset(key, n);
          const needAd = n % AD_EVERY_N_CHAPTERS === 0;
          if (needAd) { debt = true; await sset("ad:debt", true); }
        }
        if (active) setAdGatePassed(!debt);
      })();
    }
    getChapterPages(chapterId).then(p => { if (active) setPages(p); }).catch(err => { if (active) { setPages(false); setPageError(err?.detail || err?.message || ""); } });
    getChapters(mangaId).then(c => { if (active) setChapters(c); }).catch(() => { if (active) setChapters([]); });
    sget(`bookmarks:${mangaId}:${chapterId}`).then(b => { if (active) setBookmarks(b || []); });
    return () => { active = false; };
  }, [chapterId, mangaId, showAds]);

  const isNovel = !!pages && pages.type === "novel";
  const fontPx = Math.round(18 * zoom);
  const novelPages = useMemo(
    () => (isNovel ? paginateNovel(pages.paragraphs || [], Math.round(1600 / (zoom * zoom))) : []),
    [isNovel, pages, zoom]
  );
  const imgs = isNovel ? novelPages : pages ? (quality === "full" ? pages.full : pages.saver) || [] : [];
  const chapterIdx = chapters ? chapters.findIndex(c => c.id === chapterId) : -1;
  const currentChapter = chapters && chapterIdx >= 0 ? chapters[chapterIdx] : null;
  const nextChapter = chapters && chapterIdx > 0 ? chapters[chapterIdx - 1] : null;
  const prevChapter = chapters && chapterIdx >= 0 && chapterIdx < chapters.length - 1 ? chapters[chapterIdx + 1] : null;

  useEffect(() => {
    if (!imgs.length || isNovel) return;
    [page + 1, page + 2].forEach(i => { if (imgs[i]) { const im = new Image(); im.src = imgs[i]; } });
  }, [page, imgs]);

  const saveProgress = useCallback((pct, pg) => {
    setPercent(pct);
    if (!auth.user) return;
    history.record({ mangaId, chapterId, mangaTitle, cover, chapterNum: currentChapter?.chapter || "?", page: pg, percent: Math.round(pct), timestamp: Date.now() });

    if (pct >= 95 && !markedReadRef.current) {
      markedReadRef.current = true;
      markChapterRead(mangaId, chapterId);
    }
  }, [auth.user, mangaId, chapterId, mangaTitle, cover, currentChapter]);

  useEffect(() => {
    if (mode === "paged") saveProgress(imgs.length ? Math.round(((page + 1) / imgs.length) * 100) : 0, page);
  }, [page, mode, imgs.length]);

  const onScroll = () => {
    const el = scrollRef.current; if (!el || mode !== "vertical") return;
    const pct = Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100));
    saveProgress(pct, Math.round((pct / 100) * imgs.length));
  };

  useEffect(() => {
    if (autoScroll && mode === "vertical" && scrollRef.current) {
      autoScrollTimer.current = setInterval(() => { if (scrollRef.current) scrollRef.current.scrollTop += 1; }, 110 - scrollSpeed);
    }
    return () => clearInterval(autoScrollTimer.current);
  }, [autoScroll, scrollSpeed, mode]);

  useEffect(() => {
    const onKey = (e) => {
      if (mode === "paged") {
        if (e.key === "ArrowRight") goPage(direction === "rtl" ? -1 : 1);
        if (e.key === "ArrowLeft") goPage(direction === "rtl" ? 1 : -1);
      }
      if (e.key === "f") setFullscreen(v => !v);
      if (e.key === "h") setHideUI(v => !v);
      if (e.key === "d") setDark(v => !v);
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, direction, page, imgs.length]);

  const goPage = (delta) => setPage(p => Math.min(Math.max(p + delta, 0), imgs.length - 1));

  useEffect(() => {
    if (imgs.length && page > imgs.length - 1) setPage(imgs.length - 1);
  }, [imgs.length]);

  const onPagedTap = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < r.width / 3) goPage(direction === "rtl" ? 1 : -1);
    else if (x > (2 * r.width) / 3) goPage(direction === "rtl" ? -1 : 1);
    else setHideUI(v => !v);
  };

  const toggleBookmark = async () => {
    const has = bookmarks.includes(page);
    const next = has ? bookmarks.filter(b => b !== page) : [...bookmarks, page];
    setBookmarks(next); await sset(`bookmarks:${mangaId}:${chapterId}`, next);
  };

  const readerStyle = dark ? { background: "#0a0a0a" } : sepia ? { background: "#F1E7D0" } : { background: "#fff" };
  const filterStyle = sepia && !isNovel ? "sepia(0.4)" : "none";
  const novelFg = dark ? "#e5e5e5" : sepia ? "#3b2f1e" : "#1a1a1a";
  const readerFg = dark ? "#fff" : "#1a1a1a";
  const readerFgMuted = dark ? "#888" : "#666";

  const goToChapter = (ch) => { if (ch) nav("reader", { mangaId, chapterId: ch.id, mangaTitle, cover }); };

  if (adBlocked) {
    return <AdBlockNotice onRetry={retryAdCheck} onBack={() => (goBack ? goBack() : nav("manga", mangaId))} />;
  }
  if (showAds && !adGatePassed) {
    return (
      <ChapterAdGate
        onDone={async () => {
          await sset("ad:debt", false);
          setAdGatePassed(true);
        }}
      />
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${fullscreen ? "" : ""}`} style={readerStyle}>
      {!hideUI && (
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0" style={{ background: "rgba(20,20,20,0.9)", backdropFilter: "blur(8px)" }}>
          <button onClick={() => (goBack ? goBack() : nav("manga", mangaId))} className="text-white"><ChevronLeft size={22} /></button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{mangaTitle}</p>
            <p className="text-[10px]" style={{ color: "#999" }}>Cap. {currentChapter?.chapter ?? "…"}</p>
          </div>
          <button onClick={toggleBookmark} className="text-white"><Bookmark size={18} fill={bookmarks.includes(page) ? "#fff" : "none"} /></button>
          <button onClick={() => setShowComments(true)} className="text-white"><MessageCircle size={18} /></button>
          <button onClick={() => setHideUI(true)} className="text-white"><EyeOff size={18} /></button>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative" onClick={() => hideUI && setHideUI(false)}>
        {pages === null ? <div className="h-full flex items-center justify-center"><Loader className="animate-spin" style={{ color: readerFg }} /></div> :
          pages === false ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center text-sm" style={{ color: readerFg }}>
              <p>No se pudieron cargar las páginas.</p>
              {pageError && <p className="text-xs opacity-70">{pageError}</p>}
              <Btn size="sm" variant="outline" onClick={() => { setPages(null); setPageError(""); getChapterPages(chapterId).then(setPages).catch(err => { setPages(false); setPageError(err?.detail || err?.message || ""); }); }}>Reintentar</Btn>
            </div>
          ) :
          imgs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center text-sm" style={{ color: readerFg }}>
              <p>Este capítulo no tiene páginas disponibles.</p>
              <Btn size="sm" variant="outline" onClick={() => { setPages(null); getChapterPages(chapterId).then(setPages).catch(() => setPages(false)); }}>Reintentar</Btn>
            </div>
          ) :
          mode === "vertical" ? (
            <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto" style={{ filter: filterStyle }}>
              {isNovel
                ? <NovelText paragraphs={pages.paragraphs} fontPx={fontPx} serif={serif} narrow={fit === "width"} color={novelFg} />
                : imgs.map((src, i) => <img key={i} src={resolveAssetUrl(src)} loading={i < 3 ? "eager" : "lazy"} decoding="async" className="w-full block mx-auto" style={{ maxWidth: fit === "width" ? "100%" : "none", height: fit === "height" ? "100vh" : "auto", transform: `scale(${zoom})`, transformOrigin: "top center" }} />)}
              <div className="text-center py-8 text-sm" style={{ color: readerFg }}>
                {nextChapter ? <Btn onClick={() => goToChapter(nextChapter)}>Siguiente capítulo <ChevronRight size={15} /></Btn> : <p style={{ color: readerFgMuted }}>Fin del capítulo</p>}
              </div>
            </div>
          ) : (
            isNovel ? (
              <div key={page} className="h-full overflow-y-auto select-none" onClick={onPagedTap}>
                <NovelText paragraphs={imgs[page] || []} fontPx={fontPx} serif={serif} narrow={fit === "width"} color={novelFg} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center touch-pan-x select-none" style={{ filter: filterStyle }} onClick={onPagedTap}>
                {imgs[page] && <img src={resolveAssetUrl(imgs[page])} className="max-h-full mx-auto" style={{ maxWidth: fit === "width" ? "100%" : "none", objectFit: "contain", transform: `scale(${zoom})` }} />}
              </div>
            )
          )}
      </div>

      {!hideUI && mode === "paged" && (
        <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ background: "rgba(20,20,20,0.9)" }}>
          <button onClick={() => goPage(direction === "rtl" ? 1 : -1)} className="text-white"><ChevronLeft size={18} /></button>
          <div className="flex-1 h-1 rounded-full" style={{ background: "#333" }}><div className="h-full rounded-full" style={{ width: `${((page + 1) / (imgs.length || 1)) * 100}%`, background: "var(--accent)" }} /></div>
          <span className="text-white text-xs w-14 text-center">{page + 1}/{imgs.length}</span>
          <button onClick={() => goPage(direction === "rtl" ? -1 : 1)} className="text-white"><ChevronRight size={18} /></button>
        </div>
      )}
      {!hideUI && mode === "vertical" && (
        <div className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0" style={{ background: "rgba(20,20,20,0.9)" }}>
          <div className="flex-1 h-1 rounded-full" style={{ background: "#333" }}><div className="h-full rounded-full" style={{ width: `${percent}%`, background: "var(--accent)" }} /></div>
          <span className="text-white text-xs w-10 text-right">{percent}%</span>
        </div>
      )}

      {!hideUI && (
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto flex-shrink-0" style={{ background: "rgba(15,15,15,0.95)" }}>
          <ReaderBtn active={mode === "vertical"} onClick={() => setMode("vertical")} icon={<ListIcon size={15} />} label="Vertical" />
          <ReaderBtn active={mode === "paged"} onClick={() => setMode("paged")} icon={<Grid size={15} />} label="Página" />
          <ReaderBtn active={direction === "rtl"} onClick={() => setDirection(d => d === "rtl" ? "ltr" : "rtl")} icon={<ArrowRightLeftIcon />} label={direction === "rtl" ? "Der→Izq" : "Izq→Der"} />
          <ReaderBtn onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} icon={<ZoomIn size={15} />} label={isNovel ? "Texto+" : "Zoom+"} />
          <ReaderBtn onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} icon={<ZoomOut size={15} />} label={isNovel ? "Texto-" : "Zoom-"} />
          <ReaderBtn onClick={() => setZoom(1)} icon={<RotateCcw size={15} />} label="Reset" />
          <ReaderBtn active={fit === "width"} onClick={() => setFit(f => f === "width" ? "height" : "width")} icon={<Maximize size={15} />} label={isNovel ? (fit === "width" ? "Columna" : "Ancho") : (fit === "width" ? "Ancho" : "Alto")} />
          <ReaderBtn active={dark} onClick={() => setDark(v => !v)} icon={<Moon size={15} />} label="Oscuro" />
          <ReaderBtn active={sepia} onClick={() => setSepia(v => !v)} icon={<Coffee size={15} />} label="Sepia" />
          {isNovel
            ? <ReaderBtn active={serif} onClick={() => setSerif(v => !v)} icon={<Type size={15} />} label={serif ? "Serif" : "Sans"} />
            : <ReaderBtn active={quality === "saver"} onClick={() => setQuality(q => q === "full" ? "saver" : "full")} icon={<Download size={15} />} label={quality === "full" ? "Alta cal." : "Ahorro"} />}
          <ReaderBtn active={autoScroll} onClick={() => setAutoScroll(v => !v)} icon={autoScroll ? <Pause size={15} /> : <Play size={15} />} label="Auto" />
          <ReaderBtn onClick={() => setFullscreen(v => !v)} icon={fullscreen ? <Minimize size={15} /> : <Maximize size={15} />} label="Pantalla" />
          <ReaderBtn onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })} icon={<ArrowUp size={15} />} label="Arriba" />
          <ReaderBtn onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })} icon={<ArrowDown size={15} />} label="Final" />
        </div>
      )}
      {!hideUI && autoScroll && (
        <div className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0" style={{ background: "rgba(15,15,15,0.95)" }}>
          <span className="text-[10px] text-white">Velocidad</span>
          <input type="range" min="5" max="90" value={scrollSpeed} onChange={e => setScrollSpeed(+e.target.value)} className="flex-1" />
        </div>
      )}
      {!hideUI && (
        <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ background: "rgba(15,15,15,0.95)" }}>
          <Btn variant="surface" size="sm" disabled={!prevChapter} onClick={() => goToChapter(prevChapter)}><ChevronLeft size={14} /> Anterior</Btn>
          <span className="text-[10px]" style={{ color: "#888" }}>Atajos: ←/→ · f pantalla · h ocultar · d oscuro</span>
          <Btn variant="surface" size="sm" disabled={!nextChapter} onClick={() => goToChapter(nextChapter)}>Siguiente <ChevronRight size={14} /></Btn>
        </div>
      )}

      <Modal open={showComments} onClose={() => setShowComments(false)} title={`Comentarios · Cap. ${currentChapter?.chapter ?? ""}`} wide>
        <CommentsSection mangaId={mangaId} chapterId={chapterId} auth={auth} setAuthModal={() => {}} />
      </Modal>
    </div>
  );
}
function ReaderBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg flex-shrink-0" style={{ background: active ? "var(--accent)" : "transparent", color: "#fff" }}>
      {icon}<span className="text-[9px] whitespace-nowrap">{label}</span>
    </button>
  );
}
function ArrowRightLeftIcon() { return <span style={{ fontSize: 13 }}>⇄</span>; }

function LibraryPage({ lib, history, nav, auth, setAuthModal }) {
  const [tab, setTab] = useState("favoritos");
  const theme = useTheme();
  if (!auth.user) return (
    <div className="p-8 text-center">
      <Library size={36} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Inicia sesión para guardar tu biblioteca, favoritos e historial.</p>
      <Btn onClick={() => setAuthModal("login")}>Iniciar sesión</Btn>
    </div>
  );
  const tabs = [["favoritos", "Favoritos"], ["leyendo", "En lectura"], ["completados", "Completados"], ["pendientes", "Pendientes"], ["pausados", "Pausados"], ["abandonados", "Abandonados"], ["historial", "Historial"]];
  const list = tab === "historial" ? null : lib.lib[tab];
  const view = theme.libraryView || "grid";
  const coverSize = theme.coverSize || "md";
  const gridCols = coverSize === "sm" ? "grid-cols-4" : coverSize === "lg" ? "grid-cols-2" : "grid-cols-3";
  const listCoverW = coverSize === "sm" ? "w-10 h-14" : coverSize === "lg" ? "w-16 h-22" : "w-12 h-16";

  return (
    <div className="pt-3 pb-8">
      <h1 className="px-4 font-bold text-lg mb-3">Mi biblioteca</h1>
      <div className="flex gap-2 px-4 overflow-x-auto mb-4" style={{ scrollbarWidth: "none" }}>
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0 font-medium" style={{ background: tab === k ? "var(--accent)" : "var(--surface2)", color: tab === k ? "#fff" : "var(--text)" }}>{l}</button>)}
      </div>

      {tab === "historial" ? (
        <div className="px-4 space-y-2">
          {history.history.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>Sin historial todavía.</p>}
          {history.history.map(h => (
            <div key={h.mangaId + h.chapterId} onClick={() => nav("manga", h.mangaId)} className="flex gap-3 items-center p-2 rounded-xl cursor-pointer" style={{ background: "var(--surface)" }}>
              <ProxyImg src={h.cover} className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{h.mangaTitle}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Capítulo {h.chapterNum} · {h.percent}% leído</p>
              </div>
              <Btn size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); nav("reader", { mangaId: h.mangaId, chapterId: h.chapterId, mangaTitle: h.mangaTitle, cover: h.cover }); }}>▶ Continuar</Btn>
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="px-4 space-y-2">
          {list.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Lista vacía.</p> : list.map(m => (
            <div key={m.id} onClick={() => nav("manga", m.id)} className="flex gap-3 items-center p-2 rounded-xl cursor-pointer" style={{ background: "var(--surface)" }}>
              <ProxyImg src={m.cover} className={`${listCoverW} rounded-lg object-cover flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.title}</p>
                {m.capituloActual != null && <p className="text-xs" style={{ color: "var(--muted)" }}>Cap. {m.capituloActual}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`px-4 grid ${gridCols} gap-x-3 gap-y-4`}>
          {list.length === 0 ? <p className="text-sm col-span-full" style={{ color: "var(--muted)" }}>Lista vacía.</p> : list.map(m => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} />)}
        </div>
      )}
    </div>
  );
}

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function CalendarPage({ nav, lib }) {
  const [byDay, setByDay] = useState(null);
  const [onlyFav, setOnlyFav] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((keepData = false) => {
    if (!keepData) setByDay(null);
    setRefreshing(true);
    searchManga({ "status[]": ["ongoing"], "order[followedCount]": "desc", limit: 42 }).then(r => {
      const grouped = {};
      WEEKDAYS.forEach(d => grouped[d] = []);
      r.list.forEach((m, i) => { grouped[WEEKDAYS[i % 7]].push(m); });
      setByDay(grouped);
    }).catch(() => setByDay(prev => prev || {})).finally(() => setRefreshing(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="pt-3 pb-8 px-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-bold text-lg flex items-center gap-2"><CalendarIcon size={18} /> Calendario</h1>
        <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium disabled:opacity-50" style={{ background: "var(--surface2)" }}>
          <RotateCcw size={13} className={refreshing ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Estimado según lanzamientos recientes de obras en emisión.</p>
      <label className="flex items-center gap-2 text-xs mb-4"><input type="checkbox" checked={onlyFav} onChange={e => setOnlyFav(e.target.checked)} /> Solo mis favoritos ❤️</label>
      {byDay === null ? <Loader className="animate-spin" /> : WEEKDAYS.map(day => {
        const items = (byDay[day] || []).filter(m => !onlyFav || lib.isFav(m.id));
        if (onlyFav && items.length === 0) return null;
        return (
          <div key={day} className="mb-4">
            <h3 className="text-sm font-semibold mb-2">{day}</h3>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {items.length === 0 ? <p className="text-xs" style={{ color: "var(--muted)" }}>Sin obras.</p> : items.map(m => <Cover key={m.id} manga={m} onClick={() => nav("manga", m.id)} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfilePage({ auth, lib, history, setAuthModal }) {
  const fileRef = useRef(null);
  const [bio, setBio] = useState(auth.user?.bio || "");
  const [username, setUsername] = useState(auth.user?.username || "");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!auth.user) return (
    <div className="p-8 text-center">
      <User size={36} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Inicia sesión para ver tu perfil.</p>
      <Btn onClick={() => setAuthModal("login")}>Iniciar sesión</Btn>
    </div>
  );

  const onAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 200; canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        setUploadingAvatar(true);
        auth.updateProfile({ avatar: canvas.toDataURL("image/jpeg", 0.8) })
          .catch(err => alert("No se pudo actualizar la foto de perfil: " + (err.message || "error desconocido")))
          .finally(() => setUploadingAvatar(false));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const chaptersRead = history.history.length;
  const xp = auth.user.xp ?? 0;
  const prog = xpProgress(xp);
  const level = auth.user.level ?? prog.level;
  const rank = rankForLevel(level);
  const userTitles = Array.isArray(auth.user.titles) ? auth.user.titles : [];
  const activeTitle = auth.user.activeTitle || null;
  const stats = [
    ["Capítulos leídos", chaptersRead], ["Completados", lib.lib.completados.length],
    ["Favoritos", lib.lib.favoritos.length], ["XP", xp],
  ];
  const achievements = [
    { done: chaptersRead >= 1, label: "Primer capítulo", icon: "★" },
    { done: chaptersRead >= 50, label: "Lector constante", icon: "·" },
    { done: chaptersRead >= 200, label: "Devorador de historias", icon: "▲" },
    { done: lib.lib.completados.length >= 5, label: "Finalizador", icon: "■" },
    { done: lib.lib.favoritos.length >= 10, label: "Coleccionista", icon: "♥" },
  ];
  const setActiveTitle = async (title) => {
    try {
      await auth.updateProfile({ activeTitle: title });
    } catch (e) {
      alert("No se pudo cambiar el título: " + (e.message || "error"));
    }
  };

  return (
    <div className="pt-3 pb-8 px-4">
      <div className="flex flex-col items-center text-center mb-5">
        <button onClick={() => fileRef.current?.click()} className="relative w-24 h-24 rounded-full overflow-hidden mb-3" style={{ background: "var(--surface2)" }}>
          {auth.user.avatar ? <img src={auth.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold">{auth.user.username[0].toUpperCase()}</div>}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.4)" }}><Camera size={20} color="#fff" /></div>
          {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>Subiendo…</div>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />
        <h1 className="font-bold text-lg">{auth.user.username}</h1>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{auth.user.email}</p>
        {activeTitle && <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--accent)" }}>{activeTitle}</p>}
        <span className="text-xs mt-1 px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "var(--surface2)" }}>
          <Award size={12} /> {rank.icon} {rank.label} · Nv. {level}
        </span>
        <div className="w-full max-w-xs mt-2">
          <div className="flex justify-between text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>
            <span>{prog.into} / {prog.need} XP</span>
            <span>Nv. {level}{level < 50 ? ` → ${level + 1}` : " MAX"}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${prog.pct}%`, background: "var(--accent)" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {stats.map(([l, v]) => <div key={l} className="text-center p-2 rounded-xl" style={{ background: "var(--surface)" }}><p className="font-bold text-base">{v}</p><p className="text-[10px]" style={{ color: "var(--muted)" }}>{l}</p></div>)}
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Award size={14} /> Títulos</p>
        {userTitles.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--muted)" }}>Lee capítulos para desbloquear títulos.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {userTitles.map(t => (
              <button
                key={t}
                onClick={() => setActiveTitle(activeTitle === t ? null : t)}
                className="text-xs px-2.5 py-1.5 rounded-full font-medium"
                style={{
                  background: activeTitle === t ? "var(--accent)" : "var(--surface2)",
                  color: activeTitle === t ? "#fff" : "var(--text)",
                  border: activeTitle === t ? "none" : "1px solid var(--border)",
                }}
              >
                {t}{activeTitle === t ? " ✓" : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Award size={14} /> Logros</p>
        <div className="flex gap-2 flex-wrap">
          {achievements.map(a => <span key={a.label} className="text-xs px-2.5 py-1.5 rounded-full" style={{ background: a.done ? "var(--accent)" : "var(--surface2)", color: a.done ? "#fff" : "var(--muted)", opacity: a.done ? 1 : 0.6 }}>{a.icon} {a.label}</span>)}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Nombre de usuario</p>
        <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Biografía</p>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
        <Btn size="sm" className="mt-2" disabled={savingProfile} onClick={async () => {
          setSavingProfile(true);
          try {
            await auth.updateProfile({ username, bio });
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          } catch (err) {
            alert("No se pudieron guardar los cambios: " + (err.message || "error desconocido"));
          } finally {
            setSavingProfile(false);
          }
        }}>{savingProfile ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}</Btn>
      </div>

      <Btn variant="outline" className="w-full" onClick={auth.logout}><LogOut size={15} /> Cerrar sesión</Btn>
    </div>
  );
}

function SettingsPage() {
  const theme = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <div className="pt-3 pb-8 px-4 kv-page-enter">
      <h1 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={18} /> {t("settings")}</h1>

      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Palette size={15} /> {t("theme")}</p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => theme.setPresetId(p.id)} className="p-2 rounded-xl text-left" style={{ border: theme.presetId === p.id ? "2px solid var(--accent)" : "1px solid var(--border)", background: p.bg }}>
            <div className="flex gap-1 mb-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
              <span className="w-3 h-3 rounded-full" style={{ background: p.surface2 }} />
              <span className="w-3 h-3 rounded-full" style={{ background: p.mode === "dark" ? "#fff" : "#000" }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: p.text }}>{p.label}</span>
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Type size={15} /> {t("readingFont")}</p>
      <div className="space-y-1.5 mb-6">
        {FONTS.map(f => (
          <button key={f.id} onClick={() => theme.setFontId(f.id)} className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between" style={{ background: theme.fontId === f.id ? "var(--surface2)" : "transparent", border: "1px solid var(--border)", fontFamily: f.family }}>
            <span className="text-sm">{f.label} — Aa Bb Cc</span>
            {theme.fontId === f.id && <CheckCircle size={15} style={{ color: "var(--accent)" }} />}
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Globe size={15} /> {t("uiLanguage")}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {LANGS.map(l => (
          <button key={l.id} onClick={() => setLang(l.id)} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: lang === l.id ? "var(--accent)" : "var(--surface2)", color: lang === l.id ? "#fff" : "var(--text)" }}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>
      <p className="text-[11px]" style={{ color: "var(--muted)" }}>{t("interfaceLangNote")}</p>
    </div>
  );
}

function SideDrawer({ open, onClose, nav, auth, setAuthModal }) {
  const t = useT();
  const theme = useTheme();
  const { lang, setLang } = useLang();
  const [infoModal, setInfoModal] = useState(null);
  const [reportText, setReportText] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [suggTitle, setSuggTitle] = useState("");
  const [suggDesc, setSuggDesc] = useState("");
  const [suggHelp, setSuggHelp] = useState("");
  const [suggBusy, setSuggBusy] = useState(false);
  const resetSuggestion = () => { setSuggTitle(""); setSuggDesc(""); setSuggHelp(""); };
  const sendSuggestion = async () => {
    if (!suggTitle.trim() || !suggDesc.trim() || !suggHelp.trim()) { alert(t("suggestionMissing")); return; }
    setSuggBusy(true);
    try {
      await apiJson("/feedback/suggestion", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          title: suggTitle.trim(),
          desc: suggDesc.trim(),
          help: suggHelp.trim(),
          platform: "web",
          lang,
        }),
      });
      alert(t("suggestionSent"));
      resetSuggestion();
      setInfoModal(null);
    } catch (e) {
      alert(e?.status === 429 ? e.message : t("suggestionError"));
    } finally {
      setSuggBusy(false);
    }
  };
  const sendReport = async () => {
    if (!reportText.trim() || reportBusy) return;
    setReportBusy(true);
    try {
      await apiJson("/feedback/report", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ text: reportText.trim(), platform: "web", lang }),
      });
      alert(t("reportSent"));
      setInfoModal(null);
      setReportText("");
    } catch (e) {
      alert(e?.status === 429 ? e.message : t("reportError"));
    } finally {
      setReportBusy(false);
    }
  };
  const [wallpaperLoading, setWallpaperLoading] = useState(false);
  const wallpaperInputRef = useRef(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!open) setView(null);
  }, [open]);

  const onPickWallpaper = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setWallpaperLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        theme.setWallpaperUrl(dataUrl);
        setWallpaperLoading(false);
      };
      img.onerror = () => setWallpaperLoading(false);
      img.src = reader.result;
    };
    reader.onerror = () => setWallpaperLoading(false);
    reader.readAsDataURL(file);
  };

  const go = (page, arg) => {
    onClose();
    setView(null);
    if (page === "login") { setAuthModal("login"); return; }
    if (page === "about") { setInfoModal("about"); return; }
    if (page === "contact") { setInfoModal("contact"); return; }
    if (page === "report") { setInfoModal("report"); return; }
    if (page === "suggestion") { setInfoModal("suggestion"); return; }
    nav(page, arg);
  };

  const categories = [
    { id: "explore", title: t("explore"), Icon: Compass },
    { id: "personalization", title: "Personalización", Icon: Palette },
    { id: "config", title: t("settings"), Icon: Settings },
    { id: "info", title: t("information"), Icon: Info },
  ];

  const exploreItems = [
    { label: t("allTitles"), action: () => go("search", {}) },
    { label: t("manga"), action: () => go("search", { origin: "ja" }) },
    { label: t("manhwa"), action: () => go("search", { origin: "ko" }) },
    { label: t("manhua"), action: () => go("search", { origin: "zh" }) },
    { label: t("novels"), action: () => go("search", { q: "novel" }) },
    { label: t("genres"), action: () => go("search", {}) },
  ];

  const personalizationItems = [
    { id: "appearance", label: t("appearance") },
    { id: "reader", label: t("reader") },
  ];

  const configItems = [
    { id: "language", label: t("language") },
    { id: "notifications", label: t("notifications") },
  ];

  const infoItems = [
    { label: t("about"), action: () => go("about") },
    { label: t("contact"), action: () => go("contact") },
    { label: t("reportProblem"), action: () => go("report") },
    { label: t("suggestion"), action: () => go("suggestion") },
  ];

  const titles = {
    explore: t("explore"),
    personalization: "Personalización",
    config: t("settings"),
    info: t("information"),
    appearance: t("appearance"),
    reader: t("reader"),
    language: t("language"),
    notifications: t("notifications"),
    theme: "Temas",
    font: "Fuentes",
    wallpaper: "Fondo de pantalla",
    accent: "Color de acento",
    density: "Densidad de la interfaz",
  };

  const titleIcons = {
    explore: Compass,
    personalization: Palette,
    config: Settings,
    info: Info,
    appearance: Palette,
    reader: BookOpen,
    language: Languages,
    notifications: Bell,
    theme: Moon,
    font: Type,
    wallpaper: ImageIcon,
    accent: Wand2,
    density: Sliders,
    amoled: Layout,
    libraryView: LayoutGrid,
    tabOrder: Grid,
  };

  const parentOf = {
    appearance: "personalization",
    reader: "personalization",
    language: "config",
    notifications: "config",
    theme: "appearance",
    font: "appearance",
    wallpaper: "appearance",
    accent: "appearance",
    density: "appearance",
    amoled: "appearance",
    libraryView: "appearance",
    tabOrder: "appearance",
    explore: null,
    personalization: null,
    config: null,
    info: null,
  };

  const back = () => {
    if (parentOf[view]) setView(parentOf[view]);
    else setView(null);
  };

  const PrefRow = ({ label, children }) => (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl mb-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">{children}</div>
    </div>
  );

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} className="text-xs px-2.5 py-1.5 rounded-full font-medium" style={{ background: active ? "var(--accent)" : "var(--surface2)", color: active ? "#fff" : "var(--text)" }}>
      {children}
    </button>
  );

  const Toggle = ({ on, onChange }) => (
    <button
      onClick={() => onChange(!on)}
      className="relative w-11 h-6 rounded-full transition-colors"
      style={{ background: on ? "var(--accent)" : "var(--surface2)", border: "1px solid var(--border)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{ left: on ? 22 : 2, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
      />
    </button>
  );

  const FullScreen = ({ title, onBack, children, icon: Icon }) => (
    <div className="fixed inset-0 z-[95] flex flex-col kv-page-enter" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <button onClick={onBack} className="p-1 -ml-1" style={{ color: "var(--text)" }} aria-label="Volver">
          <ChevronLeft size={22} />
        </button>
        {Icon ? <Icon size={20} style={{ color: "var(--accent)", flexShrink: 0 }} /> : null}
        <h2 className="text-base font-bold flex-1">{title}</h2>
        <button onClick={onClose} style={{ color: "var(--muted)" }} aria-label="Cerrar"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">{children}</div>
    </div>
  );

  const ListButtons = ({ items }) => (
    <div className="space-y-2">
      {items.map((item, i) => (
        <button
          key={item.label || item.id}
          onClick={item.action || (() => setView(item.id))}
          className="w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all active:scale-[0.98]"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", animation: `kv-fade-in 0.28s ease ${i * 40}ms both` }}
        >
          <span className="text-sm font-medium">{item.label}</span>
          <ChevronRight size={16} style={{ color: "var(--muted)" }} />
        </button>
      ))}
    </div>
  );

  const SettingCard = ({ icon, label, description, value, onClick, preview, disabled, badge }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] mb-2"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: disabled ? 0.5 : 1 }}
    >
      {preview ? (
        <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
          {preview}
        </div>
      ) : icon ? (
        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "var(--surface2)", color: "var(--accent)" }}>
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{label}</span>
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "#fff" }}>{badge}</span>}
        </div>
        {description && <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{description}</p>}
      </div>
      <div className="text-right flex-shrink-0 flex items-center gap-1.5">
        {value && <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{value}</span>}
        <ChevronRight size={16} style={{ color: "var(--muted)" }} />
      </div>
    </button>
  );

  if (!open && !infoModal) return null;

  return (
    <>
      {open && !view && (
        <div className="fixed inset-0 z-[90]" onClick={onClose}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
          <div
            className="absolute top-0 left-0 bottom-0 w-[82%] max-w-xs overflow-y-auto kv-drawer-enter shadow-2xl"
            style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="font-black text-lg tracking-tight"><span style={{ color: "var(--accent)" }}>Kōmi</span>Verso</span>
              <button onClick={onClose} style={{ color: "var(--muted)" }}><X size={20} /></button>
            </div>
            {auth.user ? (
              <button onClick={() => go("profile")} className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold" style={{ background: "var(--surface2)" }}>
                  {auth.user.avatar ? <img src={auth.user.avatar} className="w-full h-full object-cover" /> : auth.user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{auth.user.username}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{auth.user.email}</p>
                </div>
              </button>
            ) : (
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <Btn size="sm" className="w-full" onClick={() => go("login")}>{t("enter")}</Btn>
              </div>
            )}
            <div className="py-1">
              {categories.map(cat => {
                const Ic = cat.Icon;
                return (
                <button
                  key={cat.id}
                  onClick={() => setView(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    {Ic ? <Ic size={20} style={{ color: "var(--accent)" }} /> : null}
                    {cat.title}
                  </span>
                  <ChevronRight size={18} style={{ color: "var(--muted)" }} />
                </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {open && view === "explore" && (
        <FullScreen title={titles.explore} icon={titleIcons.explore} onBack={back}>
          <ListButtons items={exploreItems} />
        </FullScreen>
      )}

      {open && view === "personalization" && (
        <FullScreen title={titles.personalization} icon={titleIcons.personalization} onBack={back}>
          <ListButtons items={personalizationItems} />
        </FullScreen>
      )}

      {open && view === "config" && (
        <FullScreen title={titles.config} icon={titleIcons.config} onBack={back}>
          <ListButtons items={configItems} />
        </FullScreen>
      )}

      {open && view === "info" && (
        <FullScreen title={titles.info} icon={titleIcons.info} onBack={back}>
          <ListButtons items={infoItems} />
        </FullScreen>
      )}

      {open && view === "appearance" && (() => {
        const currentPreset = PRESETS.find(p => p.id === theme.presetId);
        const currentFont = FONTS.find(f => f.id === theme.fontId);
        return (
          <FullScreen title={titles.appearance} icon={titleIcons.appearance} onBack={back}>
            <SettingCard
              label="Temas"
              description="Colores de la app: fondo, acento y superficies"
              value={currentPreset?.label}
              onClick={() => setView("theme")}
              preview={currentPreset && (
                <div className="w-full h-full grid grid-cols-2" style={{ background: currentPreset.bg }}>
                  <span style={{ background: currentPreset.accent }} />
                  <span style={{ background: currentPreset.surface2 }} />
                </div>
              )}
            />
            <SettingCard
              icon={<Type size={18} />}
              label="Fuentes"
              description="Tipografía usada en toda la interfaz"
              value={currentFont?.label}
              onClick={() => setView("font")}
            />
            <SettingCard
              icon={<ImageIcon size={18} />}
              label="Fondo de pantalla"
              description="Imagen de fondo con opacidad ajustable"
              value={theme.wallpaperUrl ? "Activo" : "Ninguno"}
              onClick={() => setView("wallpaper")}
              preview={theme.wallpaperUrl && <img src={theme.wallpaperUrl} className="w-full h-full object-cover" />}
            />
            <SettingCard
              icon={<Sliders size={18} />}
              label="Color de acento"
              description="Elige un color propio para botones y enlaces"
              onClick={() => setView("accent")}
            />
            <SettingCard
              icon={<Layout size={18} />}
              label="Densidad de la interfaz"
              description="Espaciado compacto, cómodo o amplio"
              onClick={() => setView("density")}
            />
            <SettingCard
              icon={<Moon size={18} />}
              label="Modo AMOLED"
              description="Negro puro para pantallas OLED, ahorra batería"
              value={theme.amoled ? "Activado" : "Desactivado"}
              onClick={() => setView("amoled")}
            />
            <SettingCard
              icon={<LayoutGrid size={18} />}
              label="Biblioteca: vista"
              description="Cuadrícula o lista, tamaño de las portadas"
              value={theme.libraryView === "list" ? "Lista" : "Cuadrícula"}
              onClick={() => setView("libraryView")}
            />
            <SettingCard
              icon={<Wand2 size={18} />}
              label="Iconos y orden de la barra inferior"
              description="Reordena o cambia qué pestañas se muestran"
              onClick={() => setView("tabOrder")}
            />
          </FullScreen>
        );
      })()}

      {open && view === "theme" && (
        <FullScreen title="Temas" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Elige la paleta de colores de toda la app.</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => theme.setPresetId(p.id)} className="p-2 rounded-xl text-left" style={{ border: theme.presetId === p.id ? "2px solid var(--accent)" : "1px solid var(--border)", background: p.bg }}>
                <div className="flex gap-1 mb-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: p.surface2 }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: p.mode === "dark" ? "#fff" : "#000" }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: p.text }}>{p.label}</span>
              </button>
            ))}
          </div>
        </FullScreen>
      )}

      {open && view === "font" && (
        <FullScreen title="Fuentes" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Tipografía usada en menús, títulos y textos de la app.</p>
          <div className="space-y-1.5">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => theme.setFontId(f.id)} className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between" style={{ background: theme.fontId === f.id ? "var(--surface2)" : "var(--surface)", border: "1px solid var(--border)", fontFamily: f.family }}>
                <span className="text-sm">{f.label} — Aa Bb Cc</span>
                {theme.fontId === f.id && <CheckCircle size={15} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
        </FullScreen>
      )}

      {open && view === "wallpaper" && (
        <FullScreen title="Fondo de pantalla" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Una imagen de fondo detrás de la interfaz, con opacidad ajustable para que no estorbe la lectura.</p>
          <input ref={wallpaperInputRef} type="file" accept="image/*" onChange={onPickWallpaper} className="hidden" />
          {theme.wallpaperUrl && (
            <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid var(--border)", aspectRatio: "16/9" }}>
              <img src={theme.wallpaperUrl} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex gap-2 mb-4">
            <Btn onClick={() => wallpaperInputRef.current?.click()} disabled={wallpaperLoading} className="flex-1">
              <ImageIcon size={15} /> {wallpaperLoading ? "Cargando…" : theme.wallpaperUrl ? "Cambiar imagen" : "Elegir de la galería"}
            </Btn>
            {theme.wallpaperUrl && (
              <Btn variant="surface" onClick={() => theme.setWallpaperUrl(null)}><Trash2 size={15} /></Btn>
            )}
          </div>
          {theme.wallpaperUrl && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Opacidad del fondo</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{Math.round(theme.wallpaperOpacity * 100)}%</span>
              </div>
              <input type="range" min="5" max="50" value={Math.round(theme.wallpaperOpacity * 100)} onChange={e => theme.setWallpaperOpacity(+e.target.value / 100)} className="w-full" />
            </div>
          )}
        </FullScreen>
      )}

      {open && view === "accent" && (
        <FullScreen title="Color de acento" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Sustituye el color de acento del tema elegido por uno propio, para botones, enlaces y resaltados.</p>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={theme.customAccent || theme.preset.accent}
              onChange={e => theme.setCustomAccent?.(e.target.value)}
              className="w-14 h-14 rounded-xl border-0 p-0 overflow-hidden"
              style={{ background: "transparent" }}
            />
            <div className="text-sm">
              <p className="font-medium">Elige un color</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Se aplica encima del tema actual</p>
            </div>
          </div>
          {theme.customAccent && (
            <Btn variant="outline" className="w-full" onClick={() => theme.setCustomAccent?.(null)}>Restablecer color del tema</Btn>
          )}
        </FullScreen>
      )}

      {open && view === "density" && (
        <FullScreen title="Densidad de la interfaz" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Controla cuánto espacio hay entre elementos: más compacto cabe más en pantalla, más amplio es más fácil de tocar.</p>
          <div className="space-y-2">
            {[
              { id: "compact", label: "Compacta" },
              { id: "comfortable", label: "Cómoda" },
              { id: "spacious", label: "Amplia" },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => theme.setDensity?.(d.id)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between"
                style={{ background: (theme.density || "comfortable") === d.id ? "var(--surface2)" : "var(--surface)", border: (theme.density || "comfortable") === d.id ? "2px solid var(--accent)" : "1px solid var(--border)" }}
              >
                <span className="text-sm font-medium">{d.label}</span>
                {(theme.density || "comfortable") === d.id && <CheckCircle size={16} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
        </FullScreen>
      )}

      {open && view === "amoled" && (
        <FullScreen title="Modo AMOLED" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Fondo negro puro en temas oscuros. Ideal para OLED y ahorro de batería.</p>
          <PrefRow label="Activar modo AMOLED">
            <Toggle on={!!theme.amoled} onChange={(v) => theme.setAmoled?.(v)} />
          </PrefRow>
          {theme.preset?.mode === "light" && (
            <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>Solo aplica cuando el tema actual es oscuro.</p>
          )}
        </FullScreen>
      )}

      {open && view === "libraryView" && (
        <FullScreen title="Biblioteca: vista" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Cómo se muestran las portadas en tu biblioteca.</p>
          <p className="text-xs font-semibold mb-2">Disposición</p>
          <div className="space-y-2 mb-4">
            {[
              { id: "grid", label: "Cuadrícula", icon: <LayoutGrid size={16} /> },
              { id: "list", label: "Lista", icon: <ListIcon size={16} /> },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => theme.setLibraryView?.(d.id)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between"
                style={{ background: (theme.libraryView || "grid") === d.id ? "var(--surface2)" : "var(--surface)", border: (theme.libraryView || "grid") === d.id ? "2px solid var(--accent)" : "1px solid var(--border)" }}
              >
                <span className="text-sm font-medium flex items-center gap-2">{d.icon} {d.label}</span>
                {(theme.libraryView || "grid") === d.id && <CheckCircle size={16} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold mb-2">Tamaño de portadas</p>
          <div className="space-y-2">
            {[
              { id: "sm", label: "Pequeño" },
              { id: "md", label: "Mediano" },
              { id: "lg", label: "Grande" },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => theme.setCoverSize?.(d.id)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between"
                style={{ background: (theme.coverSize || "md") === d.id ? "var(--surface2)" : "var(--surface)", border: (theme.coverSize || "md") === d.id ? "2px solid var(--accent)" : "1px solid var(--border)" }}
              >
                <span className="text-sm font-medium">{d.label}</span>
                {(theme.coverSize || "md") === d.id && <CheckCircle size={16} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
        </FullScreen>
      )}

      {open && view === "tabOrder" && (
        <FullScreen title="Barra inferior" onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Cambia el orden con las flechas. Las pestañas se muestran así.</p>
          <div className="space-y-2">
            {(theme.tabOrder || DEFAULT_TAB_ORDER).map((id, idx) => {
              const meta = TAB_META[id];
              if (!meta) return null;
              const Icon = meta.Icon;
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <Icon size={18} style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-medium flex-1">{t(meta.labelKey)}</span>
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...(theme.tabOrder || DEFAULT_TAB_ORDER)];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      theme.setTabOrder?.(next);
                    }}
                    className="p-1.5 rounded-lg disabled:opacity-30"
                    style={{ background: "var(--surface2)" }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    disabled={idx === (theme.tabOrder || DEFAULT_TAB_ORDER).length - 1}
                    onClick={() => {
                      const next = [...(theme.tabOrder || DEFAULT_TAB_ORDER)];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      theme.setTabOrder?.(next);
                    }}
                    className="p-1.5 rounded-lg disabled:opacity-30"
                    style={{ background: "var(--surface2)" }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <Btn variant="outline" className="w-full mt-4" onClick={() => theme.setTabOrder?.(DEFAULT_TAB_ORDER)}>Restablecer orden</Btn>
        </FullScreen>
      )}

      {open && view === "reader" && (
        <FullScreen title={titles.reader} icon={titleIcons.reader} onBack={back}>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Preferencias por defecto al abrir un capítulo.</p>
          <PrefRow label={t("vertical") + " / " + t("paged")}>
            <Chip active={theme.readerPrefs.mode === "vertical"} onClick={() => theme.setReaderPrefs({ mode: "vertical" })}>{t("vertical")}</Chip>
            <Chip active={theme.readerPrefs.mode === "paged"} onClick={() => theme.setReaderPrefs({ mode: "paged" })}>{t("paged")}</Chip>
          </PrefRow>
          <PrefRow label="RTL / LTR">
            <Chip active={theme.readerPrefs.direction === "ltr"} onClick={() => theme.setReaderPrefs({ direction: "ltr" })}>LTR</Chip>
            <Chip active={theme.readerPrefs.direction === "rtl"} onClick={() => theme.setReaderPrefs({ direction: "rtl" })}>RTL</Chip>
          </PrefRow>
          <PrefRow label={t("width") + " / " + t("height")}>
            <Chip active={theme.readerPrefs.fit === "width"} onClick={() => theme.setReaderPrefs({ fit: "width" })}>{t("width")}</Chip>
            <Chip active={theme.readerPrefs.fit === "height"} onClick={() => theme.setReaderPrefs({ fit: "height" })}>{t("height")}</Chip>
          </PrefRow>
          <PrefRow label={t("highQual") + " / " + t("saver")}>
            <Chip active={theme.readerPrefs.quality === "full"} onClick={() => theme.setReaderPrefs({ quality: "full" })}>{t("highQual")}</Chip>
            <Chip active={theme.readerPrefs.quality === "saver"} onClick={() => theme.setReaderPrefs({ quality: "saver" })}>{t("saver")}</Chip>
          </PrefRow>
          <PrefRow label={t("dark")}>
            <Toggle on={theme.readerPrefs.dark} onChange={(v) => theme.setReaderPrefs({ dark: v, sepia: v ? false : theme.readerPrefs.sepia })} />
          </PrefRow>
          <PrefRow label={t("sepia")}>
            <Toggle on={theme.readerPrefs.sepia} onChange={(v) => theme.setReaderPrefs({ sepia: v, dark: v ? false : theme.readerPrefs.dark })} />
          </PrefRow>
          <div className="px-4 py-3.5 rounded-xl mb-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("speed")} (auto-scroll)</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{theme.readerPrefs.scrollSpeed}</span>
            </div>
            <input
              type="range" min="5" max="90"
              value={theme.readerPrefs.scrollSpeed}
              onChange={e => theme.setReaderPrefs({ scrollSpeed: +e.target.value })}
              className="w-full"
            />
          </div>
        </FullScreen>
      )}

      {open && view === "language" && (
        <FullScreen title={titles.language} icon={titleIcons.language} onBack={back}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Globe size={15} /> {t("uiLanguage")}</p>
          <div className="space-y-2 mb-4">
            {LANGS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between"
                style={{ background: lang === l.id ? "var(--surface2)" : "var(--surface)", border: lang === l.id ? "2px solid var(--accent)" : "1px solid var(--border)", animation: `kv-fade-in 0.28s ease ${i * 40}ms both` }}
              >
                <span className="text-sm font-medium">{l.flag} {l.label}</span>
                {lang === l.id && <CheckCircle size={16} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>{t("interfaceLangNote")}</p>
        </FullScreen>
      )}

      {open && view === "notifications" && (
        <FullScreen title={titles.notifications} icon={titleIcons.notifications} onBack={back}>
          <PrefRow label="Actualizaciones de capítulos">
            <Toggle on={theme.notifPrefs.chapterUpdates} onChange={(v) => theme.setNotifPrefs({ chapterUpdates: v })} />
          </PrefRow>
          <PrefRow label="Novedades en favoritos">
            <Toggle on={theme.notifPrefs.favorites} onChange={(v) => theme.setNotifPrefs({ favorites: v })} />
          </PrefRow>
          <PrefRow label="Respuestas a comentarios">
            <Toggle on={theme.notifPrefs.comments} onChange={(v) => theme.setNotifPrefs({ comments: v })} />
          </PrefRow>
          <p className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>Las preferencias se guardan en este dispositivo. Las notificaciones push requieren un servidor externo.</p>
        </FullScreen>
      )}

      <Modal open={infoModal === "about"} onClose={() => setInfoModal(null)} title={t("about")}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{t("aboutText")}</p>
      </Modal>
      <Modal open={infoModal === "contact"} onClose={() => setInfoModal(null)} title={t("contact")}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{t("contactText")}</p>
      </Modal>
      <Modal open={infoModal === "report"} onClose={() => { setInfoModal(null); setReportText(""); }} title={t("reportProblem")}>
        <textarea value={reportText} onChange={e => setReportText(e.target.value)} rows={4} placeholder={t("reportPlaceholder")} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        <Btn className="w-full" onClick={sendReport} disabled={reportBusy}>{reportBusy ? t("sendingSuggestion") : t("sendReport")}</Btn>
      </Modal>

      <Modal open={infoModal === "suggestion"} onClose={() => { setInfoModal(null); resetSuggestion(); }} title={t("suggestion")}>
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>{t("suggestionTitleLabel")}</label>
        <input value={suggTitle} onChange={e => setSuggTitle(e.target.value)} placeholder={t("suggestionTitlePh")} className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />

        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>{t("suggestionDescLabel")}</label>
        <textarea value={suggDesc} onChange={e => setSuggDesc(e.target.value)} rows={3} placeholder={t("suggestionDescPh")} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />

        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>{t("suggestionHelpLabel")}</label>
        <textarea value={suggHelp} onChange={e => setSuggHelp(e.target.value)} rows={3} placeholder={t("suggestionHelpPh")} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />

        <Btn className="w-full" onClick={sendSuggestion} disabled={suggBusy}>{suggBusy ? t("sendingSuggestion") : t("sendSuggestion")}</Btn>
      </Modal>
    </>
  );
}

function BottomNav({ page, nav }) {
  const t = useT();
  const theme = useTheme();
  const order = theme.tabOrder || DEFAULT_TAB_ORDER;
  const items = order.map(k => {
    const meta = TAB_META[k];
    if (!meta) return null;
    const Icon = meta.Icon;
    return [k, <Icon size={20} key={k} />, t(meta.labelKey)];
  }).filter(Boolean);
  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 z-40" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
      {items.map(([k, icon, label]) => (
        <button key={k} onClick={() => nav(k)} className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-200" style={{ color: page === k ? "var(--accent)" : "var(--muted)" }}>
          {icon}<span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
function TopBar({ nav, auth, setAuthModal, canGoBack, goBack, onMenu }) {
  const t = useT();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1 min-w-0">
        <button onClick={onMenu} className="p-1 -ml-1 mr-0.5 shrink-0" style={{ color: "var(--text)" }} aria-label="Menu">
          <Menu size={22} />
        </button>
        {canGoBack && (
          <button onClick={goBack} className="p-1 shrink-0" style={{ color: "var(--text)" }} aria-label="Volver">
            <ChevronLeft size={22} />
          </button>
        )}
        <button onClick={() => nav("home")} className="font-black text-lg tracking-tight flex items-center gap-1.5 truncate">
          <span style={{ color: "var(--accent)" }}>Kōmi</span>Verso
        </button>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {APK_DOWNLOAD_URL ? (
          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold no-underline whitespace-nowrap max-w-[46vw] sm:max-w-none"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 0 0 1px var(--accent-border, transparent)",
            }}
            aria-label="Descarga el APK"
            title="Descarga el APK"
          >
            <Download size={14} strokeWidth={2.5} className="shrink-0" />
            <span>Descarga el APK</span>
          </a>
        ) : null}
        {auth.user ? (
          <button onClick={() => nav("profile")} className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold" style={{ background: "var(--surface2)" }}>
            {auth.user.avatar ? <img src={auth.user.avatar} className="w-full h-full object-cover" /> : (auth.user.username || "?")[0].toUpperCase()}
          </button>
        ) : (
          <Btn size="sm" onClick={() => setAuthModal("login")}>{t("enter")}</Btn>
        )}
      </div>
    </div>
  );
}

const TAB_PAGES = ["home", "search", "library", "calendar", "profile", "settings"];

function SubscriptionModal({ open, onClose, auth, setAuthModal }) {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open || !auth.user) return;
    (async () => {
      try { setEstado(await apiJson("/suscripcion/estado", { headers: await authHeaders() })); }
      catch { setEstado(null); }
    })();
  }, [open, auth.user]);

  const suscribirse = async () => {
    setErr(""); setLoading(true);
    try {
      const { url } = await apiJson("/suscripcion/checkout", { method: "POST", headers: await authHeaders() });
      if (url) window.location.href = url;
    } catch (e) { setErr(e.message || "No se pudo iniciar el pago"); }
    finally { setLoading(false); }
  };

  const cancelar = async () => {
    setErr(""); setLoading(true);
    try {
      await apiJson("/suscripcion/cancelar", { method: "POST", headers: await authHeaders() });
      setEstado(await apiJson("/suscripcion/estado", { headers: await authHeaders() }));
    } catch (e) { setErr(e.message || "No se pudo cancelar"); }
    finally { setLoading(false); }
  };

  const esFan = estado?.plan === "fan";

  return (
    <Modal open={open} onClose={onClose} title="✦ Suscripción">
      {!auth.user ? (
        <div className="text-center py-2">
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>Inicia sesión para suscribirte y quitar los anuncios.</p>
          <Btn onClick={() => { onClose(); setAuthModal("login"); }}>Iniciar sesión</Btn>
        </div>
      ) : (
        <div>
          {err && <p className="text-xs mb-3" style={{ color: "#f66" }}>{err}</p>}
          <div className="flex flex-col gap-3 mb-2">
            {PLANS.map((plan) => {
              const isFree = plan.id === "free";
              const current = (plan.id === "fan") === esFan;
              return (
                <div key={plan.id} className="rounded-xl p-4" style={{ background: "var(--surface2)", border: current ? "2px solid var(--accent)" : "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{plan.nombre}</span>
                    {current && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--accent)" }}>Tu plan actual</span>}
                  </div>
                  <p className="text-xl font-extrabold">{plan.precio} <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>{plan.periodo}</span></p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{plan.detalle}</p>
                  {!isFree && !current && (
                    <Btn disabled={loading} onClick={suscribirse} className="w-full mt-3">{loading ? "Cargando…" : "Suscribirme"}</Btn>
                  )}
                </div>
              );
            })}
          </div>
          {esFan && estado?.planRenewsAt && (
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Próxima renovación: {new Date(estado.planRenewsAt).toLocaleDateString()}</p>
          )}
          {esFan && (
            <Btn variant="outline" disabled={loading} onClick={cancelar} className="w-full">Cancelar suscripción</Btn>
          )}
        </div>
      )}
    </Modal>
  );
}

function SocialModal({ open, onClose }) {
  const item = (emoji, label, url) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-3 rounded-lg mb-2 text-sm font-medium" style={{ background: "var(--surface2)", color: "var(--text)" }}>
      <span className="text-lg">{emoji}</span>{label}
    </a>
  );
  return (
    <Modal open={open} onClose={onClose} title="Comunidad y apoyo">
      {item("🎮", "Únete a nuestro Discord", SOCIAL_LINKS.discord)}
      {item("🎵", "Síguenos en TikTok", SOCIAL_LINKS.tiktok)}
      {item("💜", "Apoya a KomiVerso con una donación voluntaria ♥", SOCIAL_LINKS.paypal)}
      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>Las donaciones son voluntarias y ayudan a mejorar la app y la web.</p>
    </Modal>
  );
}

const FAB_W = 52, FAB_H = 122;

function FloatingButtons({ onOpenSub, onOpenSocial }) {
  const [pos, setPos] = useState(null);
  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  useEffect(() => {
    (async () => {
      const saved = await sget("fabPos");
      const vw = window.innerWidth, vh = window.innerHeight;
      let x, y;
      if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
        x = Math.min(Math.max(saved.x, 4), vw - FAB_W - 4);
        y = Math.min(Math.max(saved.y, 4), vh - FAB_H - 4);
      } else {
        const colRight = Math.max(16, vw / 2 - 256 + 16);
        x = vw - colRight - FAB_W;
        y = vh - 88 - FAB_H;
      }
      setPos({ x, y });
    })();
  }, []);

  const onPointerDown = (e) => {
    if (!pos) return;
    dragRef.current = { dragging: true, moved: false, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    const vw = window.innerWidth, vh = window.innerHeight;
    setPos({ x: Math.min(Math.max(d.origX + dx, 4), vw - FAB_W - 4), y: Math.min(Math.max(d.origY + dy, 4), vh - FAB_H - 4) });
  };
  const onPointerUp = () => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    setPos((p) => { if (p) sset("fabPos", p); return p; });
  };
  const click = (fn) => () => { if (dragRef.current.moved) { dragRef.current.moved = false; return; } fn(); };

  if (!pos) return null;
  return (
    <div
      className="fixed flex flex-col gap-3 z-50 select-none"
      style={{ left: pos.x, top: pos.y, cursor: "grab", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <button onClick={click(onOpenSocial)} aria-label="Comunidad y apoyo" className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)" }}>
        <Heart size={19} />
      </button>
      <button onClick={click(onOpenSub)} aria-label="Suscripción" className="w-13 h-13 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform" style={{ width: 52, height: 52, background: "var(--accent)", color: "#fff" }}>
        <Sparkles size={22} />
      </button>
    </div>
  );
}

const PAGO_MENSAJES = {
  exito: { texto: "¡Listo! Ya eres Fan — gracias por tu apoyo ♥", color: "#2fbf71" },
  fallo: { texto: "El pago no se pudo procesar. Puedes intentarlo de nuevo cuando quieras.", color: "#e0555c" },
  cancelado: { texto: "Se canceló la suscripción. Seguirás sin anuncios hasta que termine el periodo ya pagado.", color: "var(--muted)" },
};

function PagoStatusBanner({ auth }) {
  const [pago, setPago] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const valor = params.get("pago");
    if (!valor || !PAGO_MENSAJES[valor]) return;

    setPago(valor);

    params.delete("pago");
    const resto = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (resto ? `?${resto}` : ""));

    if (valor === "exito" && auth?.refreshUser) {
      let intentos = 0;
      pollRef.current = setInterval(async () => {
        intentos += 1;
        const u = await auth.refreshUser();
        if ((u && u.plan === "fan") || intentos >= 6) clearInterval(pollRef.current);
      }, 3000);
    }

    return () => clearInterval(pollRef.current);
  }, []);

  if (!pago) return null;
  const info = PAGO_MENSAJES[pago];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-3 text-sm text-white"
      style={{ background: info.color }}
    >
      <span>{info.texto}</span>
      <button onClick={() => setPago(null)} className="shrink-0 opacity-80 hover:opacity-100" aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  );
}

function AppInner() {
  const [page, setPage] = useState("home");
  const [mangaId, setMangaId] = useState(null);
  const [readerTarget, setReaderTarget] = useState(null);
  const [searchParam, setSearchParam] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [visited, setVisited] = useState(() => new Set(["home"]));
  const [navStack, setNavStack] = useState([]);
  const auth = useAuth();
  const lib = useLibrary(auth.user?.email);
  const history = useHistory(auth.user?.email, auth);

  const markVisited = (p) => setVisited(v => (v.has(p) ? v : new Set(v).add(p)));

  const nav = (p, arg) => {
    const prevSnapshot = { page, mangaId, readerTarget, searchParam };

    let nextPage = p, nextMangaId = mangaId, nextReaderTarget = readerTarget, nextSearchParam = searchParam;
    if (p === "manga") { nextMangaId = arg; }
    else if (p === "reader") { nextReaderTarget = arg; }
    else if (p === "search") { nextSearchParam = arg || null; markVisited("search"); }
    else { markVisited(p); }

    const noop = prevSnapshot.page === nextPage
      && (nextPage !== "manga" || prevSnapshot.mangaId === nextMangaId)
      && (nextPage !== "reader" || prevSnapshot.readerTarget?.chapterId === nextReaderTarget?.chapterId);
    if (!noop) setNavStack(s => [...s.slice(-29), prevSnapshot]);

    setPage(nextPage); setMangaId(nextMangaId); setReaderTarget(nextReaderTarget); setSearchParam(nextSearchParam);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (navStack.length === 0) return;
    const prev = navStack[navStack.length - 1];
    setNavStack(s => s.slice(0, -1));
    setPage(prev.page); setMangaId(prev.mangaId); setReaderTarget(prev.readerTarget); setSearchParam(prev.searchParam);
    window.scrollTo(0, 0);
  };

  if (!auth.ready) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;

  const isReader = page === "reader";

  return (
    <div className="max-w-lg mx-auto min-h-screen relative" style={{ paddingBottom: isReader ? 0 : 64 }}>
      <PagoStatusBanner auth={auth} />
      {!isReader && <TopBar nav={nav} auth={auth} setAuthModal={setAuthModal} canGoBack={navStack.length > 0} goBack={goBack} onMenu={() => setMenuOpen(true)} />}
      <SideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} nav={nav} auth={auth} setAuthModal={setAuthModal} />

      {TAB_PAGES.filter(t => visited.has(t)).map(t => (
        <div key={t} className={page === t ? "kv-page-enter" : ""} style={{ display: page === t ? "block" : "none" }}>
          {t === "home" && <HomePage nav={nav} history={history} lib={lib} />}
          {t === "search" && <SearchPage nav={nav} initial={searchParam} />}
          {t === "library" && <LibraryPage lib={lib} history={history} nav={nav} auth={auth} setAuthModal={setAuthModal} />}
          {t === "calendar" && <CalendarPage nav={nav} lib={lib} />}
          {t === "profile" && <ProfilePage auth={auth} lib={lib} history={history} setAuthModal={setAuthModal} />}
          {t === "settings" && <SettingsPage />}
        </div>
      ))}

      {page === "manga" && <MangaPage id={mangaId} nav={nav} lib={lib} auth={auth} setAuthModal={setAuthModal} />}
      {page === "reader" && <ReaderPage key={readerTarget?.chapterId} target={readerTarget} nav={nav} history={history} auth={auth} goBack={navStack.length > 0 ? goBack : null} />}

      {!isReader && <BottomNav page={page} nav={nav} />}
      {!isReader && <FloatingButtons onOpenSub={() => setSubOpen(true)} onOpenSocial={() => setSocialOpen(true)} />}
      <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} auth={auth} setAuthModal={setAuthModal} />
      <SocialModal open={socialOpen} onClose={() => setSocialOpen(false)} />
      <AuthModals authModal={authModal} setAuthModal={setAuthModal} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
