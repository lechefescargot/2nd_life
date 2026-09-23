/* Deuxième Vie — application (Supabase + JavaScript, sans étape de build) */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

/* ---------- Constants ---------- */
const COMMUNES = ["Abobo","Adjamé","Anyama","Attécoubé","Bingerville","Cocody","Grand-Bassam","Koumassi","Marcory","Plateau","Port-Bouët","Songon","Treichville","Yopougon","Autre ville"];
const CONDITIONS = {neuf:"Neuf / jamais servi", tbe:"Très bon état", bon:"Bon état", use:"Usé mais fonctionnel"};
const STATUS = {disponible:"Disponible", reserve:"Réservé", parti:"Parti"};
const ICON = {
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.7 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.3 0 5.5 3.1 4.3 6.3C19.5 15.4 12 20 12 20Z"/></svg>',
  heartF:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.7 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.3 0 5.5 3.1 4.3 6.3C19.5 15.4 12 20 12 20Z"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/></svg>',
  ban:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m5 5 14 14"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.3L4 20Z"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/></svg>'
};
/* Category illustrations (drawn, used when no photo) */
const CATS = {
  fauteuil:{label:"Fauteuils & canapés", color:"#0A9396", svg:c=>`<svg viewBox="0 0 100 80"><rect x="10" y="30" width="80" height="30" rx="10" fill="${c}"/><rect x="20" y="14" width="60" height="28" rx="10" fill="${c}" opacity=".75"/><rect x="4" y="32" width="16" height="30" rx="7" fill="${c}"/><rect x="80" y="32" width="16" height="30" rx="7" fill="${c}"/><rect x="14" y="62" width="6" height="10" rx="2" fill="#17323A"/><rect x="80" y="62" width="6" height="10" rx="2" fill="#17323A"/></svg>`},
  lit:{label:"Lits", color:"#EF476F", svg:c=>`<svg viewBox="0 0 100 80"><rect x="8" y="14" width="10" height="56" rx="4" fill="#17323A"/><rect x="82" y="34" width="10" height="36" rx="4" fill="#17323A"/><rect x="14" y="40" width="74" height="18" rx="6" fill="${c}"/><rect x="20" y="30" width="22" height="12" rx="6" fill="#FFF" opacity=".9"/><rect x="40" y="34" width="46" height="10" rx="5" fill="${c}" opacity=".6"/></svg>`},
  matelas:{label:"Matelas", color:"#FFB319", svg:c=>`<svg viewBox="0 0 100 80"><rect x="8" y="30" width="84" height="28" rx="10" fill="${c}"/><path d="M8 40h84M8 48h84" stroke="#FFF" stroke-width="2" opacity=".6"/><circle cx="25" cy="44" r="2" fill="#17323A"/><circle cx="50" cy="44" r="2" fill="#17323A"/><circle cx="75" cy="44" r="2" fill="#17323A"/></svg>`},
  table:{label:"Tables & chaises", color:"#8D6E63", svg:c=>`<svg viewBox="0 0 100 80"><rect x="10" y="26" width="60" height="8" rx="3" fill="${c}"/><rect x="16" y="34" width="6" height="36" rx="2" fill="${c}"/><rect x="58" y="34" width="6" height="36" rx="2" fill="${c}"/><rect x="74" y="20" width="6" height="50" rx="2" fill="#0A9396"/><rect x="74" y="44" width="20" height="6" rx="2" fill="#0A9396"/><rect x="88" y="50" width="6" height="20" rx="2" fill="#0A9396"/></svg>`},
  rangement:{label:"Armoires & rangement", color:"#6A4C93", svg:c=>`<svg viewBox="0 0 100 80"><rect x="24" y="6" width="52" height="66" rx="5" fill="${c}"/><path d="M50 10v58" stroke="#FFF" stroke-width="2" opacity=".6"/><circle cx="45" cy="40" r="2.5" fill="#FFB319"/><circle cx="55" cy="40" r="2.5" fill="#FFB319"/></svg>`},
  electromenager:{label:"Électroménager", color:"#118AB2", svg:c=>`<svg viewBox="0 0 100 80"><rect x="30" y="4" width="40" height="72" rx="6" fill="${c}"/><path d="M30 30h40" stroke="#FFF" stroke-width="2.5"/><rect x="36" y="12" width="3" height="12" rx="1.5" fill="#FFF"/><rect x="36" y="36" width="3" height="14" rx="1.5" fill="#FFF"/></svg>`},
  electronique:{label:"TV & électronique", color:"#17323A", svg:c=>`<svg viewBox="0 0 100 80"><rect x="8" y="10" width="84" height="50" rx="6" fill="${c}"/><rect x="14" y="16" width="72" height="38" rx="3" fill="#2EC4B6"/><rect x="40" y="62" width="20" height="4" rx="2" fill="${c}"/><rect x="30" y="66" width="40" height="5" rx="2.5" fill="${c}"/></svg>`},
  deco:{label:"Déco & luminaires", color:"#FF7B54", svg:c=>`<svg viewBox="0 0 100 80"><path d="M34 8h32l10 26H24z" fill="${c}"/><rect x="47" y="34" width="6" height="30" fill="#17323A"/><rect x="34" y="64" width="32" height="8" rx="4" fill="#17323A"/></svg>`},
  autre:{label:"Autres", color:"#06A77D", svg:c=>`<svg viewBox="0 0 100 80"><path d="M20 26 50 12l30 14v30L50 70 20 56Z" fill="${c}"/><path d="m20 26 30 14 30-14M50 40v30" stroke="#FFF" stroke-width="2.5" fill="none" opacity=".7"/></svg>`}
};
const illu = cat => { const c = CATS[cat] || CATS.autre; return `<div class="illu" style="background:${c.color}22">${c.svg(c.color)}</div>`; };

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fmtPrice = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0)) + " FCFA";
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const ago = ts => {
  if (!ts) return "";
  if (typeof ts==="string") ts=Date.parse(ts);
  const s = Math.max(1,(Date.now()-ts)/1000);
  if (s<60) return "à l'instant"; const m=s/60; if (m<60) return `il y a ${Math.floor(m)} min`;
  const h=m/60; if (h<24) return `il y a ${Math.floor(h)} h`; const d=h/24; if (d<30) return `il y a ${Math.floor(d)} j`;
  return "le " + new Date(ts).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
};
const PALETTE = ["#0A9396","#EF476F","#FFB319","#118AB2","#6A4C93","#06A77D","#FF7B54"];
const colorFor = id => { let h=0; for (const ch of String(id)) h=(h*31+ch.charCodeAt(0))>>>0; return PALETTE[h%PALETTE.length]; };
const initials = n => (n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const telDigits = p => String(p||"").replace(/[^\d+]/g,"");
const waNumber = p => { let d = String(p||"").replace(/\D/g,""); if (d.length===10) d = "225"+d; return d; };
function toast(msg){ const h=$("#toastHost"); h.innerHTML=`<div class="toast" role="status">${esc(msg)}</div>`; clearTimeout(toast.t); toast.t=setTimeout(()=>h.innerHTML="",2600); }
const store = { get(k){try{return localStorage.getItem(k)}catch{return null}}, set(k,v){try{localStorage.setItem(k,v)}catch{}} };

/* ---------- Supabase ---------- */
const CONFIGURED = /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL) && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("VOTRE");
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const photoUrl = p => p ? sb.storage.from("photos").getPublicUrl(p).data.publicUrl : "";
const visitorId = (() => { let v = store.get("dv-visitor"); if (!v) { v = (crypto.randomUUID ? crypto.randomUUID() : newId() + newId()); store.set("dv-visitor", v); } return v; })();

/* ---------- State ---------- */
const TABS = ["explorer","mes-annonces","mes-interets","admin"];
const S = {
  loading: true, loadError: null, uid: null, email: "", profile: null,
  listings: [], sellers: {}, myInterests: new Map(), viewedNow: new Set(),
  tab: TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "explorer",
  q: "", cat: "all", type: "all", commune: store.get("dv-commune") || "all", showGone: false, sort: "recent"
};
const isSeller = () => !!S.profile && (S.profile.role === "vendeur" || S.profile.role === "les-deux");
const isAdmin = () => !!S.profile?.is_admin;
const findListing = id => S.listings.find(l => l.id === id);

/* ---------- Data ---------- */
async function loadListings() {
  const { data, error } = await sb.from("listings").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) { S.loadError = error.message; return; }
  S.loadError = null; S.listings = data || [];
  const ids = [...new Set(S.listings.map(l => l.seller_id))].filter(id => !S.sellers[id]);
  if (ids.length) {
    const { data: ps } = await sb.from("profiles_public").select("id,name,created_at").in("id", ids);
    (ps || []).forEach(p => S.sellers[p.id] = p);
  }
}
async function loadMyInterests() {
  S.myInterests = new Map();
  if (!S.uid) return;
  const { data } = await sb.from("interests").select("listing_id,created_at").eq("buyer_id", S.uid);
  (data || []).forEach(r => S.myInterests.set(r.listing_id, r.created_at));
}
async function loadProfile() {
  S.profile = null;
  if (!S.uid) return;
  const { data } = await sb.from("profiles").select("*").eq("id", S.uid).maybeSingle();
  S.profile = data || null;
}
async function applySession(session) {
  S.uid = session?.user?.id || null;
  S.email = session?.user?.email || "";
  await loadProfile();
  await Promise.all([loadMyInterests(), loadListings()]);
  S.loading = false;
  render();
  if (S.uid && !S.profile) openProfile();
}

/* ---------- Boot ---------- */
async function boot() {
  if (!sb) { renderSetup(); return; }
  render();
  const { data: { session } } = await sb.auth.getSession();
  await applySession(session);
  openFromHash();
  sb.auth.onAuthStateChange((event, session) => {
    // ne jamais appeler Supabase directement dans ce callback
    if (event === "PASSWORD_RECOVERY") { setTimeout(openNewPassword, 0); return; }
    const uid = session?.user?.id || null;
    if ((event === "SIGNED_IN" && uid !== S.uid) || event === "SIGNED_OUT") setTimeout(() => applySession(session), 0);
  });
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState !== "visible" || $("#ov")) return;
    await loadListings(); if (!document.activeElement?.matches("input,textarea,select")) render();
  });
}
function renderSetup() {
  $("#main").innerHTML = `<div class="setup"><div class="notice">${ICON.info}<div><b>Le site n'est pas encore relié à Supabase.</b><br>
  Ouvrez <code>config.js</code> et collez l'URL et la clé « anon public » de votre projet Supabase (Project Settings → API). Voir le README.</div></div></div>`;
}
function openFromHash() {
  const m = location.hash.match(/^#annonce-([0-9a-f-]{36})$/i);
  if (m && findListing(m[1])) openDetail(m[1]);
}
async function reload() { await Promise.all([loadListings(), loadMyInterests()]); render(); }

/* ---------- Header ---------- */
function renderHeader() {
  const p = S.profile;
  const acct = $("#btnAccount"), av = $("#btnAvatar");
  if (p) { acct.hidden = true; av.hidden = false; av.textContent = initials(p.name); av.style.background = colorFor(S.uid); }
  else { av.hidden = true; acct.hidden = false; acct.textContent = S.uid ? "Compléter mon profil" : "Se connecter"; }
  $("#btnPublishTop").hidden = !isSeller();
  $("#fab").hidden = !isSeller();
  const mine = S.listings.filter(l => l.seller_id === S.uid).length;
  const tabs = [["explorer", "Explorer", ICON.grid, 0]];
  if (isSeller()) tabs.push(["mes-annonces", "Mes annonces", ICON.box, mine]);
  if (p) tabs.push(["mes-interets", "Mes coups de cœur", ICON.heart, S.myInterests.size]);
  if (isAdmin()) tabs.push(["admin", "Administration", ICON.shield, 0]);
  if (!S.loading && !tabs.some(t => t[0] === S.tab)) S.tab = "explorer";
  $("#tabs").innerHTML = tabs.map(([k, l, ic, n]) => `<button class="tab" role="tab" aria-selected="${S.tab === k}" data-tab="${k}">${ic}${l}${n ? `<span class="count">${n}</span>` : ""}</button>`).join("");
}
function setTab(t) { S.tab = t; try { history.replaceState(null, "", "#" + t); } catch {} render(); window.scrollTo({ top: 0 }); }
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) setTab(b.dataset.tab); });
$("#logo").addEventListener("click", e => { e.preventDefault(); setTab("explorer"); });
$("#btnAccount").addEventListener("click", () => S.uid ? openProfile() : openAuth("login"));
$("#btnPublishTop").addEventListener("click", () => openListingForm());
$("#fab").addEventListener("click", () => openListingForm());
$("#btnAvatar").addEventListener("click", e => {
  e.stopPropagation();
  const host = $("#menuHost"); if (host.innerHTML) { host.innerHTML = ""; return; }
  const p = S.profile; const roleL = { vendeur: "Vendeur / Offrant", acheteur: "Acheteur", "les-deux": "Vendeur & acheteur" }[p.role];
  host.innerHTML = `<div class="menu" role="menu"><div class="who"><b>${esc(p.name)}</b><div class="small muted">${esc(S.email)}</div><div class="row" style="margin-top:6px"><span class="role-tag">${roleL}</span>${isAdmin() ? '<span class="role-tag admin">Admin</span>' : ""}</div></div>
   <button data-m="profile">Modifier mon profil</button>${isSeller() ? '<button data-m="publish">Publier un article</button>' : ""}
   <button data-m="theme">Changer de thème</button><button data-m="logout" style="color:var(--hibiscus)">Se déconnecter</button></div>`;
});
document.addEventListener("click", async e => {
  const m = e.target.closest("[data-m]"); const host = $("#menuHost");
  if (m) {
    host.innerHTML = "";
    const k = m.dataset.m;
    if (k === "profile") openProfile();
    if (k === "publish") openListingForm();
    if (k === "theme") { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; r.dataset.theme = dark ? "light" : "dark"; store.set("dv-theme", r.dataset.theme); }
    if (k === "logout") { await sb.auth.signOut(); toast("Vous êtes déconnecté"); }
    return;
  }
  if (!e.target.closest(".menu")) host.innerHTML = "";
});
{ const t = store.get("dv-theme"); if (t) document.documentElement.dataset.theme = t; }

/* ---------- Main render ---------- */
function render() {
  if (!sb) return;
  renderHeader();
  const main = $("#main");
  if (S.loadError) { main.innerHTML = `<div style="padding-block:40px"><div class="notice">${ICON.info}<div><b>Impossible de charger les annonces.</b><br>${esc(S.loadError)}<br><button class="btn sm primary" style="margin-top:8px" id="retry">Réessayer</button></div></div></div>`; $("#retry").onclick = reload; return; }
  if (S.tab === "explorer") renderExplore(main);
  else if (S.tab === "mes-annonces") renderMine(main);
  else if (S.tab === "mes-interets") renderInterests(main);
  else if (S.tab === "admin") renderAdmin(main);
}

function filtered() {
  const q = S.q.trim().toLowerCase();
  let list = S.listings.filter(l => !l.hidden);
  if (!S.showGone) list = list.filter(l => l.status !== "parti");
  if (S.cat !== "all") list = list.filter(l => l.category === S.cat);
  if (S.type !== "all") list = list.filter(l => l.type === S.type);
  if (S.commune !== "all") list = list.filter(l => l.commune === S.commune);
  if (q) list = list.filter(l => (l.title + " " + l.description + " " + l.quartier + " " + (CATS[l.category]?.label || "")).toLowerCase().includes(q));
  const rank = { disponible: 0, reserve: 1, parti: 2 };
  if (S.sort === "recent") list.sort((a, b) => (rank[a.status] - rank[b.status]) || (Date.parse(b.created_at) - Date.parse(a.created_at)));
  if (S.sort === "prix") list.sort((a, b) => (a.type === "don" ? 0 : a.price) - (b.type === "don" ? 0 : b.price));
  if (S.sort === "vues") list.sort((a, b) => b.view_count - a.view_count);
  return list;
}

function renderExplore(main) {
  const counts = {}; S.listings.filter(l => !l.hidden && l.status !== "parti").forEach(l => counts[l.category] = (counts[l.category] || 0) + 1);
  const guestBanner = !S.profile && !S.loading ? `<div class="notice">${ICON.info}<div>${S.uid
      ? `<b>Votre profil n'est pas terminé.</b> <button class="linkbtn" data-act="profile">Compléter mon profil</button> pour voir les numéros et publier.`
      : `<b>Vous êtes en mode invité.</b> Vous pouvez tout parcourir. <button class="linkbtn" data-act="signup">Créez votre compte</button> ou <button class="linkbtn" data-act="login">connectez-vous</button> pour voir les numéros, signaler votre intérêt ou publier vos articles.`}</div></div>` : "";
  main.innerHTML = `
  <section class="hero">
    <h1>Ce qui dort chez vous peut <em>revivre</em> ailleurs.</h1>
    <p class="lead">Fauteuils, lits, matelas, tables… Publiez en deux minutes, vendez ou donnez, et laissez les acheteurs vous appeler directement.</p>
    <div class="search">${ICON.search}<input id="q" type="search" placeholder="Rechercher un matelas, un canapé…" value="${esc(S.q)}" aria-label="Rechercher">
      <select id="commune" aria-label="Commune"><option value="all">Toutes les communes</option>${COMMUNES.map(c => `<option ${S.commune === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
    ${guestBanner}
  </section>
  <div class="chips" id="cats">
    <button class="chip" aria-pressed="${S.cat === "all"}" data-cat="all"><span class="ic">${ICON.grid}</span>Tout</button>
    ${Object.entries(CATS).map(([k, c]) => `<button class="chip" aria-pressed="${S.cat === k}" data-cat="${k}"><span class="ic" style="background:${c.color}22">${c.svg(c.color)}</span>${c.label}${counts[k] ? ` <span class="muted">${counts[k]}</span>` : ""}</button>`).join("")}
  </div>
  <div class="filters">
    <div class="seg" id="types">${[["all", "Tout"], ["vente", "À vendre"], ["don", "Gratuit"]].map(([k, l]) => `<button aria-pressed="${S.type === k}" data-type="${k}">${l}</button>`).join("")}</div>
    <div class="row" style="align-items:center;gap:12px">
      <label class="check"><input type="checkbox" id="showGone" ${S.showGone ? "checked" : ""}> Afficher les articles partis</label>
      <select class="in" id="sort" style="width:auto;padding:7px 10px;font-size:13px" aria-label="Trier"><option value="recent" ${S.sort === "recent" ? "selected" : ""}>Plus récents</option><option value="prix" ${S.sort === "prix" ? "selected" : ""}>Prix croissant</option><option value="vues" ${S.sort === "vues" ? "selected" : ""}>Plus vus</option></select>
    </div>
  </div>
  <div class="grid" id="grid">${gridHTML()}</div>`;
  const qi = $("#q"); qi.addEventListener("input", () => { S.q = qi.value; $("#grid").innerHTML = gridHTML(); });
  $("#commune").addEventListener("change", e => { S.commune = e.target.value; store.set("dv-commune", S.commune); $("#grid").innerHTML = gridHTML(); });
  $("#cats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; S.cat = b.dataset.cat; render(); });
  $("#types").addEventListener("click", e => { const b = e.target.closest("[data-type]"); if (!b) return; S.type = b.dataset.type; render(); });
  $("#showGone").addEventListener("change", e => { S.showGone = e.target.checked; render(); });
  $("#sort").addEventListener("change", e => { S.sort = e.target.value; render(); });
}

function gridHTML() {
  if (S.loading) return Array.from({ length: 8 }, () => `<div class="skeleton"></div>`).join("");
  const list = filtered();
  if (!list.length) {
    const none = !S.listings.length;
    return `<div class="empty">${CATS.fauteuil.svg("var(--teal)")}<h3>${none ? "Aucun article pour l'instant" : "Rien ne correspond"}</h3><p>${none ? "Soyez le premier à donner une deuxième vie à un objet." : "Essayez une autre catégorie ou une autre commune."}</p>${none && isSeller() ? `<button class="btn sun" data-act="publish">Publier un article</button>` : ""}</div>`;
  }
  return list.map(cardHTML).join("");
}
function phBox(l) {
  const src = photoUrl(l.thumb || l.photos?.[0]);
  return src ? `<img src="${esc(src)}" alt="" loading="lazy">` : illu(l.category);
}
function cardHTML(l) {
  return `<button class="card ${l.status === "parti" ? "is-gone" : ""}" data-open="${l.id}">
    <div class="ph">${phBox(l)}${l.type === "don" ? `<span class="badge-free">Gratuit</span>` : ""}</div>
    <div class="body">
      <div class="row" style="justify-content:space-between;align-items:center;gap:6px"><span class="price">${l.type === "don" ? "À donner" : fmtPrice(l.price)}</span><span class="pill ${l.status}">${STATUS[l.status]}</span></div>
      <div class="title">${esc(l.title)}</div>
      <div class="meta"><span class="loc">${ICON.pin}${esc(l.commune)}${l.quartier ? ", " + esc(l.quartier) : ""}</span><span title="${l.view_count} personne(s) ont regardé">${ICON.eye}${l.view_count}</span></div>
    </div></button>`;
}

/* ---------- Global action delegation ---------- */
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]"); if (o) { openDetail(o.dataset.open); return; }
  const a = e.target.closest("[data-act]"); if (!a) return;
  const act = a.dataset.act, k = a.dataset.key;
  if (act === "login") openAuth("login");
  if (act === "signup") openAuth("signup");
  if (act === "profile") openProfile();
  if (act === "publish") openListingForm();
  if (act === "edit") openListingForm(k);
  if (act === "status") patchListing(k, { status: a.dataset.v, ...(a.dataset.v === "disponible" ? { confirmed_at: new Date().toISOString() } : {}) }, "Statut : " + STATUS[a.dataset.v]);
  if (act === "confirm") patchListing(k, { status: "disponible", confirmed_at: new Date().toISOString() }, "Disponibilité confirmée");
  if (act === "hide") { const l = findListing(k); patchListing(k, { hidden: !l.hidden }, l.hidden ? "Annonce de nouveau visible" : "Annonce masquée du catalogue"); }
  if (act === "delete") askDelete(k);
  if (act === "uninterest") toggleInterest(k, false);
  if (act === "mkadmin") setAdmin(k, a.dataset.v === "1");
});

/* ---------- Modal ---------- */
let modalHash = null;
function modal(html, cls = "") {
  const host = $("#modalHost");
  host.innerHTML = `<div class="overlay" id="ov"><div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;
  const ov = $("#ov");
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) closeModal(); });
  document.body.style.overflow = "hidden";
  setTimeout(() => { const f = ov.querySelector("input:not([type=radio]):not([type=file]),select,textarea"); f && f.focus({ preventScroll: true }); }, 30);
  return ov;
}
function closeModal() {
  $("#modalHost").innerHTML = ""; document.body.style.overflow = "";
  if (modalHash) { try { history.replaceState(null, "", "#" + S.tab); } catch {} modalHash = null; }
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#ov")) closeModal(); });
const head = t => `<div class="sheet-h"><h2>${t}</h2><button class="x" data-close aria-label="Fermer">${ICON.x}</button></div>`;

/* ---------- Auth ---------- */
const authErr = m => {
  m = String(m || "");
  if (/invalid login/i.test(m)) return "Email ou mot de passe incorrect.";
  if (/already registered|already exists/i.test(m)) return "Un compte existe déjà avec cet email. Connectez-vous.";
  if (/not confirmed/i.test(m)) return "Confirmez d'abord votre email grâce au lien reçu, puis reconnectez-vous.";
  if (/password.*(6|short|weak)/i.test(m)) return "Mot de passe trop court : 6 caractères minimum.";
  if (/rate limit|too many/i.test(m)) return "Trop de tentatives. Patientez quelques minutes puis réessayez.";
  return "Une erreur est survenue : " + m;
};
function openAuth(mode = "login") {
  const login = mode === "login";
  const ov = modal(head(login ? "Se connecter" : "Créer mon compte") + `<div class="sheet-b">
    <div class="seg" style="justify-self:start"><button type="button" data-mode="login" aria-pressed="${login}">Connexion</button><button type="button" data-mode="signup" aria-pressed="${!login}">Inscription</button></div>
    ${login ? "" : `<p class="muted" style="margin:0">Un compte gratuit permet de voir les numéros des vendeurs, de signaler votre intérêt et de publier vos articles.</p>`}
    <form class="f" id="af">
      <div class="fld"><label for="a-email">Email</label><input class="in" id="a-email" type="email" required autocomplete="email" placeholder="vous@exemple.com"></div>
      <div class="fld"><label for="a-pass">Mot de passe</label><input class="in" id="a-pass" type="password" required minlength="6" autocomplete="${login ? "current-password" : "new-password"}">${login ? "" : '<span class="hint">6 caractères minimum.</span>'}</div>
      <div class="err" id="a-err" hidden></div><div class="ok-msg" id="a-ok" hidden></div>
      <button class="btn primary block" id="a-go">${login ? "Se connecter" : "Créer mon compte"}</button>
      ${login ? '<button type="button" class="linkbtn" id="a-forgot" style="justify-self:center">Mot de passe oublié ?</button>' : ""}
    </form></div>`, "narrow");
  ov.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => openAuth(b.dataset.mode)));
  const err = $("#a-err"), ok = $("#a-ok"), btn = $("#a-go");
  const show = (el, t) => { err.hidden = ok.hidden = true; el.hidden = false; el.textContent = t; };
  $("#af").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("#a-email").value.trim(), password = $("#a-pass").value;
    btn.disabled = true; btn.textContent = "Patientez…";
    if (login) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { show(err, authErr(error.message)); btn.disabled = false; btn.textContent = "Se connecter"; return; }
      closeModal(); toast("Bon retour parmi nous !");
    } else {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
      if (error) { show(err, authErr(error.message)); btn.disabled = false; btn.textContent = "Créer mon compte"; return; }
      if (!data.session) { show(ok, "Presque fini ! Ouvrez l'email de confirmation envoyé à " + email + " puis revenez ici."); btn.textContent = "Email envoyé"; return; }
      closeModal();
    }
  });
  const fg = $("#a-forgot");
  if (fg) fg.addEventListener("click", async () => {
    const email = $("#a-email").value.trim();
    if (!email) { show(err, "Saisissez d'abord votre email, puis touchez « Mot de passe oublié »."); return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    error ? show(err, authErr(error.message)) : show(ok, "Un lien pour choisir un nouveau mot de passe a été envoyé à " + email + ".");
  });
}
function openNewPassword() {
  const ov = modal(head("Nouveau mot de passe") + `<div class="sheet-b"><form class="f" id="npf">
    <div class="fld"><label for="np">Nouveau mot de passe</label><input class="in" id="np" type="password" minlength="6" required autocomplete="new-password"></div>
    <div class="err" id="np-err" hidden></div><button class="btn primary block">Enregistrer</button></form></div>`, "narrow");
  ov.querySelector("#npf").addEventListener("submit", async e => {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password: $("#np").value });
    if (error) { const x = $("#np-err"); x.hidden = false; x.textContent = authErr(error.message); return; }
    closeModal(); toast("Mot de passe mis à jour");
  });
}

/* ---------- Profile ---------- */
function openProfile() {
  if (!S.uid) { openAuth("signup"); return; }
  const p = S.profile || {};
  const role = p.role || "les-deux";
  const ov = modal(head(S.profile ? "Mon profil" : "Complétez votre profil") + `<div class="sheet-b">
   ${S.profile ? "" : `<p class="muted" style="margin:0">Dernière étape : dites-nous qui vous êtes et comment vous joindre.</p>`}
   <form class="f" id="pf">
    <div class="fld"><span class="lbl">Je suis…</span><div class="choice">
      <label><input type="radio" name="role" value="vendeur" ${role === "vendeur" ? "checked" : ""}><b>Vendeur / Offrant</b><span>Je vends ou je donne des objets</span></label>
      <label><input type="radio" name="role" value="acheteur" ${role === "acheteur" ? "checked" : ""}><b>Acheteur</b><span>Je cherche de bonnes affaires</span></label>
      <label><input type="radio" name="role" value="les-deux" ${role === "les-deux" ? "checked" : ""}><b>Les deux</b><span>Je vends et j'achète</span></label>
    </div></div>
    <div class="fld"><label for="p-name">Nom affiché</label><input class="in" id="p-name" required minlength="2" maxlength="40" value="${esc(p.name || "")}" placeholder="ex. Chrislain A."></div>
    <div class="two">
      <div class="fld"><label for="p-phone">Téléphone</label><input class="in" id="p-phone" required inputmode="tel" maxlength="20" value="${esc(p.phone || "")}" placeholder="07 00 00 00 00"><span class="hint">Visible par les membres connectés qui consultent vos articles.</span></div>
      <div class="fld"><label for="p-commune">Ma commune</label><select class="in" id="p-commune">${COMMUNES.map(c => `<option ${(p.commune || "Cocody") === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
    </div>
    <label class="check"><input type="checkbox" id="p-wa" ${p.whatsapp !== false ? "checked" : ""}> Joignable aussi sur WhatsApp</label>
    <div class="err" id="p-err" hidden></div>
    <button class="btn primary block" id="p-save">${S.profile ? "Enregistrer" : "Terminer mon inscription"}</button>
   </form></div>`, "narrow");
  ov.querySelector("#pf").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#p-name").value.trim(), phone = $("#p-phone").value.trim(), err = $("#p-err");
    if (telDigits(phone).replace("+", "").length < 8) { err.hidden = false; err.textContent = "Entrez un numéro de téléphone complet (au moins 8 chiffres)."; return; }
    const body = { id: S.uid, name, phone, whatsapp: $("#p-wa").checked, commune: $("#p-commune").value, role: ov.querySelector("input[name=role]:checked").value };
    const btn = $("#p-save"); btn.disabled = true; btn.textContent = "Enregistrement…";
    const { data, error } = await sb.from("profiles").upsert(body).select().single();
    if (error) { btn.disabled = false; btn.textContent = "Réessayer"; err.hidden = false; err.textContent = "L'enregistrement a échoué : " + error.message; return; }
    const first = !S.profile; S.profile = data; S.sellers[S.uid] = { id: S.uid, name: data.name, created_at: data.created_at };
    closeModal(); toast(first ? "Bienvenue " + name + " !" : "Profil enregistré"); render();
  });
}

/* ---------- Detail ---------- */
async function openDetail(id) {
  const l = findListing(id); if (!l) return;
  const seller = S.sellers[l.seller_id] || { name: "Membre" };
  const mine = l.seller_id === S.uid;
  const liked = S.myInterests.has(id);
  const avIcon = { disponible: ICON.check, reserve: ICON.clock, parti: ICON.ban }[l.status];
  const avText = { disponible: "Toujours disponible", reserve: "Réservé — une personne est déjà en discussion", parti: (l.type === "don" ? "Déjà donné" : "Déjà vendu") }[l.status];
  const mapQ = encodeURIComponent([l.landmark, l.quartier, l.commune, "Côte d'Ivoire"].filter(Boolean).join(", "));
  const contactBlock = mine ? `<div class="notice">${ICON.info}<div>C'est votre annonce. Gérez-la depuis <b>Mes annonces</b>.</div></div>`
    : !S.uid ? `<div class="phone-box"><b>Intéressé ?</b><span class="muted small">Créez votre compte gratuit (ou connectez-vous) pour voir le numéro du vendeur et l'appeler.</span><div class="row"><button class="btn primary sm" data-act="signup">Créer mon compte</button><button class="btn sm" data-act="login">Se connecter</button></div></div>`
    : !S.profile ? `<div class="phone-box"><b>Encore une étape</b><span class="muted small">Complétez votre profil pour voir le numéro du vendeur.</span><button class="btn primary sm" data-act="profile">Compléter mon profil</button></div>`
    : `<div class="phone-box" id="contact"><span class="muted small" style="font-weight:700">Chargement du numéro…</span></div>`;
  const ov = modal(head(esc(l.title)) + `<div class="sheet-b"><div class="detail">
    <div class="gallery"><div class="main" id="gmain">${l.photos?.length ? `<img src="${esc(photoUrl(l.photos[0]))}" alt="${esc(l.title)}">` : illu(l.category)}${l.type === "don" ? `<span class="badge-free">Gratuit</span>` : ""}</div>
      ${l.photos?.length > 1 ? `<div class="thumbs" id="gthumbs">${l.photos.map((p, i) => `<button aria-label="Photo ${i + 1}" aria-current="${i === 0}"><img src="${esc(photoUrl(p))}" alt=""></button>`).join("")}</div>` : ""}</div>
    <div style="display:grid;gap:14px">
      <div class="d-price">${l.type === "don" ? `<span class="free">Gratuit — à donner</span>` : fmtPrice(l.price)}${l.type === "vente" && l.negotiable ? ` <span class="small muted" style="font-family:var(--body);font-weight:700">à débattre</span>` : ""}</div>
      <div class="avail ${l.status}">${avIcon}<div>${avText}<small>${l.status === "disponible" ? "Confirmé par le vendeur " + ago(l.confirmed_at) : "Mis à jour " + ago(l.updated_at)}</small></div></div>
      <div class="stats-inline"><span>${ICON.eye}<b id="vc">${l.view_count}</b>&nbsp;vue${l.view_count > 1 ? "s" : ""}</span><span>${ICON.heart}${l.interest_count} intéressé${l.interest_count > 1 ? "s" : ""}</span><span>${ICON.clock}Publié ${ago(l.created_at)}</span></div>
      ${contactBlock}
      ${!mine && S.profile && l.status !== "parti" ? `<button class="btn ${liked ? "pink" : ""}" id="likeBtn">${liked ? ICON.heartF + "Vous êtes intéressé — retirer" : ICON.heart + "Je suis intéressé"}</button>` : ""}
      <button class="btn ghost sm" id="shareBtn" style="justify-self:start">${ICON.copy}Copier le lien de l'annonce</button>
    </div></div>
    <dl class="facts">
      <dt>Catégorie</dt><dd>${esc(CATS[l.category]?.label || "Autre")}</dd>
      <dt>État</dt><dd>${esc(CONDITIONS[l.condition] || "—")}</dd>
      <dt>Position</dt><dd>${esc(l.commune)}${l.quartier ? ", " + esc(l.quartier) : ""}${l.landmark ? `<br><span class="muted">${esc(l.landmark)}</span>` : ""}<br><a class="small" style="color:var(--teal);font-weight:800" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQ}">Voir le secteur sur la carte</a></dd>
    </dl>
    ${l.description ? `<div><h3 style="font-size:18px;margin-bottom:6px">Description</h3><p class="desc">${esc(l.description)}</p></div>` : ""}
    <div class="seller"><span class="avatar" style="background:${colorFor(l.seller_id)}">${esc(initials(seller.name))}</span><div class="who"><b>${esc(seller.name)}</b><span class="small muted">Membre ${ago(seller.created_at)} · ${S.listings.filter(x => x.seller_id === l.seller_id && !x.hidden).length} annonce(s)</span></div></div>
  </div>`);
  modalHash = "annonce-" + id; try { history.replaceState(null, "", "#" + modalHash); } catch {}
  const th = ov.querySelector("#gthumbs");
  if (th) th.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const i = [...th.children].indexOf(b); ov.querySelector("#gmain img").src = photoUrl(l.photos[i]); th.querySelectorAll("button").forEach((x, j) => x.setAttribute("aria-current", j === i)); });
  ov.querySelector("#shareBtn").addEventListener("click", () => copyText(location.origin + location.pathname + "#annonce-" + id, "Lien copié — partagez-le !"));
  const lb = ov.querySelector("#likeBtn"); if (lb) lb.addEventListener("click", async () => { lb.disabled = true; await toggleInterest(id, !liked); openDetail(id); });
  recordView(l);
  const box = ov.querySelector("#contact");
  if (box) {
    const { data: s } = await sb.from("profiles").select("name,phone,whatsapp").eq("id", l.seller_id).maybeSingle();
    if (!$("#ov")) return;
    if (!s) { box.innerHTML = `<span class="muted small">Le vendeur n'a pas encore renseigné de numéro.</span>`; return; }
    box.innerHTML = `<span class="muted small" style="font-weight:700">Appelez ${esc(s.name)} pour vérifier la disponibilité</span>
      <div class="phone-num" id="pn">${esc(s.phone)}</div>
      <div class="row"><a class="btn primary sm" href="tel:${esc(telDigits(s.phone))}">${ICON.phone}Appeler</a><button class="btn sm" id="cp">${ICON.copy}Copier</button>
      ${s.whatsapp ? `<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${waNumber(s.phone)}?text=${encodeURIComponent("Bonjour, votre article « " + l.title + " » sur Deuxième Vie est-il toujours disponible ?")}">${ICON.chat}WhatsApp</a>` : ""}</div>`;
    box.querySelector("#cp").addEventListener("click", () => copyText(s.phone, "Numéro copié"));
  }
}
function copyText(t, msg) {
  (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => toast(msg), () => toast(t));
}
async function recordView(l) {
  if (l.seller_id === S.uid || S.viewedNow.has(l.id)) return;
  S.viewedNow.add(l.id);
  const { data } = await sb.rpc("record_view", { p_listing: l.id, p_visitor: visitorId });
  if (data === true) { l.view_count++; const vc = $("#vc"); if (vc) vc.textContent = l.view_count; }
}
async function toggleInterest(id, on) {
  if (!S.profile) { S.uid ? openProfile() : openAuth("signup"); return; }
  const l = findListing(id);
  const { error } = on
    ? await sb.from("interests").insert({ listing_id: id, buyer_id: S.uid })
    : await sb.from("interests").delete().eq("listing_id", id).eq("buyer_id", S.uid);
  if (error && !/duplicate/i.test(error.message)) { toast("Action impossible pour le moment"); return; }
  if (on) { S.myInterests.set(id, new Date().toISOString()); if (l) l.interest_count++; toast("Le vendeur voit que vous êtes intéressé. Appelez-le !"); }
  else { S.myInterests.delete(id); if (l) l.interest_count = Math.max(0, l.interest_count - 1); toast("Retiré de vos coups de cœur"); }
  if (!$("#ov")) render(); else renderHeader();
}

/* ---------- Listing form ---------- */
function openListingForm(id) {
  if (!S.uid) { openAuth("signup"); return; }
  if (!S.profile) { openProfile(); return; }
  const l = id ? findListing(id) : null;
  if (!l && !isSeller()) { toast("Passez votre profil en « Vendeur » pour publier"); openProfile(); return; }
  const d = l || { type: "vente", category: "fauteuil", condition: "bon", commune: S.profile.commune || "Cocody", status: "disponible", negotiable: true };
  let files = [], noPhotoOk = false;
  const ov = modal(head(l ? "Modifier l'annonce" : "Publier un article") + `<div class="sheet-b"><form class="f" id="lf">
    <div class="fld"><span class="lbl">Photos <span class="muted">(jusqu'à 4, la première sert de couverture)</span></span>
      <label class="drop" id="drop" for="l-files">${ICON.camera}<b>Ajouter des photos</b><span class="small muted">Touchez pour choisir ou prendre une photo${l && l.photos?.length ? " — laissez vide pour garder les photos actuelles" : ""}</span></label>
      <input type="file" id="l-files" accept="image/*" multiple hidden>
      <div class="previews" id="prev">${l ? (l.photos || []).map((p, i) => `<div><img src="${esc(photoUrl(p))}" alt="">${i === 0 ? "<span>Couverture</span>" : ""}</div>`).join("") : ""}</div></div>
    <div class="fld"><span class="lbl">Je veux…</span><div class="choice">
      <label><input type="radio" name="type" value="vente" ${d.type === "vente" ? "checked" : ""}><b>Vendre</b><span>Je fixe un prix</span></label>
      <label><input type="radio" name="type" value="don" ${d.type === "don" ? "checked" : ""}><b>Donner / Céder</b><span>Gratuit pour qui vient le chercher</span></label>
    </div></div>
    <div class="fld"><label for="l-title">Titre</label><input class="in" id="l-title" required minlength="3" maxlength="70" value="${esc(d.title || "")}" placeholder="ex. Fauteuil en cuir marron, 1 place"></div>
    <div class="two">
      <div class="fld"><label for="l-cat">Catégorie</label><select class="in" id="l-cat">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${d.category === k ? "selected" : ""}>${c.label}</option>`).join("")}</select></div>
      <div class="fld"><label for="l-cond">État</label><select class="in" id="l-cond">${Object.entries(CONDITIONS).map(([k, c]) => `<option value="${k}" ${d.condition === k ? "selected" : ""}>${c}</option>`).join("")}</select></div>
    </div>
    <div class="two" id="priceRow">
      <div class="fld"><label for="l-price">Prix (FCFA)</label><input class="in" id="l-price" inputmode="numeric" value="${d.price || ""}" placeholder="ex. 45000"></div>
      <div class="fld" style="align-content:end"><label class="check" style="padding-bottom:12px"><input type="checkbox" id="l-neg" ${d.negotiable ? "checked" : ""}> Prix à débattre</label></div>
    </div>
    <div class="fld"><label for="l-desc">Description</label><textarea class="in" id="l-desc" maxlength="1200" placeholder="Dimensions, ancienneté, défauts éventuels, conditions de retrait…">${esc(d.description || "")}</textarea></div>
    <div class="fld"><span class="lbl">Ma position</span>
      <div class="two"><select class="in" id="l-commune" aria-label="Commune">${COMMUNES.map(c => `<option ${d.commune === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      <input class="in" id="l-quartier" maxlength="40" value="${esc(d.quartier || "")}" placeholder="Quartier (ex. Riviera 3)" aria-label="Quartier"></div>
      <input class="in" id="l-landmark" maxlength="80" value="${esc(d.landmark || "")}" placeholder="Repère (ex. derrière la pharmacie des Allées)" aria-label="Point de repère">
      <span class="hint">Indiquez un repère, pas votre adresse exacte : vous la donnerez au téléphone.</span></div>
    ${l ? `<div class="fld"><label for="l-status">Disponibilité</label><select class="in" id="l-status">${Object.entries(STATUS).map(([k, s]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${s}</option>`).join("")}</select></div>` : ""}
    <div class="err" id="l-err" hidden></div>
    <button class="btn sun block" id="l-save">${l ? "Enregistrer les modifications" : "Publier mon article"}</button>
  </form></div>`);
  const syncType = () => { $("#priceRow").hidden = ov.querySelector("input[name=type]:checked").value === "don"; };
  ov.querySelectorAll("input[name=type]").forEach(r => r.addEventListener("change", syncType)); syncType();
  const setFiles = list => { files = [...list].filter(f => /^image\//.test(f.type)).slice(0, 4); $("#prev").innerHTML = files.map((f, i) => `<div><img src="${URL.createObjectURL(f)}" alt="">${i === 0 ? "<span>Couverture</span>" : ""}</div>`).join(""); };
  $("#l-files").addEventListener("change", e => setFiles(e.target.files));
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => setFiles(e.dataTransfer.files));

  ov.querySelector("#lf").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("#l-err"); err.hidden = true;
    const fail = t => { err.hidden = false; err.textContent = t; btn.disabled = false; btn.textContent = "Réessayer"; };
    const type = ov.querySelector("input[name=type]:checked").value;
    const price = parseInt(String($("#l-price").value).replace(/\D/g, ""), 10) || 0;
    if (type === "vente" && price <= 0) { err.hidden = false; err.textContent = "Indiquez un prix, ou choisissez « Donner / Céder »."; return; }
    if (!l && !files.length && !noPhotoOk) { err.hidden = false; err.textContent = "Une photo augmente beaucoup vos chances. Ajoutez-en une, ou appuyez de nouveau sur Publier pour continuer sans photo."; noPhotoOk = true; return; }
    const btn = $("#l-save"); btn.disabled = true;
    const listingId = l ? l.id : (crypto.randomUUID ? crypto.randomUUID() : null);
    const row = {
      title: $("#l-title").value.trim(), category: $("#l-cat").value, condition: $("#l-cond").value, type,
      price: type === "vente" ? price : 0, negotiable: type === "vente" && $("#l-neg").checked,
      description: $("#l-desc").value.trim(), commune: $("#l-commune").value, quartier: $("#l-quartier").value.trim(), landmark: $("#l-landmark").value.trim(),
      status: l ? $("#l-status").value : "disponible", confirmed_at: new Date().toISOString()
    };
    let uploaded = [];
    try {
      if (files.length) {
        const stamp = Date.now();
        const folder = `${S.uid}/${listingId || stamp}`;
        for (let i = 0; i < files.length; i++) {
          btn.textContent = `Envoi de la photo ${i + 1}/${files.length}…`;
          const blob = await compress(files[i], 1400, 450000);
          const path = `${folder}/${stamp}_${i}.jpg`;
          const { error } = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
          if (error) throw error;
          uploaded.push(path);
        }
        const tb = await compress(files[0], 480, 60000);
        const tpath = `${folder}/${stamp}_thumb.jpg`;
        const { error: te } = await sb.storage.from("photos").upload(tpath, tb, { contentType: "image/jpeg", upsert: true });
        if (te) throw te;
        uploaded.push(tpath);
        row.photos = uploaded.slice(0, -1); row.thumb = tpath;
      }
      btn.textContent = "Publication…";
      let error;
      if (l) ({ error } = await sb.from("listings").update(row).eq("id", l.id));
      else ({ error } = await sb.from("listings").insert({ ...(listingId ? { id: listingId } : {}), seller_id: S.uid, ...row }));
      if (error) throw error;
      if (l && files.length) { const old = [...(l.photos || []), l.thumb].filter(Boolean); if (old.length) sb.storage.from("photos").remove(old); }
      closeModal(); toast(l ? "Annonce mise à jour" : "Votre article est en ligne !");
      await loadListings();
      if (!l) S.tab = "mes-annonces";
      render();
    } catch (x) {
      if (uploaded.length) sb.storage.from("photos").remove(uploaded);
      const m = String(x?.message || x || "");
      fail(/row-level security|policy/i.test(m) ? "Publication refusée : vérifiez que votre profil est en mode « Vendeur »." : /exceeded|too large|size/i.test(m) ? "Une photo est trop lourde. Essayez-en une autre." : "La publication a échoué : " + m);
    }
  });
}
function compress(file, maxSide, maxBytes) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = async () => {
      let w = img.naturalWidth, h = img.naturalHeight; const r = Math.min(1, maxSide / Math.max(w, h)); w = Math.round(w * r); h = Math.round(h * r);
      const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const toBlob = q => new Promise(ok => c.toBlob(ok, "image/jpeg", q));
      let q = .85, b = await toBlob(q);
      while (b && b.size > maxBytes && q > .4) { q -= .1; b = await toBlob(q); }
      b ? res(b) : rej(new Error("Image illisible"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Ce fichier n'est pas une image lisible")); };
    img.src = url;
  });
}

/* ---------- Owner & admin actions ---------- */
async function patchListing(id, patch, msg) {
  const { error } = await sb.from("listings").update(patch).eq("id", id);
  if (error) { toast("Modification impossible : " + error.message); return; }
  const l = findListing(id); if (l) Object.assign(l, patch, { updated_at: new Date().toISOString() });
  toast(msg); render();
}
function askDelete(id) {
  const l = findListing(id); if (!l) return;
  const ov = modal(head("Supprimer l'annonce ?") + `<div class="sheet-b"><p style="margin:0">« ${esc(l.title)} » et ses photos seront supprimés définitivement.</p><div class="row"><button class="btn pink" id="delOk">Supprimer</button><button class="btn" data-close>Annuler</button></div></div>`, "narrow");
  ov.querySelector("#delOk").addEventListener("click", async () => {
    const files = [...(l.photos || []), l.thumb].filter(Boolean);
    const { error } = await sb.from("listings").delete().eq("id", id);
    if (error) { toast("Suppression impossible : " + error.message); return; }
    if (files.length) sb.storage.from("photos").remove(files);
    S.listings = S.listings.filter(x => x.id !== id);
    closeModal(); toast("Annonce supprimée"); render();
  });
}
async function setAdmin(uid, on) {
  const { error } = await sb.from("profiles").update({ is_admin: on }).eq("id", uid);
  if (error) { toast("Impossible : " + error.message); return; }
  toast(on ? "Nouveau administrateur nommé" : "Droits admin retirés"); render();
}

/* ---------- My listings ---------- */
const itemPh = l => `<div class="ph">${phBox(l)}</div>`;
async function renderMine(main) {
  const list = S.listings.filter(l => l.seller_id === S.uid);
  const totalViews = list.reduce((s, l) => s + l.view_count, 0);
  main.innerHTML = `<div class="section-h"><div><h2>Mes annonces</h2><p class="muted" style="margin:4px 0 0">${list.length} article(s) · ${totalViews} vue(s) au total</p></div><button class="btn sun" data-act="publish">+ Publier un article</button></div>
  <div class="list">${list.length ? list.map(l => `<div class="item">${itemPh(l)}
      <div style="display:grid;gap:6px;min-width:0">
        <div class="row" style="align-items:center"><h3>${esc(l.title)}</h3><span class="pill ${l.status}">${STATUS[l.status]}</span>${l.hidden ? `<span class="pill hidden-p">Masquée par l'admin</span>` : ""}</div>
        <div class="stats-inline"><span>${l.type === "don" ? "Gratuit" : fmtPrice(l.price)}</span><span>${ICON.eye}${l.view_count} vue${l.view_count > 1 ? "s" : ""}</span><span>${ICON.heart}${l.interest_count} intéressé${l.interest_count > 1 ? "s" : ""}</span><span>${ICON.check}Dispo confirmée ${ago(l.confirmed_at)}</span></div>
        <div class="interested" data-int="${l.id}"></div>
      </div>
      <div class="acts">
        ${l.status !== "disponible" ? `<button class="btn sm primary" data-act="status" data-v="disponible" data-key="${l.id}">Remettre disponible</button>` : `<button class="btn sm primary" data-act="confirm" data-key="${l.id}">Toujours dispo</button>`}
        ${l.status !== "reserve" ? `<button class="btn sm" data-act="status" data-v="reserve" data-key="${l.id}">Réservé</button>` : ""}
        ${l.status !== "parti" ? `<button class="btn sm" data-act="status" data-v="parti" data-key="${l.id}">${l.type === "don" ? "Donné" : "Vendu"}</button>` : ""}
        <button class="btn sm" data-act="edit" data-key="${l.id}">Modifier</button>
        <button class="btn sm ghost" style="color:var(--hibiscus)" data-act="delete" data-key="${l.id}">Supprimer</button>
      </div></div>`).join("")
    : `<div class="empty">${CATS.matelas.svg("var(--mango)")}<h3>Vous n'avez encore rien publié</h3><p>Prenez une photo de ce fauteuil qui prend la poussière : quelqu'un le cherche peut-être.</p><button class="btn sun" data-act="publish">Publier mon premier article</button></div>`}</div>`;
  const ids = list.filter(l => l.interest_count > 0).map(l => l.id);
  if (!ids.length) return;
  const { data: ints } = await sb.from("interests").select("listing_id,buyer_id,created_at").in("listing_id", ids).order("created_at", { ascending: false });
  const buyers = [...new Set((ints || []).map(i => i.buyer_id))];
  const { data: ps } = buyers.length ? await sb.from("profiles").select("id,name,phone").in("id", buyers) : { data: [] };
  const P = Object.fromEntries((ps || []).map(p => [p.id, p]));
  (ints || []).forEach(i => {
    const box = document.querySelector(`[data-int="${i.listing_id}"]`); if (!box) return;
    const b = P[i.buyer_id] || { name: "Un membre" };
    box.insertAdjacentHTML("beforeend", `<div><b>${esc(b.name)}</b>${b.phone ? `<span style="font-variant-numeric:tabular-nums">${esc(b.phone)}</span>` : ""}<span class="muted">${ago(i.created_at)}</span></div>`);
  });
}

/* ---------- My interests ---------- */
async function renderInterests(main) {
  const items = [...S.myInterests.entries()].sort((a, b) => Date.parse(b[1]) - Date.parse(a[1]));
  main.innerHTML = `<div class="section-h"><div><h2>Mes coups de cœur</h2><p class="muted" style="margin:4px 0 0">Les articles pour lesquels vous avez signalé votre intérêt.</p></div></div>
  <div class="list">${items.length ? items.map(([k, ts]) => {
    const l = findListing(k);
    if (!l) return `<div class="item"><div class="ph">${illu("autre")}</div><div><h3>Annonce retirée</h3><p class="muted small">Cet article n'est plus en ligne.</p></div><div class="acts"><button class="btn sm" data-act="uninterest" data-key="${k}">Retirer</button></div></div>`;
    return `<div class="item">${itemPh(l)}<div style="display:grid;gap:6px;min-width:0"><div class="row" style="align-items:center"><h3>${esc(l.title)}</h3><span class="pill ${l.status}">${STATUS[l.status]}</span></div>
      <div class="stats-inline"><span>${l.type === "don" ? "Gratuit" : fmtPrice(l.price)}</span><span>${ICON.pin}${esc(l.commune)}</span><span>Intérêt signalé ${ago(ts)}</span></div>
      <div class="small" data-seller="${l.seller_id}"></div></div>
      <div class="acts"><button class="btn sm primary" data-open="${k}">Voir</button><button class="btn sm ghost" data-act="uninterest" data-key="${k}">Retirer</button></div></div>`;
  }).join("")
    : `<div class="empty">${CATS.lit.svg("var(--hibiscus)")}<h3>Aucun coup de cœur</h3><p>Ouvrez un article et touchez « Je suis intéressé » : le vendeur sera prévenu.</p></div>`}</div>`;
  const sellers = [...new Set(items.map(([k]) => findListing(k)?.seller_id).filter(Boolean))];
  if (!sellers.length) return;
  const { data: ps } = await sb.from("profiles").select("id,name,phone").in("id", sellers);
  (ps || []).forEach(p => document.querySelectorAll(`[data-seller="${p.id}"]`).forEach(el => el.innerHTML = `<b>${esc(p.name)}</b> · <span style="font-variant-numeric:tabular-nums">${esc(p.phone)}</span>`));
}

/* ---------- Admin ---------- */
async function renderAdmin(main) {
  main.innerHTML = `<div class="section-h"><div><h2>Administration</h2><p class="muted" style="margin:4px 0 0">Chargement…</p></div></div>`;
  const { data: users } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (S.tab !== "admin") return;
  const all = S.listings, U = users || [];
  const active = all.filter(l => l.status !== "parti" && !l.hidden).length, gone = all.filter(l => l.status === "parti").length, dons = all.filter(l => l.type === "don").length;
  const views = all.reduce((s, l) => s + l.view_count, 0), ints = all.reduce((s, l) => s + l.interest_count, 0);
  const sellers = U.filter(p => p.role !== "acheteur").length;
  const name = id => (U.find(p => p.id === id) || {}).name || "—";
  main.innerHTML = `<div class="section-h"><div><h2>Administration</h2><p class="muted" style="margin:4px 0 0">Session administrateur : vous pouvez masquer, modifier ou supprimer n'importe quelle annonce.</p></div></div>
  <div class="tiles">
    <div class="tile"><div class="n">${active}</div><div class="l">Annonces actives</div></div>
    <div class="tile"><div class="n">${gone}</div><div class="l">Articles partis</div></div>
    <div class="tile"><div class="n">${dons}</div><div class="l">Dons proposés</div></div>
    <div class="tile"><div class="n">${views}</div><div class="l">Vues uniques</div></div>
    <div class="tile"><div class="n">${ints}</div><div class="l">Marques d'intérêt</div></div>
    <div class="tile"><div class="n">${U.length}</div><div class="l">Comptes (${sellers} vendeurs)</div></div>
  </div>
  <h3 style="font-size:20px;margin:26px 0 10px">Toutes les annonces</h3>
  <div class="tscroll"><table><thead><tr><th>Article</th><th>Vendeur</th><th>Position</th><th>Statut</th><th style="text-align:right">Vues</th><th style="text-align:right">Intéressés</th><th>Actions</th></tr></thead><tbody>
  ${all.map(l => `<tr><td><b>${esc(l.title)}</b><br><span class="muted small">${l.type === "don" ? "Gratuit" : fmtPrice(l.price)} · ${ago(l.created_at)}</span></td>
    <td>${esc(name(l.seller_id))}</td><td>${esc(l.commune)}</td>
    <td><span class="pill ${l.status}">${STATUS[l.status]}</span>${l.hidden ? ` <span class="pill hidden-p">Masquée</span>` : ""}</td>
    <td class="num">${l.view_count}</td><td class="num">${l.interest_count}</td>
    <td><div class="row"><button class="btn sm" data-open="${l.id}">Voir</button><button class="btn sm" data-act="hide" data-key="${l.id}">${l.hidden ? "Afficher" : "Masquer"}</button><button class="btn sm ghost" style="color:var(--hibiscus)" data-act="delete" data-key="${l.id}">Supprimer</button></div></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Aucune annonce.</td></tr>`}
  </tbody></table></div>
  <h3 style="font-size:20px;margin:26px 0 10px">Membres</h3>
  <div class="tscroll" style="margin-bottom:40px"><table><thead><tr><th>Nom</th><th>Rôle</th><th>Téléphone</th><th>Commune</th><th style="text-align:right">Annonces</th><th>Inscrit</th><th>Admin</th></tr></thead><tbody>
  ${U.map(p => `<tr><td><b>${esc(p.name)}</b></td><td><span class="role-tag">${{ vendeur: "Vendeur", acheteur: "Acheteur", "les-deux": "Les deux" }[p.role] || "—"}</span>${p.is_admin ? ' <span class="role-tag admin">Admin</span>' : ""}</td><td style="font-variant-numeric:tabular-nums">${esc(p.phone)}</td><td>${esc(p.commune)}</td><td class="num">${all.filter(l => l.seller_id === p.id).length}</td><td>${ago(p.created_at)}</td>
    <td>${p.id === S.uid ? '<span class="muted small">Vous</span>' : `<button class="btn sm" data-act="mkadmin" data-key="${p.id}" data-v="${p.is_admin ? 0 : 1}">${p.is_admin ? "Retirer" : "Nommer admin"}</button>`}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">Aucun membre inscrit pour l'instant.</td></tr>`}
  </tbody></table></div>`;
}

boot();
