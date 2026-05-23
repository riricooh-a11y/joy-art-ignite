import { useState, useEffect, useRef } from "react";

// ─── PERSISTENT STORAGE (simula tu base de datos Supabase) ───────────────────
const DB_KEY = "certpy_saas_db";
const INITIAL_DB = {
  plans: [
    { id: "demo",       name: "Demo",         price: 0,  period: "mes", color: "#64748b", certs: 5,      badge: null,           aiAccess: false, pdf: false, watermark: true,  lote: false, qr: false, active: true },
    { id: "pro",        name: "Profesional",  price: 9,  period: "mes", color: "#c8952e", certs: 100,    badge: "MÁS POPULAR",  aiAccess: true,  pdf: true,  watermark: false, lote: true,  qr: true,  active: true },
    { id: "enterprise", name: "Institucional",price: 29, period: "mes", color: "#6366f1", certs: 999999, badge: "PARA EMPRESAS", aiAccess: true,  pdf: true,  watermark: false, lote: true,  qr: true,  active: true },
  ],
  credits: [
    { id: "c50",  label: "50 certificados",  price: 3  },
    { id: "c200", label: "200 certificados", price: 9  },
    { id: "c500", label: "500 certificados", price: 19 },
  ],
  users: [
    { id: "u1", name: "María González",   email: "maria@colegiocentral.edu.py", plan: "enterprise", certsUsed: 412, creditsBalance: 0,   joined: "2025-01-15", status: "active",    totalPaid: 116 },
    { id: "u2", name: "Carlos Benítez",   email: "carlos@ifp.gov.py",           plan: "pro",        certsUsed: 89,  creditsBalance: 50,  joined: "2025-03-02", status: "active",    totalPaid: 27  },
    { id: "u3", name: "Laura Martínez",   email: "laura@gmail.com",             plan: "demo",       certsUsed: 5,   creditsBalance: 0,   joined: "2025-04-10", status: "active",    totalPaid: 0   },
    { id: "u4", name: "Instituto SENAC",  email: "admin@senac.edu.py",          plan: "enterprise", certsUsed: 1240,creditsBalance: 200, joined: "2024-11-20", status: "active",    totalPaid: 174 },
    { id: "u5", name: "Pedro Ramírez",    email: "pedro@corp.com",              plan: "pro",        certsUsed: 67,  creditsBalance: 0,   joined: "2025-02-28", status: "suspended", totalPaid: 18  },
    { id: "u6", name: "UNA Facultad",     email: "certs@una.py",               plan: "enterprise", certsUsed: 892, creditsBalance: 0,   joined: "2024-09-05", status: "active",    totalPaid: 261 },
    { id: "u7", name: "Roberto López",    email: "rlopez@empresa.com",          plan: "pro",        certsUsed: 44,  creditsBalance: 0,   joined: "2025-04-22", status: "active",    totalPaid: 9   },
    { id: "u8", name: "Ana Flores",       email: "ana@flores.com",              plan: "demo",       certsUsed: 3,   creditsBalance: 0,   joined: "2025-05-01", status: "active",    totalPaid: 0   },
  ],
  payments: [
    { id: "PAY-001", userId: "u1", plan: "enterprise", amount: 29, date: "2025-05-01", status: "paid",   type: "subscription" },
    { id: "PAY-002", userId: "u2", plan: "pro",        amount: 9,  date: "2025-05-01", status: "paid",   type: "subscription" },
    { id: "PAY-003", userId: "u4", plan: "enterprise", amount: 29, date: "2025-05-01", status: "paid",   type: "subscription" },
    { id: "PAY-004", userId: "u6", plan: "enterprise", amount: 29, date: "2025-05-01", status: "paid",   type: "subscription" },
    { id: "PAY-005", userId: "u5", plan: "pro",        amount: 9,  date: "2025-04-01", status: "failed", type: "subscription" },
    { id: "PAY-006", userId: "u2", plan: "pro",        amount: 9,  date: "2025-04-01", status: "paid",   type: "credits",      creditsQty: 50  },
    { id: "PAY-007", userId: "u4", plan: "enterprise", amount: 29, date: "2025-04-01", status: "paid",   type: "subscription" },
    { id: "PAY-008", userId: "u6", plan: "enterprise", amount: 29, date: "2025-04-01", status: "paid",   type: "subscription" },
  ],
  stats: [
    { month: "Nov", revenue: 87,  users: 12, certs: 320  },
    { month: "Dic", revenue: 116, users: 18, certs: 540  },
    { month: "Ene", revenue: 174, users: 26, certs: 890  },
    { month: "Feb", revenue: 203, users: 34, certs: 1100 },
    { month: "Mar", revenue: 261, users: 41, certs: 1450 },
    { month: "Abr", revenue: 318, users: 52, certs: 1980 },
    { month: "May", revenue: 376, users: 61, certs: 2640 },
  ],
  settings: {
    siteName: "CertificaPy",
    country: "Paraguay",
    currency: "USD",
    annualDiscount: 17,
    demoLimit: 5,
    supportEmail: "soporte@certificapy.com.py",
    whatsapp: "+595 981 123456",
  },
};

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return JSON.parse(JSON.stringify(INITIAL_DB));
}
function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch {}
}

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#060d1a", surface: "#0b1120", card: "#0f172a",
  border: "#1e293b", border2: "#334155",
  text: "#f1f5f9", muted: "#64748b",
  gold: "#c8952e", goldLight: "#d4a843",
  indigo: "#6366f1", green: "#22c55e", red: "#ef4444",
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Pill({ color, children }) {
  return <span style={{ background:`${color}22`, border:`1px solid ${color}55`, color, borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{children}</span>;
}
function StatusPill({ status }) {
  const m = { active:["#22c55e","Activo"], suspended:["#ef4444","Suspendido"], paid:["#22c55e","Pagado"], failed:["#ef4444","Fallido"], pending:["#f59e0b","Pendiente"] };
  const [color, label] = m[status] || [C.muted, status];
  return <Pill color={color}>{label}</Pill>;
}
function PlanPill({ planId, plans }) {
  const plan = plans?.find(p=>p.id===planId);
  return <Pill color={plan?.color || C.muted}>{plan?.name || planId}</Pill>;
}
function StatCard({ icon, label, value, sub, color=C.gold, trend }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", flex:1, minWidth:150 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", textAlign:"right" }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color, letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{sub}</div>}
      {trend && <div style={{ fontSize:11, color:C.green, marginTop:3 }}>↑ {trend}</div>}
    </div>
  );
}
function MiniBar({ data, field, color }) {
  const max = Math.max(...data.map(d=>d[field]));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:52 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div title={`${d.month}: ${d[field]}`} style={{ width:"100%", background:`${color}bb`, borderRadius:"3px 3px 0 0", height:`${(d[field]/max)*48}px`, transition:"height 0.4s", cursor:"default" }} />
          <span style={{ fontSize:7, color:C.muted }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}
function Divider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0 16px" }}>
      {label && <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:9999, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ padding:"10px 16px", borderRadius:8, fontSize:12, fontWeight:600, background:t.type==="error"?"#7f1d1d":t.type==="info"?"#1e3a5f":"#14532d", border:`1px solid ${t.type==="error"?C.red:t.type==="info"?"#3b82f6":C.green}`, color:"#f1f5f9", boxShadow:"0 4px 20px rgba(0,0,0,0.4)", animation:"toastIn 0.2s ease" }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
function Modal({ open, onClose, title, children, width=480 }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }} onClick={onClose}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, width, maxWidth:"100%", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:800 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputSt = { background:"#0b1120", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, padding:"9px 11px", outline:"none", boxSizing:"border-box", width:"100%" };
const labelSt = { fontSize:11, color:C.muted, display:"block", marginBottom:4, letterSpacing:"0.04em" };
function Field({ label, children }) {
  return <div style={{ marginBottom:14 }}><label style={labelSt}>{label}</label>{children}</div>;
}
function Btn({ children, onClick, color=C.gold, outline=false, small=false, disabled=false, danger=false }) {
  const bg = danger ? "#ef444420" : outline ? "transparent" : `linear-gradient(135deg,${color},${color}cc)`;
  const border = danger ? `1px solid #ef444455` : outline ? `1px solid ${color}55` : "none";
  const textColor = danger ? C.red : outline ? color : color===C.gold?"#1a0f00":"#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{ background:bg, border, color:textColor, borderRadius:8, padding:small?"5px 12px":"9px 18px", cursor:disabled?"not-allowed":"pointer", fontWeight:700, fontSize:small?11:12, opacity:disabled?0.5:1, transition:"all 0.15s", whiteSpace:"nowrap" }}>
      {children}
    </button>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ db, onAdmin, onDemo }) {
  const [annual, setAnnual] = useState(false);
  const [hov, setHov] = useState(null);
  const s = db.settings;
  const activePlans = db.plans.filter(p => p.active);

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:`${C.bg}ee`, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏅</div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.02em" }}>{s.siteName}</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <a href="#pricing" style={{ fontSize:12, color:C.muted, textDecoration:"none", padding:"7px 12px" }}>Precios</a>
          <button onClick={onAdmin} style={{ background:`${C.indigo}22`, border:`1px solid ${C.indigo}55`, color:C.indigo, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}>Admin ⚙</button>
          <button onClick={onDemo} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", color:"#1a0f00", borderRadius:8, padding:"7px 18px", cursor:"pointer", fontSize:12, fontWeight:800 }}>
            Probar demo →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign:"center", padding:"90px 40px 70px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:600, height:300, background:`radial-gradient(ellipse, ${C.gold}15 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${C.gold}15`, border:`1px solid ${C.gold}33`, borderRadius:20, padding:"6px 16px", marginBottom:22 }}>
          <span style={{ fontSize:12 }}>✦</span>
          <span style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:"0.08em" }}>PLATAFORMA PROFESIONAL DE CERTIFICADOS — {s.country.toUpperCase()}</span>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(34px,5vw,60px)", fontWeight:800, lineHeight:1.1, marginBottom:18, letterSpacing:"-0.02em" }}>
          Emití certificados<br /><span style={{ color:C.gold }}>profesionales</span> en segundos
        </h1>
        <p style={{ fontSize:17, color:C.muted, maxWidth:520, margin:"0 auto 36px", lineHeight:1.7 }}>
          Creá, personalizá y verificá certificados con IA. Para instituciones educativas, empresas y profesionales de {s.country}.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onDemo} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", color:"#1a0f00", borderRadius:10, padding:"13px 30px", cursor:"pointer", fontSize:14, fontWeight:800 }}>
            Probar gratis ({s.demoLimit} certificados)
          </button>
          <a href="#pricing" style={{ textDecoration:"none" }}>
            <button style={{ background:"transparent", border:`1px solid ${C.border2}`, color:C.text, borderRadius:10, padding:"13px 30px", cursor:"pointer", fontSize:14 }}>Ver planes ▼</button>
          </a>
        </div>

        {/* Social proof */}
        <div style={{ display:"flex", gap:32, justifyContent:"center", marginTop:56, flexWrap:"wrap" }}>
          {db.stats.slice(-1).map(s => [
            [`${(s.certs).toLocaleString()}+`, "Certificados emitidos"],
            [`${s.users}`, "Instituciones activas"],
            ["99.9%", "Uptime garantizado"],
          ])[0].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:C.gold }}>{n}</div>
              <div style={{ fontSize:12, color:C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"50px 40px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, marginBottom:40 }}>Todo lo que necesitás</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18 }}>
          {[
            ["🤖","Asistente IA","Escribí una descripción y la IA genera el texto formal del certificado."],
            ["🎨","Editor visual","Personalizá colores, fuentes, bordes y sello en tiempo real."],
            ["📦","Generación en lote","Subí un CSV con 1.000 nombres y generá todos de una vez."],
            ["🔐","Verificación QR","Código QR único por certificado para verificar autenticidad."],
            ["📄","PDF de alta calidad","A4 landscape listo para imprimir con resolución profesional."],
            ["🏢","Multi-institución","Gestioná múltiples instituciones desde una cuenta Institucional."],
          ].map(([icon,title,desc]) => (
            <div key={title} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:22 }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{icon}</div>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{title}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:"50px 40px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, marginBottom:6 }}>Planes y precios</h2>
        <p style={{ textAlign:"center", color:C.muted, marginBottom:28, fontSize:13 }}>Empezá gratis, escalá cuando necesites</p>

        {/* Toggle anual */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:36 }}>
          <span style={{ fontSize:12, color:annual?C.muted:C.text, fontWeight:annual?400:700 }}>Mensual</span>
          <div onClick={()=>setAnnual(!annual)} style={{ width:44, height:24, background:annual?C.gold:C.border2, borderRadius:12, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
            <div style={{ position:"absolute", top:2, left:annual?20:2, width:20, height:20, background:"white", borderRadius:10, transition:"left 0.2s" }} />
          </div>
          <span style={{ fontSize:12, color:annual?C.text:C.muted, fontWeight:annual?700:400 }}>Anual</span>
          {annual && <Pill color={C.green}>{s.annualDiscount}% descuento</Pill>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18 }}>
          {activePlans.map(plan => {
            const price = annual && plan.price > 0 ? Math.round(plan.price * (1 - s.annualDiscount/100)) : plan.price;
            const isPro = plan.id === "pro";
            const isHov = hov === plan.id;
            const isDemo = plan.id === "demo";
            return (
              <div key={plan.id}
                onMouseEnter={()=>setHov(plan.id)} onMouseLeave={()=>setHov(null)}
                style={{ background: isPro?"linear-gradient(160deg,#1a1400,#0f0a00)":C.card, border:`2px solid ${isPro||isHov?plan.color:C.border}`, borderRadius:16, padding:26, display:"flex", flexDirection:"column", gap:18, transition:"all 0.2s", transform:isPro||isHov?"translateY(-4px)":"none", position:"relative", overflow:"hidden" }}>
                {isPro && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${C.gold}10, transparent 60%)`, pointerEvents:"none" }} />}
                {plan.badge && <div style={{ position:"absolute", top:14, right:14 }}><Pill color={plan.color}>{plan.badge}</Pill></div>}

                <div>
                  <h3 style={{ fontSize:17, fontWeight:800, marginBottom:3 }}>{plan.name}</h3>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:38, fontWeight:900, color:plan.price===0?C.muted:plan.color }}>{plan.price===0?"Free":`$${price}`}</span>
                    {plan.price>0 && <span style={{ fontSize:12, color:C.muted }}>{s.currency}/{plan.period}</span>}
                  </div>
                  <p style={{ fontSize:11, color:C.muted, marginTop:3 }}>
                    {plan.certs>=999999?"Ilimitados":`${plan.certs} certificados`}/mes
                    {isDemo && <span style={{ color:"#f59e0b" }}> · Solo para pruebas</span>}
                  </p>
                </div>

                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:9, flex:1 }}>
                  {[
                    [true,                    `${plan.certs>=999999?"Ilimitados":plan.certs} certificados/mes`],
                    [plan.pdf,                "Descarga PDF"],
                    [!plan.watermark,         "Sin marca de agua"],
                    [plan.aiAccess,           "Asistente IA"],
                    [plan.lote,               "Generación en lote CSV"],
                    [plan.qr,                 "Verificación QR"],
                  ].map(([ok,text],i) => (
                    <li key={i} style={{ display:"flex", alignItems:"center", gap:9, fontSize:12, color:ok?C.text:C.muted, opacity:ok?1:0.5 }}>
                      <span style={{ color:ok?C.green:C.red, fontSize:13 }}>{ok?"✓":"✗"}</span>{text}
                    </li>
                  ))}
                </ul>

                <button onClick={onDemo} style={{ padding:"11px 0", borderRadius:9, border:"none", cursor:"pointer", fontWeight:800, fontSize:12, background:isPro?`linear-gradient(135deg,${C.gold},${C.goldLight})`:`${plan.color}22`, color:isPro?"#1a0f00":plan.color, border:isPro?"none":`1px solid ${plan.color}44` }}>
                  {plan.price===0?`Probar demo (${s.demoLimit} certs)`:"Empezar ahora"} →
                </button>
              </div>
            );
          })}
        </div>

        {/* Créditos extra */}
        <div style={{ marginTop:28, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:26, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ fontSize:30 }}>⚡</div>
          <div style={{ flex:1, minWidth:180 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:3 }}>Créditos adicionales</h3>
            <p style={{ fontSize:12, color:C.muted }}>¿Se acabaron? Comprá créditos extra sin cambiar de plan.</p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {db.credits.map(cr => (
              <div key={cr.id} style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"10px 16px", textAlign:"center", cursor:"pointer" }}>
                <div style={{ fontSize:12, color:C.muted }}>{cr.label}</div>
                <div style={{ fontSize:18, fontWeight:900, color:C.gold }}>${cr.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"28px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginTop:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22, height:22, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>🏅</div>
          <span style={{ fontWeight:700, fontSize:13 }}>{s.siteName}</span>
        </div>
        <span style={{ fontSize:11, color:C.muted }}>© 2025 {s.siteName} · Hecho en {s.country} 🇵🇾 · {s.supportEmail}</span>
        <div style={{ display:"flex", gap:14 }}>
          {["Términos","Privacidad","Contacto"].map(l=><a key={l} href="#" style={{ fontSize:11, color:C.muted, textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

// ─── DEMO APP (editor limitado a N certificados) ──────────────────────────────
function DemoApp({ db, onBack }) {
  const limit = db.settings.demoLimit;
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Juan Carlos López");
  const [course, setCourse] = useState("Desarrollo Web Full Stack");
  const [downloaded, setDownloaded] = useState([]);

  const remaining = limit - count;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Topbar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:26, height:26, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🏅</div>
          <span style={{ fontWeight:800, fontSize:15 }}>{db.settings.siteName}</span>
          <Pill color="#f59e0b">MODO DEMO</Pill>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:12, color:C.muted }}>
            Certificados: <span style={{ color:remaining>0?C.green:C.red, fontWeight:700 }}>{count}/{limit}</span>
          </div>
          <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${C.border2}`, color:C.muted, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12 }}>← Volver</button>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
        {/* Limit banner */}
        {remaining <= 0 ? (
          <div style={{ background:"#7f1d1d", border:"1px solid #ef4444", borderRadius:12, padding:"20px 24px", marginBottom:28, textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>🔒</div>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Límite del demo alcanzado</h3>
            <p style={{ fontSize:13, color:"#fca5a5", marginBottom:16 }}>Usaste los {limit} certificados del modo demo. Activá un plan para continuar sin límites.</p>
            <button onClick={onBack} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:10, color:"#1a0f00", padding:"11px 28px", cursor:"pointer", fontWeight:800, fontSize:13 }}>Ver planes →</button>
          </div>
        ) : (
          <div style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"12px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>⚡</span>
            <span style={{ fontSize:12, color:C.gold }}>Demo gratuito — te quedan <strong>{remaining}</strong> certificado{remaining!==1?"s":""} de {limit}. <span style={{ color:C.muted }}>Para más, elegí un plan.</span></span>
          </div>
        )}

        {/* Mini editor */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:28, marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:800, marginBottom:20 }}>✏️ Editor de certificado (demo)</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Nombre del destinatario">
              <input style={inputSt} value={name} onChange={e=>setName(e.target.value)} disabled={remaining<=0} />
            </Field>
            <Field label="Nombre del curso">
              <input style={inputSt} value={course} onChange={e=>setCourse(e.target.value)} disabled={remaining<=0} />
            </Field>
          </div>
          <div style={{ marginTop:4, display:"flex", gap:10 }}>
            <Btn disabled={remaining<=0} onClick={()=>{
              if(remaining<=0) return;
              setCount(c=>c+1);
              setDownloaded(d=>[...d,{name, course, id:`DEMO-00${count+1}`}]);
            }}>
              📥 Generar certificado PNG
            </Btn>
            <Btn outline color={C.muted} disabled>
              🔒 PDF (plan de pago)
            </Btn>
          </div>
          <p style={{ fontSize:11, color:C.muted, marginTop:10 }}>* El modo demo incluye marca de agua. Sin marca de agua con plan Profesional o superior.</p>
        </div>

        {/* Preview del certificado (simulado) */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:28, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:14, right:14, opacity:0.12, fontSize:13, fontWeight:900, color:C.gold, transform:"rotate(-30deg)", letterSpacing:"0.2em" }}>MARCA DE AGUA DEMO</div>
          <div style={{ border:`2px solid #1e3a5f`, borderRadius:4, padding:28, background:"#fff", color:"#1a1a2e", minHeight:220, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", gap:8, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.07, fontSize:18, fontWeight:900, color:"#c8952e", transform:"rotate(-25deg)", letterSpacing:"0.15em", pointerEvents:"none" }}>
              DEMO · {db.settings.siteName.toUpperCase()} · DEMO
            </div>
            <p style={{ fontSize:10, color:"#64748b", letterSpacing:"0.2em", textTransform:"uppercase" }}>República del Paraguay · Instituto de Formación</p>
            <h1 style={{ fontSize:22, fontWeight:800, fontFamily:"serif", color:"#1e3a5f" }}>CERTIFICADO</h1>
            <p style={{ fontSize:11, color:"#64748b" }}>Se certifica que</p>
            <h2 style={{ fontSize:17, fontWeight:700, fontFamily:"serif", color:"#1e3a5f", borderBottom:"2px solid #c8952e", paddingBottom:4 }}>{name || "..."}</h2>
            <p style={{ fontSize:11 }}>Ha completado satisfactoriamente el curso</p>
            <p style={{ fontSize:14, fontWeight:700, fontFamily:"serif" }}>«{course || "..."}»</p>
            <p style={{ fontSize:10, color:"#64748b" }}>Emitido el {new Date().toLocaleDateString("es-PY",{day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
        </div>

        {/* Historial del demo */}
        {downloaded.length > 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:C.muted }}>Certificados generados en esta sesión</h3>
            {downloaded.map((d,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:C.surface, borderRadius:8, marginBottom:6 }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600 }}>{d.name}</span>
                  <span style={{ fontSize:11, color:C.muted, marginLeft:10 }}>{d.course}</span>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Pill color={C.muted}>{d.id}</Pill>
                  <Pill color="#f59e0b">+ Marca de agua</Pill>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {count > 0 && (
          <div style={{ marginTop:24, background:`linear-gradient(135deg, #1a1400, #0f0a00)`, border:`2px solid ${C.gold}55`, borderRadius:14, padding:24, textAlign:"center" }}>
            <p style={{ fontSize:14, color:C.gold, fontWeight:700, marginBottom:6 }}>¿Te gustó? Activá un plan y descargá sin límites</p>
            <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Sin marca de agua · PDF profesional · Asistente IA · Lote CSV</p>
            <button onClick={onBack} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:10, color:"#1a0f00", padding:"12px 28px", cursor:"pointer", fontWeight:800, fontSize:13 }}>
              Ver planes desde $9/mes →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ db, setDb, onBack }) {
  const [section, setSection] = useState("overview");
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);
  };
  const save = (newDb) => { setDb(newDb); saveDB(newDb); };

  const NAV = [
    { id:"overview",  icon:"📊", label:"Resumen"    },
    { id:"users",     icon:"👥", label:"Clientes"   },
    { id:"payments",  icon:"💳", label:"Pagos"      },
    { id:"plans",     icon:"📦", label:"Planes"     },
    { id:"credits",   icon:"⚡", label:"Créditos"  },
    { id:"settings",  icon:"⚙️", label:"Ajustes"   },
  ];

  const mrr = db.users.filter(u=>u.status==="active"&&u.plan!=="demo").reduce((a,u)=>{
    const p = db.plans.find(pl=>pl.id===u.plan);
    return a + (p?.price||0);
  },0);
  const totalRev = db.payments.filter(p=>p.status==="paid").reduce((a,p)=>a+p.amount,0);
  const activeUsers = db.users.filter(u=>u.status==="active").length;
  const totalCerts = db.users.reduce((a,u)=>a+u.certsUsed,0);

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <aside style={{ width:210, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ width:26,height:26, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🏅</div>
            <span style={{ fontWeight:800, fontSize:14 }}>{db.settings.siteName}</span>
          </div>
          <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.12em", textTransform:"uppercase" }}>Panel Administrativo</span>
        </div>
        <nav style={{ flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSection(n.id)} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:7, background:section===n.id?`${C.gold}18`:"transparent", border:section===n.id?`1px solid ${C.gold}33`:"1px solid transparent", color:section===n.id?C.gold:C.muted, cursor:"pointer", fontSize:12, fontWeight:section===n.id?700:400, textAlign:"left", transition:"all 0.12s" }}>
              <span style={{ fontSize:14 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px 6px", borderTop:`1px solid ${C.border}` }}>
          <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", width:"100%", background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>
            🏠 Ver sitio
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, overflowY:"auto", padding:24 }}>

        {/* ── OVERVIEW ── */}
        {section==="overview" && <Overview db={db} mrr={mrr} totalRev={totalRev} activeUsers={activeUsers} totalCerts={totalCerts} />}

        {/* ── CLIENTES ── */}
        {section==="users" && <UsersSection db={db} save={save} toast={toast} />}

        {/* ── PAGOS ── */}
        {section==="payments" && <PaymentsSection db={db} save={save} toast={toast} />}

        {/* ── PLANES ── */}
        {section==="plans" && <PlansSection db={db} save={save} toast={toast} />}

        {/* ── CRÉDITOS ── */}
        {section==="credits" && <CreditsSection db={db} save={save} toast={toast} />}

        {/* ── AJUSTES ── */}
        {section==="settings" && <SettingsSection db={db} save={save} toast={toast} />}
      </main>

      <Toast toasts={toasts} />
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}} *{box-sizing:border-box} ::-webkit-scrollbar{width:5px;height:5px} ::-webkit-scrollbar-track{background:#0f172a} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
    </div>
  );
}

// ── Overview ──
function Overview({ db, mrr, totalRev, activeUsers, totalCerts }) {
  return (
    <>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Resumen general</h1>
        <p style={{ color:C.muted, fontSize:12 }}>Mayo 2025 · Datos en tiempo real</p>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard icon="💰" label="Ingresos totales" value={`$${totalRev}`} sub="Pagos cobrados" trend="18% vs mes ant." color={C.gold} />
        <StatCard icon="📈" label="MRR" value={`$${mrr}`} sub="Ingresos recurrentes" color={C.green} />
        <StatCard icon="👥" label="Clientes activos" value={activeUsers} sub={`${db.users.length} total`} color={C.indigo} />
        <StatCard icon="📜" label="Certificados" value={totalCerts.toLocaleString()} sub="Generados en total" color="#f59e0b" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:13 }}>Ingresos mensuales</span>
            <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>+18% vs mes anterior</span>
          </div>
          <MiniBar data={db.stats} field="revenue" color={C.gold} />
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <span style={{ fontWeight:700, fontSize:13, display:"block", marginBottom:14 }}>Por plan</span>
          {db.plans.map(plan => {
            const cnt = db.users.filter(u=>u.plan===plan.id).length;
            const pct = db.users.length ? Math.round((cnt/db.users.length)*100) : 0;
            return (
              <div key={plan.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, color:C.muted }}>{plan.name}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:plan.color }}>{cnt} ({pct}%)</span>
                </div>
                <div style={{ height:5, background:C.border, borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:plan.color, borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Últimos pagos */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
        <span style={{ fontWeight:700, fontSize:13, display:"block", marginBottom:14 }}>Últimos pagos</span>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["ID","Cliente","Plan","Monto","Fecha","Estado"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"6px 10px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {db.payments.slice(0,6).map(p=>{
              const u = db.users.find(u=>u.id===p.userId);
              return (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:"9px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>{p.id}</td>
                  <td style={{ padding:"9px 10px", fontSize:12 }}>{u?.name||"—"}</td>
                  <td style={{ padding:"9px 10px" }}><PlanPill planId={p.plan} plans={db.plans} /></td>
                  <td style={{ padding:"9px 10px", fontSize:13, fontWeight:700, color:p.status==="paid"?C.gold:C.red }}>${p.amount}</td>
                  <td style={{ padding:"9px 10px", fontSize:11, color:C.muted }}>{p.date}</td>
                  <td style={{ padding:"9px 10px" }}><StatusPill status={p.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Clientes ──
function UsersSection({ db, save, toast }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [addCreditsUser, setAddCreditsUser] = useState(null);
  const [creditsAmt, setCreditsAmt] = useState(50);

  const filtered = db.users.filter(u => {
    const matchS = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchP = planFilter==="all" || u.plan===planFilter || u.status===planFilter;
    return matchS && matchP;
  });

  const toggleStatus = (uid) => {
    const newUsers = db.users.map(u => u.id===uid ? {...u, status: u.status==="active"?"suspended":"active"} : u);
    save({...db, users:newUsers});
    toast(`Estado actualizado`);
  };

  const changePlan = (uid, plan) => {
    const newUsers = db.users.map(u => u.id===uid ? {...u, plan} : u);
    save({...db, users:newUsers});
    toast(`Plan cambiado a ${db.plans.find(p=>p.id===plan)?.name}`);
    setEditUser(null);
  };

  const addCredits = (uid) => {
    const newUsers = db.users.map(u => u.id===uid ? {...u, creditsBalance:(u.creditsBalance||0)+creditsAmt} : u);
    const newPay = [...db.payments, { id:`PAY-${Date.now()}`, userId:uid, plan:"credits", amount:0, date:new Date().toISOString().slice(0,10), status:"paid", type:"credits", creditsQty:creditsAmt, note:"Cargado por admin" }];
    save({...db, users:newUsers, payments:newPay});
    toast(`${creditsAmt} créditos agregados`);
    setAddCreditsUser(null);
  };

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Clientes</h1>
          <p style={{ color:C.muted, fontSize:12 }}>{db.users.length} usuarios registrados</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input style={{ ...inputSt, width:200 }} placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select style={inputSt} value={planFilter} onChange={e=>setPlanFilter(e.target.value)}>
            <option value="all">Todos los planes</option>
            {db.plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
              {["Cliente","Plan","Certs usados","Créditos","Pagado","Estado","Acciones"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"11px 14px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}22`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=`${C.border}33`}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold}44,${C.indigo}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>{u.name[0]}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"11px 14px" }}><PlanPill planId={u.plan} plans={db.plans} /></td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700 }}>{u.certsUsed.toLocaleString()}</td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ fontSize:12, color:u.creditsBalance>0?C.green:C.muted, fontWeight:u.creditsBalance>0?700:400 }}>{u.creditsBalance||0}</span>
                </td>
                <td style={{ padding:"11px 14px", fontSize:12, color:C.gold, fontWeight:700 }}>${u.totalPaid}</td>
                <td style={{ padding:"11px 14px" }}><StatusPill status={u.status} /></td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    <Btn small onClick={()=>setSelected(u)}>Ver</Btn>
                    <Btn small outline color={C.gold} onClick={()=>setEditUser(u)}>Plan</Btn>
                    <Btn small outline color={C.green} onClick={()=>{setAddCreditsUser(u);setCreditsAmt(50);}}>+Cred</Btn>
                    <Btn small danger onClick={()=>toggleStatus(u.id)}>{u.status==="active"?"Susp.":"Activ."}</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{ padding:24, textAlign:"center", color:C.muted, fontSize:12 }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalle */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.name} width={420}>
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["Email",selected.email],["Plan",<PlanPill planId={selected.plan} plans={db.plans}/>],["Estado",<StatusPill status={selected.status}/>],["Certificados usados",selected.certsUsed.toLocaleString()],["Créditos extra",selected.creditsBalance||0],["Total pagado",`$${selected.totalPaid}`],["Miembro desde",selected.joined]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:C.surface, borderRadius:8 }}>
                <span style={{ fontSize:11, color:C.muted }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <Btn onClick={()=>{setSelected(null);setEditUser(selected);}}>Cambiar plan</Btn>
              <Btn danger onClick={()=>{toggleStatus(selected.id);setSelected(null);}}>
                {selected.status==="active"?"Suspender":"Activar"}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal cambio de plan */}
      <Modal open={!!editUser} onClose={()=>setEditUser(null)} title="Cambiar plan" width={360}>
        {editUser && (
          <div>
            <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Cliente: <strong style={{ color:C.text }}>{editUser.name}</strong></p>
            <p style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Plan actual: <PlanPill planId={editUser.plan} plans={db.plans}/></p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {db.plans.filter(p=>p.id!==editUser.plan).map(p=>(
                <button key={p.id} onClick={()=>changePlan(editUser.id,p.id)} style={{ padding:"11px 16px", background:`${p.color}15`, border:`1px solid ${p.color}44`, color:p.color, borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span>{p.name}</span>
                  <span style={{ fontSize:12, opacity:0.8 }}>{p.price===0?"Gratis":`$${p.price}/mes`}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal agregar créditos */}
      <Modal open={!!addCreditsUser} onClose={()=>setAddCreditsUser(null)} title="Agregar créditos" width={360}>
        {addCreditsUser && (
          <div>
            <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Cliente: <strong style={{ color:C.text }}>{addCreditsUser.name}</strong></p>
            <p style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Créditos actuales: <strong style={{ color:C.green }}>{addCreditsUser.creditsBalance||0}</strong></p>
            <Field label="Cantidad de créditos a agregar">
              <input type="number" style={inputSt} min={1} value={creditsAmt} onChange={e=>setCreditsAmt(Number(e.target.value))} />
            </Field>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {[50,100,200,500].map(n=><button key={n} onClick={()=>setCreditsAmt(n)} style={{ flex:1, padding:"7px 0", background:`${C.gold}15`, border:`1px solid ${C.gold}33`, color:C.gold, borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:700 }}>{n}</button>)}
            </div>
            <Btn onClick={()=>addCredits(addCreditsUser.id)}>✓ Agregar {creditsAmt} créditos</Btn>
          </div>
        )}
      </Modal>
    </>
  );
}

// ── Pagos ──
function PaymentsSection({ db, save, toast }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all" ? db.payments : db.payments.filter(p=>p.status===filter);
  const paid = db.payments.filter(p=>p.status==="paid");
  const failed = db.payments.filter(p=>p.status==="failed");

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Pagos</h1>
          <p style={{ color:C.muted, fontSize:12 }}>{db.payments.length} transacciones en total</p>
        </div>
        <select style={inputSt} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="paid">Pagados</option>
          <option value="failed">Fallidos</option>
        </select>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard icon="✅" label="Cobrado" value={`$${paid.reduce((a,p)=>a+p.amount,0)}`} sub={`${paid.length} transacciones`} color={C.green} />
        <StatCard icon="❌" label="Fallidos" value={`${failed.length}`} sub={`$${failed.reduce((a,p)=>a+p.amount,0)} perdidos`} color={C.red} />
        <StatCard icon="📊" label="Tasa éxito" value={`${db.payments.length?Math.round((paid.length/db.payments.length)*100):0}%`} color={C.gold} />
      </div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
              {["ID","Cliente","Plan","Monto","Tipo","Fecha","Estado",""].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"11px 14px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>{
              const u = db.users.find(u=>u.id===p.userId);
              return (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:"10px 14px", fontSize:10, color:C.muted, fontFamily:"monospace" }}>{p.id}</td>
                  <td style={{ padding:"10px 14px", fontSize:12 }}>{u?.name||"—"}</td>
                  <td style={{ padding:"10px 14px" }}><PlanPill planId={p.plan} plans={db.plans} /></td>
                  <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:p.status==="paid"?C.gold:C.red }}>${p.amount}</td>
                  <td style={{ padding:"10px 14px" }}><Pill color={p.type==="credits"?C.green:C.indigo}>{p.type==="credits"?"Créditos":"Suscripción"}</Pill></td>
                  <td style={{ padding:"10px 14px", fontSize:11, color:C.muted }}>{p.date}</td>
                  <td style={{ padding:"10px 14px" }}><StatusPill status={p.status} /></td>
                  <td style={{ padding:"10px 14px" }}>
                    {p.status==="failed" && (
                      <Btn small onClick={()=>{
                        const np = db.payments.map(pay=>pay.id===p.id?{...pay,status:"paid"}:pay);
                        save({...db,payments:np}); toast("Pago marcado como cobrado");
                      }}>Marcar pagado</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Planes ──
function PlansSection({ db, save, toast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (plan) => { setEditing(plan.id); setForm({...plan}); };
  const saveEdit = () => {
    const newPlans = db.plans.map(p=>p.id===editing?{...p,...form,price:Number(form.price),certs:form.certs===999999||form.certs==="999999"?999999:Number(form.certs)}:p);
    save({...db,plans:newPlans}); toast("Plan actualizado ✓"); setEditing(null);
  };
  const toggleActive = (id) => {
    const newPlans = db.plans.map(p=>p.id===id?{...p,active:!p.active}:p);
    save({...db,plans:newPlans}); toast("Visibilidad actualizada");
  };

  return (
    <>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Gestión de planes</h1>
        <p style={{ color:C.muted, fontSize:12 }}>Editá precios, límites y características. Los cambios se reflejan en la landing inmediatamente.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
        {db.plans.map(plan=>{
          const userCount = db.users.filter(u=>u.plan===plan.id).length;
          const planMRR = db.users.filter(u=>u.plan===plan.id&&u.status==="active").length * plan.price;
          return (
            <div key={plan.id} style={{ background:C.card, border:`2px solid ${plan.active?plan.color+"44":C.border}`, borderRadius:14, padding:22, opacity:plan.active?1:0.55 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <h3 style={{ fontSize:15, fontWeight:800 }}>{plan.name}</h3>
                    {!plan.active && <Pill color={C.muted}>Oculto</Pill>}
                  </div>
                  <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{plan.id}</p>
                </div>
                <Pill color={plan.color}>{plan.price===0?"Gratis":`$${plan.price}/mes`}</Pill>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {[
                  ["Certificados/mes", plan.certs>=999999?"Ilimitados":plan.certs],
                  ["Clientes activos", userCount],
                  ["MRR generado", `$${planMRR}`],
                  ["PDF", plan.pdf?"✓ Sí":"✗ No"],
                  ["Marca de agua", plan.watermark?"✓ Sí":"✗ No"],
                  ["Asistente IA", plan.aiAccess?"✓ Sí":"✗ No"],
                  ["Lote CSV", plan.lote?"✓ Sí":"✗ No"],
                ].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 10px", background:C.surface, borderRadius:7 }}>
                    <span style={{ fontSize:11, color:C.muted }}>{l}</span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={()=>openEdit(plan)}>✏️ Editar</Btn>
                <Btn outline color={plan.active?C.red:C.green} onClick={()=>toggleActive(plan.id)}>{plan.active?"Ocultar":"Mostrar"}</Btn>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal edición */}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={`Editar plan — ${db.plans.find(p=>p.id===editing)?.name}`} width={500}>
        {editing && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Nombre del plan">
                <input style={inputSt} value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} />
              </Field>
              <Field label="Precio (USD/mes)">
                <input type="number" style={inputSt} min={0} value={form.price||0} onChange={e=>setForm({...form,price:e.target.value})} />
              </Field>
              <Field label="Certificados/mes (999999 = ilimitado)">
                <input type="number" style={inputSt} value={form.certs||0} onChange={e=>setForm({...form,certs:e.target.value})} />
              </Field>
              <Field label="Color (hex)">
                <div style={{ display:"flex", gap:8 }}>
                  <input type="color" value={form.color||"#64748b"} onChange={e=>setForm({...form,color:e.target.value})} style={{ width:40, height:38, borderRadius:6, border:`1px solid ${C.border}`, cursor:"pointer", background:"none" }} />
                  <input style={{ ...inputSt, flex:1 }} value={form.color||""} onChange={e=>setForm({...form,color:e.target.value})} />
                </div>
              </Field>
            </div>
            <Divider label="Características" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[["pdf","Descarga PDF"],["aiAccess","Asistente IA"],["lote","Lote CSV"],["qr","Verificación QR"],["watermark","Marca de agua"]].map(([k,l])=>(
                <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:12 }}>
                  <input type="checkbox" checked={!!form[k]} onChange={e=>setForm({...form,[k]:e.target.checked})} style={{ accentColor:C.gold, width:15, height:15 }} />
                  <span style={{ color:C.muted }}>{l}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={saveEdit}>✓ Guardar cambios</Btn>
              <Btn outline color={C.muted} onClick={()=>setEditing(null)}>Cancelar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ── Créditos ──
function CreditsSection({ db, save, toast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  return (
    <>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Paquetes de créditos</h1>
        <p style={{ color:C.muted, fontSize:12 }}>Créditos adicionales que los usuarios pueden comprar sin cambiar de plan.</p>
      </div>

      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:28 }}>
        {db.credits.map(cr=>(
          <div key={cr.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:22, minWidth:180 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{cr.label}</div>
            <div style={{ fontSize:28, fontWeight:900, color:C.gold, marginBottom:14 }}>${cr.price}</div>
            <Btn small onClick={()=>{setEditing(cr.id);setForm({...cr});}}>✏️ Editar</Btn>
          </div>
        ))}
        <div onClick={()=>{
          const newId = `c${Date.now()}`;
          const newCr = [...db.credits, {id:newId, label:"100 certificados", price:5}];
          save({...db,credits:newCr}); toast("Paquete creado");
        }} style={{ background:"transparent", border:`2px dashed ${C.border}`, borderRadius:12, padding:22, minWidth:180, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6 }}>
          <span style={{ fontSize:22, color:C.muted }}>+</span>
          <span style={{ fontSize:12, color:C.muted }}>Nuevo paquete</span>
        </div>
      </div>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Editar paquete" width={340}>
        {editing && (
          <div>
            <Field label="Descripción (ej: 50 certificados)">
              <input style={inputSt} value={form.label||""} onChange={e=>setForm({...form,label:e.target.value})} />
            </Field>
            <Field label="Precio (USD)">
              <input type="number" style={inputSt} min={1} value={form.price||0} onChange={e=>setForm({...form,price:Number(e.target.value)})} />
            </Field>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <Btn onClick={()=>{ const nc=db.credits.map(c=>c.id===editing?{...form}:c); save({...db,credits:nc}); toast("Paquete actualizado"); setEditing(null); }}>✓ Guardar</Btn>
              <Btn danger onClick={()=>{ const nc=db.credits.filter(c=>c.id!==editing); save({...db,credits:nc}); toast("Paquete eliminado","info"); setEditing(null); }}>Eliminar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ── Ajustes ──
function SettingsSection({ db, save, toast }) {
  const [form, setForm] = useState({...db.settings});

  const saveSettings = () => { save({...db,settings:form}); toast("Ajustes guardados ✓"); };

  return (
    <>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Ajustes del sistema</h1>
        <p style={{ color:C.muted, fontSize:12 }}>Configuración global de tu SaaS</p>
      </div>

      <div style={{ maxWidth:580 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:16 }}>
          <Divider label="General" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Nombre del sitio"><input style={inputSt} value={form.siteName} onChange={e=>setForm({...form,siteName:e.target.value})} /></Field>
            <Field label="País"><input style={inputSt} value={form.country} onChange={e=>setForm({...form,country:e.target.value})} /></Field>
            <Field label="Moneda"><input style={inputSt} value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} /></Field>
            <Field label="Descuento anual (%)"><input type="number" style={inputSt} min={0} max={50} value={form.annualDiscount} onChange={e=>setForm({...form,annualDiscount:Number(e.target.value)})} /></Field>
          </div>

          <Divider label="Demo" />
          <Field label={`Límite de certificados en demo (actualmente: ${form.demoLimit})`}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <input type="range" min={1} max={20} value={form.demoLimit} onChange={e=>setForm({...form,demoLimit:Number(e.target.value)})} style={{ flex:1, accentColor:C.gold }} />
              <span style={{ fontSize:16, fontWeight:800, color:C.gold, minWidth:30, textAlign:"center" }}>{form.demoLimit}</span>
            </div>
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Cuántos certificados puede generar un usuario en modo demo antes del paywall.</p>
          </Field>

          <Divider label="Contacto" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Email de soporte"><input style={inputSt} value={form.supportEmail} onChange={e=>setForm({...form,supportEmail:e.target.value})} /></Field>
            <Field label="WhatsApp"><input style={inputSt} value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} /></Field>
          </div>
        </div>

        <div style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"14px 18px", marginBottom:18 }}>
          <p style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:3 }}>💡 Próximamente</p>
          <p style={{ fontSize:11, color:C.muted }}>Integración con MercadoPago · Stripe · Reportes en PDF · Emails automáticos de bienvenida y factura.</p>
        </div>

        <Btn onClick={saveSettings}>✓ Guardar todos los ajustes</Btn>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing"); // landing | admin | demo
  const [db, setDb] = useState(loadDB);

  return (
    <>
      <style>{`*{margin:0;padding:0;box-sizing:border-box} body{background:#060d1a} input[type=range]{accent-color:#c8952e} input[type=checkbox]{accent-color:#c8952e}`}</style>
      {view==="landing" && <Landing db={db} onAdmin={()=>setView("admin")} onDemo={()=>setView("demo")} />}
      {view==="admin"   && <Admin   db={db} setDb={setDb} onBack={()=>setView("landing")} />}
      {view==="demo"    && <DemoApp db={db} onBack={()=>setView("landing")} />}
    </>
  );
}
