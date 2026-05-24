import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
function getColors(dark) {
  return dark ? {
    bg: "#060d1a", surface: "#0b1120", card: "#0f172a",
    border: "#1e293b", border2: "#334155",
    text: "#f1f5f9", textSub: "#cbd5e1", muted: "#64748b",
    gold: "#c8952e", goldLight: "#d4a843",
    indigo: "#6366f1", green: "#22c55e", red: "#ef4444",
    navBg: "#060d1aee", inputBg: "#0b1120",
    shadow: "0 4px 24px rgba(0,0,0,0.5)",
  } : {
    bg: "#f8fafc", surface: "#ffffff", card: "#ffffff",
    border: "#e2e8f0", border2: "#cbd5e1",
    text: "#0f172a", textSub: "#334155", muted: "#64748b",
    gold: "#b07d1a", goldLight: "#c8952e",
    indigo: "#4f46e5", green: "#16a34a", red: "#dc2626",
    navBg: "#f8fafc",  inputBg: "#f1f5f9",
    shadow: "0 4px 24px rgba(0,0,0,0.08)",
  };
}

// ─── LOCAL DB ─────────────────────────────────────────────────────────────────
const DB_KEY = "certpy_v3";
const USERS_KEY = "certpy_accounts";

const INITIAL_DB = {
  plans: [
    { id:"demo",       name:"Demo",          price:0,  period:"mes", color:"#64748b", certs:5,      badge:null,            aiAccess:false, pdf:false, watermark:true,  lote:false, qr:false, active:true  },
    { id:"pro",        name:"Profesional",   price:9,  period:"mes", color:"#c8952e", certs:100,    badge:"MÁS POPULAR",   aiAccess:true,  pdf:true,  watermark:false, lote:true,  qr:true,  active:true  },
    { id:"enterprise", name:"Institucional", price:29, period:"mes", color:"#6366f1", certs:999999, badge:"PARA EMPRESAS",  aiAccess:true,  pdf:true,  watermark:false, lote:true,  qr:true,  active:true  },
  ],
  credits: [
    { id:"c50",  label:"50 certificados",  price:3  },
    { id:"c200", label:"200 certificados", price:9  },
    { id:"c500", label:"500 certificados", price:19 },
  ],
  customers: [
    { id:"u1", name:"María González",  email:"maria@colegio.edu.py",  plan:"enterprise", certsUsed:412,  creditsBalance:0,   joined:"2025-01-15", status:"active",    totalPaid:116 },
    { id:"u2", name:"Carlos Benítez",  email:"carlos@ifp.gov.py",     plan:"pro",        certsUsed:89,   creditsBalance:50,  joined:"2025-03-02", status:"active",    totalPaid:27  },
    { id:"u3", name:"Laura Martínez",  email:"laura@gmail.com",       plan:"demo",       certsUsed:5,    creditsBalance:0,   joined:"2025-04-10", status:"active",    totalPaid:0   },
    { id:"u4", name:"Instituto SENAC", email:"admin@senac.edu.py",    plan:"enterprise", certsUsed:1240, creditsBalance:200, joined:"2024-11-20", status:"active",    totalPaid:174 },
    { id:"u5", name:"Pedro Ramírez",   email:"pedro@corp.com",        plan:"pro",        certsUsed:67,   creditsBalance:0,   joined:"2025-02-28", status:"suspended", totalPaid:18  },
    { id:"u6", name:"UNA Facultad",    email:"certs@una.py",          plan:"enterprise", certsUsed:892,  creditsBalance:0,   joined:"2024-09-05", status:"active",    totalPaid:261 },
    { id:"u7", name:"Roberto López",   email:"rlopez@empresa.com",    plan:"pro",        certsUsed:44,   creditsBalance:0,   joined:"2025-04-22", status:"active",    totalPaid:9   },
    { id:"u8", name:"Ana Flores",      email:"ana@flores.com",        plan:"demo",       certsUsed:3,    creditsBalance:0,   joined:"2025-05-01", status:"active",    totalPaid:0   },
  ],
  payments: [
    { id:"PAY-001", custId:"u1", plan:"enterprise", amount:29, date:"2025-05-01", status:"paid",   type:"subscription" },
    { id:"PAY-002", custId:"u2", plan:"pro",        amount:9,  date:"2025-05-01", status:"paid",   type:"subscription" },
    { id:"PAY-003", custId:"u4", plan:"enterprise", amount:29, date:"2025-05-01", status:"paid",   type:"subscription" },
    { id:"PAY-004", custId:"u6", plan:"enterprise", amount:29, date:"2025-05-01", status:"paid",   type:"subscription" },
    { id:"PAY-005", custId:"u5", plan:"pro",        amount:9,  date:"2025-04-01", status:"failed", type:"subscription" },
    { id:"PAY-006", custId:"u2", plan:"pro",        amount:9,  date:"2025-04-01", status:"paid",   type:"credits", creditsQty:50 },
    { id:"PAY-007", custId:"u4", plan:"enterprise", amount:29, date:"2025-04-01", status:"paid",   type:"subscription" },
    { id:"PAY-008", custId:"u6", plan:"enterprise", amount:29, date:"2025-04-01", status:"paid",   type:"subscription" },
  ],
  stats: [
    { month:"Nov", revenue:87,  users:12, certs:320  },
    { month:"Dic", revenue:116, users:18, certs:540  },
    { month:"Ene", revenue:174, users:26, certs:890  },
    { month:"Feb", revenue:203, users:34, certs:1100 },
    { month:"Mar", revenue:261, users:41, certs:1450 },
    { month:"Abr", revenue:318, users:52, certs:1980 },
    { month:"May", revenue:376, users:61, certs:2640 },
  ],
  settings: {
    siteName:"CertificaPy", country:"Paraguay", currency:"USD",
    annualDiscount:17, demoLimit:5,
    supportEmail:"soporte@certificapy.com.py", whatsapp:"+595 981 123456",
    adminPassword:"admin123",
  },
};

const INITIAL_ACCOUNTS = [
  { id:"acc1", email:"admin@certpy.com", password:"admin123", name:"Administrador", role:"admin" },
];

function loadDB()  { try { const r = localStorage.getItem(DB_KEY);    if(r) return JSON.parse(r); } catch{} return JSON.parse(JSON.stringify(INITIAL_DB)); }
function saveDB(d) { try { localStorage.setItem(DB_KEY, JSON.stringify(d)); } catch{} }
function loadAccounts()  { try { const r = localStorage.getItem(USERS_KEY); if(r) return JSON.parse(r); } catch{} return JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)); }
function saveAccounts(a) { try { localStorage.setItem(USERS_KEY, JSON.stringify(a)); } catch{} }

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Pill({ color, children }) {
  return <span style={{ background:`${color}22`, border:`1px solid ${color}55`, color, borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{children}</span>;
}
function StatusPill({ status }) {
  const m = { active:["#22c55e","Activo"], suspended:["#ef4444","Suspendido"], paid:["#22c55e","Pagado"], failed:["#ef4444","Fallido"] };
  const [c,l] = m[status]||["#64748b",status];
  return <Pill color={c}>{l}</Pill>;
}
function PlanPill({ planId, plans }) {
  const p = plans?.find(p=>p.id===planId);
  return <Pill color={p?.color||"#64748b"}>{p?.name||planId}</Pill>;
}

function StatCard({ icon, label, value, sub, color, trend, C }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", flex:1, minWidth:150, boxShadow:C.shadow }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:color||C.gold }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{sub}</div>}
      {trend && <div style={{ fontSize:11, color:C.green, marginTop:3 }}>↑ {trend}</div>}
    </div>
  );
}

function MiniBar({ data, field, color, C }) {
  const max = Math.max(...data.map(d=>d[field]));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:52 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ width:"100%", background:`${color}cc`, borderRadius:"3px 3px 0 0", height:`${(d[field]/max)*48}px` }} />
          <span style={{ fontSize:7, color:C.muted }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children, width=480, C }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }} onClick={onClose}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, width, maxWidth:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:C.shadow }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:C.text }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:22 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toasts({ items }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:9999, pointerEvents:"none" }}>
      {items.map(t => (
        <div key={t.id} style={{ padding:"10px 16px", borderRadius:8, fontSize:12, fontWeight:600, background:t.type==="error"?"#7f1d1d":t.type==="info"?"#1e3a5f":"#14532d", border:`1px solid ${t.type==="error"?"#ef4444":t.type==="info"?"#3b82f6":"#22c55e"}`, color:"#f1f5f9", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [items, setItems] = useState([]);
  const add = (msg, type="success") => {
    const id = Date.now();
    setItems(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setItems(p=>p.filter(t=>t.id!==id)), 3000);
  };
  return { items, add };
}

function ThemeToggle({ C }) {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} title={dark?"Modo claro":"Modo oscuro"} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", cursor:"pointer", fontSize:16, color:C.text, transition:"all 0.2s" }}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function Login({ onLogin, onBack, C }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { dark } = useTheme();

  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:14, padding:"11px 14px", outline:"none", width:"100%", boxSizing:"border-box" };

  const handleLogin = () => {
    setError(""); setSuccess("");
    const accounts = loadAccounts();
    const acc = accounts.find(a=>a.email===email && a.password===password);
    if (!acc) { setError("Email o contraseña incorrectos."); return; }
    onLogin(acc);
  };

  const handleRegister = () => {
    setError(""); setSuccess("");
    if (!name || !email || !password) { setError("Completá todos los campos."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    const accounts = loadAccounts();
    if (accounts.find(a=>a.email===email)) { setError("Ya existe una cuenta con ese email."); return; }
    const newAcc = { id:`acc${Date.now()}`, email, password, name, role:"user" };
    saveAccounts([...accounts, newAcc]);
    setSuccess("¡Cuenta creada! Podés iniciar sesión.");
    setMode("login");
  };

  const handleForgot = () => {
    setError(""); setSuccess("");
    const accounts = loadAccounts();
    if (!accounts.find(a=>a.email===email)) { setError("No existe cuenta con ese email."); return; }
    setSuccess("Si ese email existe, recibirás instrucciones. (Demo: contraseña no cambia)");
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      <div style={{ position:"fixed", top:20, right:20 }}><ThemeToggle C={C} /></div>

      <div style={{ width:420, maxWidth:"100%" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 12px" }}>🏅</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:C.text, marginBottom:4 }}>CertificaPy</h1>
          <p style={{ fontSize:13, color:C.muted }}>
            {mode==="login" ? "Iniciá sesión para continuar" : mode==="register" ? "Creá tu cuenta gratuita" : "Recuperar contraseña"}
          </p>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, boxShadow:C.shadow }}>

          {/* Tabs login/register */}
          {mode !== "forgot" && (
            <div style={{ display:"flex", gap:0, marginBottom:24, borderRadius:10, overflow:"hidden", border:`1px solid ${C.border}` }}>
              {[["login","Iniciar sesión"],["register","Crear cuenta"]].map(([m,l])=>(
                <button key={m} onClick={()=>{setMode(m);setError("");setSuccess("");}} style={{ flex:1, padding:"10px 0", background:mode===m?`linear-gradient(135deg,${C.gold},${C.goldLight})`:C.inputBg, border:"none", color:mode===m?"#1a0f00":C.muted, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>{l}</button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && (
              <div>
                <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:5 }}>Nombre completo</label>
                <input style={inp} placeholder="Tu nombre" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:5 }}>Correo electrónico</label>
              <input type="email" style={inp} placeholder="correo@ejemplo.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <label style={{ fontSize:12, color:C.muted }}>Contraseña</label>
                  {mode==="login" && <button onClick={()=>{setMode("forgot");setError("");setSuccess("");}} style={{ fontSize:12, color:C.gold, background:"none", border:"none", cursor:"pointer" }}>¿Olvidaste?</button>}
                </div>
                <input type="password" style={inp} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())} />
              </div>
            )}
          </div>

          {/* Errors / success */}
          {error   && <div style={{ marginTop:14, padding:"10px 14px", background:"#7f1d1d33", border:"1px solid #ef444466", borderRadius:8, fontSize:12, color:"#fca5a5" }}>{error}</div>}
          {success && <div style={{ marginTop:14, padding:"10px 14px", background:"#14532d33", border:"1px solid #22c55e66", borderRadius:8, fontSize:12, color:"#86efac" }}>{success}</div>}

          {/* Action button */}
          <button
            onClick={mode==="login"?handleLogin:mode==="register"?handleRegister:handleForgot}
            style={{ marginTop:20, width:"100%", padding:"13px 0", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:10, color:"#1a0f00", fontWeight:800, fontSize:14, cursor:"pointer" }}>
            {mode==="login" ? "Iniciar sesión →" : mode==="register" ? "Crear cuenta →" : "Enviar instrucciones"}
          </button>

          {mode==="forgot" && (
            <button onClick={()=>{setMode("login");setError("");setSuccess("");}} style={{ marginTop:12, width:"100%", padding:"10px 0", background:"transparent", border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, fontSize:13, cursor:"pointer" }}>
              ← Volver al login
            </button>
          )}

          {/* Demo hint */}
          {mode==="login" && (
            <div style={{ marginTop:18, padding:"10px 14px", background:`${C.gold}10`, border:`1px solid ${C.gold}33`, borderRadius:8 }}>
              <p style={{ fontSize:11, color:C.gold, fontWeight:700, marginBottom:2 }}>💡 Demo admin</p>
              <p style={{ fontSize:11, color:C.muted }}>Email: <strong style={{color:C.text}}>admin@certpy.com</strong> · Contraseña: <strong style={{color:C.text}}>admin123</strong></p>
            </div>
          )}
        </div>

        <button onClick={onBack} style={{ display:"block", margin:"16px auto 0", background:"none", border:"none", color:C.muted, fontSize:12, cursor:"pointer" }}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ db, onLogin, onDemo, C }) {
  const [annual, setAnnual] = useState(false);
  const [hov, setHov] = useState(null);
  const s = db.settings;
  const activePlans = db.plans.filter(p=>p.active);

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:C.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏅</div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.02em", color:C.text }}>{s.siteName}</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <a href="#pricing" style={{ fontSize:12, color:C.muted, textDecoration:"none", padding:"7px 12px" }}>Precios</a>
          <ThemeToggle C={C} />
          <button onClick={onLogin} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}>Ingresar</button>
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
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,60px)", fontWeight:800, lineHeight:1.1, marginBottom:18, color:C.text }}>
          Emití certificados<br /><span style={{ color:C.gold }}>profesionales</span> en segundos
        </h1>
        <p style={{ fontSize:16, color:C.muted, maxWidth:500, margin:"0 auto 36px", lineHeight:1.7 }}>
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
        <div style={{ display:"flex", gap:32, justifyContent:"center", marginTop:56, flexWrap:"wrap" }}>
          {[["2,640+","Certificados emitidos"],["61","Instituciones activas"],["99.9%","Uptime garantizado"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:C.gold }}>{n}</div>
              <div style={{ fontSize:12, color:C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"50px 40px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, marginBottom:36, color:C.text }}>Todo lo que necesitás</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16 }}>
          {[["🤖","Asistente IA","La IA genera el texto formal del certificado desde una descripción simple."],
            ["🎨","Editor visual","Personalizá colores, fuentes, bordes y sello en tiempo real."],
            ["📦","Generación en lote","Subí un CSV con 1.000 nombres y generá todos de una vez."],
            ["🔐","Verificación QR","Código QR único por certificado para verificar autenticidad."],
            ["📄","PDF de calidad","A4 landscape listo para imprimir con resolución profesional."],
            ["🏢","Multi-institución","Gestioná múltiples instituciones desde una cuenta Institucional."]
          ].map(([i,t,d])=>(
            <div key={t} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:C.shadow }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{i}</div>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:6, color:C.text }}>{t}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:"50px 40px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, marginBottom:6, color:C.text }}>Planes y precios</h2>
        <p style={{ textAlign:"center", color:C.muted, marginBottom:28, fontSize:13 }}>Empezá gratis, escalá cuando necesites</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:32 }}>
          <span style={{ fontSize:12, color:annual?C.muted:C.text, fontWeight:annual?400:700 }}>Mensual</span>
          <div onClick={()=>setAnnual(!annual)} style={{ width:44, height:24, background:annual?C.gold:C.border2, borderRadius:12, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
            <div style={{ position:"absolute", top:2, left:annual?20:2, width:20, height:20, background:"white", borderRadius:10, transition:"left 0.2s" }} />
          </div>
          <span style={{ fontSize:12, color:annual?C.text:C.muted, fontWeight:annual?700:400 }}>Anual</span>
          {annual && <Pill color={C.green}>{s.annualDiscount}% descuento</Pill>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18 }}>
          {activePlans.map(plan=>{
            const price = annual&&plan.price>0 ? Math.round(plan.price*(1-s.annualDiscount/100)) : plan.price;
            const isPro = plan.id==="pro";
            const isH = hov===plan.id;
            return (
              <div key={plan.id} onMouseEnter={()=>setHov(plan.id)} onMouseLeave={()=>setHov(null)}
                style={{ background:isPro?`linear-gradient(160deg,${C.card},${C.surface})`:C.card, border:`2px solid ${isPro||isH?plan.color:C.border}`, borderRadius:16, padding:26, display:"flex", flexDirection:"column", gap:16, transition:"all 0.2s", transform:isPro||isH?"translateY(-4px)":"none", position:"relative", overflow:"hidden", boxShadow:isPro||isH?C.shadow:"none" }}>
                {isPro&&<div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${C.gold}10, transparent 60%)`, pointerEvents:"none" }} />}
                {plan.badge&&<div style={{ position:"absolute", top:14, right:14 }}><Pill color={plan.color}>{plan.badge}</Pill></div>}
                <div>
                  <h3 style={{ fontSize:17, fontWeight:800, color:C.text, marginBottom:3 }}>{plan.name}</h3>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:36, fontWeight:900, color:plan.price===0?C.muted:plan.color }}>{plan.price===0?"Free":`$${price}`}</span>
                    {plan.price>0&&<span style={{ fontSize:12, color:C.muted }}>{s.currency}/{plan.period}</span>}
                  </div>
                  <p style={{ fontSize:11, color:C.muted }}>
                    {plan.certs>=999999?"Ilimitados":`${plan.certs} certs`}/mes
                    {plan.id==="demo"&&<span style={{ color:"#f59e0b" }}> · Solo pruebas</span>}
                  </p>
                </div>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, flex:1 }}>
                  {[[true,`${plan.certs>=999999?"Ilimitados":plan.certs} certificados/mes`],[plan.pdf,"Descarga PDF"],[!plan.watermark,"Sin marca de agua"],[plan.aiAccess,"Asistente IA"],[plan.lote,"Lote CSV"],[plan.qr,"Verificación QR"]].map(([ok,txt],i)=>(
                    <li key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:ok?C.text:C.muted, opacity:ok?1:0.5 }}>
                      <span style={{ color:ok?C.green:C.red }}>{ok?"✓":"✗"}</span>{txt}
                    </li>
                  ))}
                </ul>
                <button onClick={onDemo} style={{ padding:"11px 0", borderRadius:9, border:"none", cursor:"pointer", fontWeight:800, fontSize:12, background:isPro?`linear-gradient(135deg,${C.gold},${C.goldLight})`:`${plan.color}22`, color:isPro?"#1a0f00":plan.color, border:isPro?"none":`1px solid ${plan.color}44` }}>
                  {plan.price===0?`Probar (${s.demoLimit} certs)`:"Empezar ahora"} →
                </button>
              </div>
            );
          })}
        </div>
        {/* Créditos extra */}
        <div style={{ marginTop:24, background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", boxShadow:C.shadow }}>
          <div style={{ fontSize:28 }}>⚡</div>
          <div style={{ flex:1, minWidth:160 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:3 }}>Créditos adicionales</h3>
            <p style={{ fontSize:12, color:C.muted }}>¿Se acabaron? Comprá extra sin cambiar de plan.</p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {db.credits.map(cr=>(
              <div key={cr.id} style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"10px 16px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:C.muted }}>{cr.label}</div>
                <div style={{ fontSize:17, fontWeight:900, color:C.gold }}>${cr.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"24px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginTop:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22, height:22, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>🏅</div>
          <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{s.siteName}</span>
        </div>
        <span style={{ fontSize:11, color:C.muted }}>© 2025 {s.siteName} · Hecho en {s.country} 🇵🇾 · {s.supportEmail}</span>
        <div style={{ display:"flex", gap:14 }}>
          {["Términos","Privacidad","Contacto"].map(l=><a key={l} href="#" style={{ fontSize:11, color:C.muted, textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

// ─── DEMO APP ─────────────────────────────────────────────────────────────────
function DemoApp({ db, onBack, C }) {
  const limit = db.settings.demoLimit;
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Juan Carlos López");
  const [course, setCourse] = useState("Desarrollo Web Full Stack");
  const [list, setList] = useState([]);
  const remaining = limit - count;
  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, padding:"10px 12px", outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      {/* Topbar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:26, height:26, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🏅</div>
          <span style={{ fontWeight:800, fontSize:14, color:C.text }}>{db.settings.siteName}</span>
          <Pill color="#f59e0b">MODO DEMO</Pill>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:C.muted }}>Certificados: <strong style={{ color:remaining>0?C.green:C.red }}>{count}/{limit}</strong></span>
          <ThemeToggle C={C} />
          <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${C.border2}`, color:C.muted, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12 }}>← Volver</button>
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"36px 20px" }}>
        {/* Paywall */}
        {remaining<=0 ? (
          <div style={{ background:"#7f1d1d22", border:"1px solid #ef444466", borderRadius:12, padding:"28px 24px", textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔒</div>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:6, color:C.text }}>Límite del demo alcanzado</h3>
            <p style={{ fontSize:13, color:C.muted, marginBottom:18 }}>Usaste los {limit} certificados de prueba. Activá un plan para continuar.</p>
            <button onClick={onBack} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:10, color:"#1a0f00", padding:"12px 28px", cursor:"pointer", fontWeight:800, fontSize:13 }}>Ver planes →</button>
          </div>
        ) : (
          <div style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"11px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
            <span>⚡</span>
            <span style={{ fontSize:12, color:C.gold }}>Demo — te quedan <strong>{remaining}</strong> certificado{remaining!==1?"s":""} de {limit}.</span>
          </div>
        )}

        {/* Editor */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:26, marginBottom:20, boxShadow:C.shadow }}>
          <h2 style={{ fontSize:15, fontWeight:800, marginBottom:18, color:C.text }}>✏️ Editor de certificado</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Nombre del destinatario</label>
              <input style={inp} value={name} onChange={e=>setName(e.target.value)} disabled={remaining<=0} />
            </div>
            <div>
              <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Nombre del curso</label>
              <input style={inp} value={course} onChange={e=>setCourse(e.target.value)} disabled={remaining<=0} />
            </div>
          </div>
          <div style={{ marginTop:16, display:"flex", gap:10 }}>
            <button disabled={remaining<=0} onClick={()=>{ if(remaining<=0) return; setCount(c=>c+1); setList(l=>[...l,{name,course,id:`DEMO-00${count+1}`}]); }}
              style={{ padding:"10px 20px", background:remaining>0?`linear-gradient(135deg,${C.gold},${C.goldLight})`:`${C.border}`, border:"none", borderRadius:9, color:remaining>0?"#1a0f00":C.muted, fontWeight:800, fontSize:13, cursor:remaining>0?"pointer":"not-allowed" }}>
              📥 Generar PNG
            </button>
            <button disabled style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, cursor:"not-allowed" }}>🔒 PDF (plan de pago)</button>
          </div>
          <p style={{ fontSize:11, color:C.muted, marginTop:10 }}>* El modo demo incluye marca de agua visible.</p>
        </div>

        {/* Preview del certificado */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:20, boxShadow:C.shadow }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.muted, marginBottom:14 }}>Vista previa del certificado</h3>
          <div style={{ position:"relative", background:"#fff", border:"2px solid #1e3a5f", borderRadius:4, padding:"32px 40px", color:"#1a1a2e", textAlign:"center", minHeight:200 }}>
            {/* Watermark */}
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.07, fontSize:18, fontWeight:900, color:"#c8952e", transform:"rotate(-22deg)", letterSpacing:"0.1em", pointerEvents:"none" }}>
              DEMO · {db.settings.siteName.toUpperCase()} · DEMO · {db.settings.siteName.toUpperCase()}
            </div>
            <p style={{ fontSize:10, color:"#64748b", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>República del Paraguay</p>
            <h1 style={{ fontSize:20, fontWeight:800, fontFamily:"serif", color:"#1e3a5f", marginBottom:6 }}>CERTIFICADO</h1>
            <p style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>Se certifica que</p>
            <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"serif", color:"#1e3a5f", borderBottom:"2px solid #c8952e", paddingBottom:4, display:"inline-block", marginBottom:8 }}>{name||"..."}</h2>
            <p style={{ fontSize:11, marginBottom:4 }}>Ha completado satisfactoriamente el curso</p>
            <p style={{ fontSize:13, fontWeight:700, fontFamily:"serif" }}>«{course||"..."}»</p>
            <p style={{ fontSize:9, color:"#64748b", marginTop:12 }}>Emitido el {new Date().toLocaleDateString("es-PY",{day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
        </div>

        {/* Historial */}
        {list.length>0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18, marginBottom:20, boxShadow:C.shadow }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>Generados en esta sesión</h3>
            {list.map((d,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:C.surface, borderRadius:8, marginBottom:6 }}>
                <div><span style={{ fontSize:12, fontWeight:600, color:C.text }}>{d.name}</span><span style={{ fontSize:11, color:C.muted, marginLeft:10 }}>{d.course}</span></div>
                <div style={{ display:"flex", gap:6 }}><Pill color={C.muted}>{d.id}</Pill><Pill color="#f59e0b">+ Marca de agua</Pill></div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {count>0 && (
          <div style={{ background:C.card, border:`2px solid ${C.gold}55`, borderRadius:14, padding:24, textAlign:"center", boxShadow:C.shadow }}>
            <p style={{ fontSize:14, color:C.gold, fontWeight:700, marginBottom:4 }}>¿Te gustó? Activá un plan sin límites</p>
            <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Sin marca de agua · PDF · IA · Lote CSV</p>
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
function Admin({ db, setDb, session, onLogout, onBack, C }) {
  const [sec, setSec] = useState("overview");
  const { items: toasts, add: toast } = useToasts();
  const save = (d) => { setDb(d); saveDB(d); };

  const NAV = [
    { id:"overview", icon:"📊", label:"Resumen"   },
    { id:"customers",icon:"👥", label:"Clientes"  },
    { id:"payments", icon:"💳", label:"Pagos"     },
    { id:"plans",    icon:"📦", label:"Planes"    },
    { id:"credits",  icon:"⚡", label:"Créditos" },
    { id:"settings", icon:"⚙️", label:"Ajustes"  },
  ];

  const mrr = db.customers.filter(u=>u.status==="active"&&u.plan!=="demo").reduce((a,u)=>{ const p=db.plans.find(pl=>pl.id===u.plan); return a+(p?.price||0); },0);
  const totalRev = db.payments.filter(p=>p.status==="paid").reduce((a,p)=>a+p.amount,0);

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, color:C.text, fontFamily:"'Lato','Segoe UI',sans-serif", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{ width:210, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"16px 14px 12px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
            <div style={{ width:26, height:26, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🏅</div>
            <span style={{ fontWeight:800, fontSize:14, color:C.text }}>CertificaPy</span>
          </div>
          <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Panel Admin</span>
          <div style={{ marginTop:8, fontSize:11, color:C.muted }}>👤 {session.name}</div>
        </div>
        <nav style={{ flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSec(n.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:7, background:sec===n.id?`${C.gold}18`:"transparent", border:sec===n.id?`1px solid ${C.gold}33`:"1px solid transparent", color:sec===n.id?C.gold:C.muted, cursor:"pointer", fontSize:12, fontWeight:sec===n.id?700:400, textAlign:"left", transition:"all 0.12s" }}>
              <span style={{ fontSize:13 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px 6px", borderTop:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ padding:"4px 10px" }}><ThemeToggle C={C} /></div>
          <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 10px", background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:11 }}>🏠 Ver sitio</button>
          <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 10px", background:"transparent", border:"none", color:C.red, cursor:"pointer", fontSize:11, fontWeight:700 }}>↩ Cerrar sesión</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:"auto", padding:24 }}>
        {sec==="overview"  && <AdminOverview  db={db} mrr={mrr} totalRev={totalRev} C={C} />}
        {sec==="customers" && <AdminCustomers db={db} save={save} toast={toast} C={C} />}
        {sec==="payments"  && <AdminPayments  db={db} save={save} toast={toast} C={C} />}
        {sec==="plans"     && <AdminPlans     db={db} save={save} toast={toast} C={C} />}
        {sec==="credits"   && <AdminCredits   db={db} save={save} toast={toast} C={C} />}
        {sec==="settings"  && <AdminSettings  db={db} save={save} toast={toast} C={C} />}
      </main>

      <Toasts items={toasts} />
      <style>{`*{box-sizing:border-box} ::-webkit-scrollbar{width:5px;height:5px} ::-webkit-scrollbar-track{background:${C.surface}} ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:3px}`}</style>
    </div>
  );
}

function AdminOverview({ db, mrr, totalRev, C }) {
  const activeUsers = db.customers.filter(u=>u.status==="active").length;
  const totalCerts = db.customers.reduce((a,u)=>a+u.certsUsed,0);
  return (
    <>
      <h1 style={{ fontSize:20, fontWeight:800, marginBottom:4, color:C.text }}>Resumen general</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Mayo 2025</p>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard icon="💰" label="Ingresos totales" value={`$${totalRev}`} sub="Pagos cobrados" color={C.gold} trend="18% vs mes ant." C={C} />
        <StatCard icon="📈" label="MRR" value={`$${mrr}`} sub="Ingresos recurrentes" color={C.green} C={C} />
        <StatCard icon="👥" label="Clientes activos" value={activeUsers} sub={`${db.customers.length} total`} color={C.indigo} C={C} />
        <StatCard icon="📜" label="Certificados" value={totalCerts.toLocaleString()} color="#f59e0b" C={C} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, boxShadow:C.shadow }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:13, color:C.text }}>Ingresos mensuales</span>
            <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>+18%</span>
          </div>
          <MiniBar data={db.stats} field="revenue" color={C.gold} C={C} />
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, boxShadow:C.shadow }}>
          <span style={{ fontWeight:700, fontSize:13, display:"block", marginBottom:14, color:C.text }}>Por plan</span>
          {db.plans.map(p=>{
            const cnt = db.customers.filter(u=>u.plan===p.id).length;
            const pct = db.customers.length ? Math.round((cnt/db.customers.length)*100) : 0;
            return (
              <div key={p.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, color:C.muted }}>{p.name}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:p.color }}>{cnt} ({pct}%)</span>
                </div>
                <div style={{ height:5, background:C.border, borderRadius:3 }}><div style={{ height:"100%", width:`${pct}%`, background:p.color, borderRadius:3 }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, boxShadow:C.shadow }}>
        <span style={{ fontWeight:700, fontSize:13, display:"block", marginBottom:14, color:C.text }}>Últimos pagos</span>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["ID","Cliente","Plan","Monto","Fecha","Estado"].map(h=><th key={h} style={{ textAlign:"left", padding:"6px 10px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>{db.payments.slice(0,6).map(p=>{
            const u=db.customers.find(u=>u.id===p.custId);
            return (<tr key={p.id} style={{ borderBottom:`1px solid ${C.border}22` }}>
              <td style={{ padding:"9px 10px", fontSize:10, color:C.muted, fontFamily:"monospace" }}>{p.id}</td>
              <td style={{ padding:"9px 10px", fontSize:12, color:C.text }}>{u?.name||"—"}</td>
              <td style={{ padding:"9px 10px" }}><PlanPill planId={p.plan} plans={db.plans} /></td>
              <td style={{ padding:"9px 10px", fontSize:13, fontWeight:800, color:p.status==="paid"?C.gold:C.red }}>${p.amount}</td>
              <td style={{ padding:"9px 10px", fontSize:11, color:C.muted }}>{p.date}</td>
              <td style={{ padding:"9px 10px" }}><StatusPill status={p.status} /></td>
            </tr>);
          })}</tbody>
        </table>
      </div>
    </>
  );
}

function AdminCustomers({ db, save, toast, C }) {
  const [search, setSearch] = useState("");
  const [pf, setPf] = useState("all");
  const [sel, setSel] = useState(null);
  const [editU, setEditU] = useState(null);
  const [credU, setCredU] = useState(null);
  const [credAmt, setCredAmt] = useState(50);
  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, padding:"8px 11px", outline:"none", boxSizing:"border-box" };
  const filtered = db.customers.filter(u=>{
    const ms = u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase());
    const mp = pf==="all"||u.plan===pf||u.status===pf;
    return ms&&mp;
  });
  const toggleSt = (id) => { save({...db,customers:db.customers.map(u=>u.id===id?{...u,status:u.status==="active"?"suspended":"active"}:u)}); toast("Estado actualizado"); };
  const changePlan = (id,plan) => { save({...db,customers:db.customers.map(u=>u.id===id?{...u,plan}:u)}); toast(`Plan cambiado`); setEditU(null); };
  const addCredits = (id) => { save({...db,customers:db.customers.map(u=>u.id===id?{...u,creditsBalance:(u.creditsBalance||0)+credAmt}:u)}); toast(`${credAmt} créditos agregados`); setCredU(null); };

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div><h1 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:2 }}>Clientes</h1><p style={{ color:C.muted, fontSize:12 }}>{db.customers.length} registrados</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <input style={{ ...inp, width:200 }} placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select style={inp} value={pf} onChange={e=>setPf(e.target.value)}>
            <option value="all">Todos</option>
            {db.plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:C.shadow }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
            {["Cliente","Plan","Certs","Créditos","Pagado","Estado","Acciones"].map(h=><th key={h} style={{ textAlign:"left", padding:"11px 14px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(u=>(
            <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}22` }}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.border}22`}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold}44,${C.indigo}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0, color:C.text }}>{u.name[0]}</div>
                  <div><div style={{ fontSize:12, fontWeight:600, color:C.text }}>{u.name}</div><div style={{ fontSize:10, color:C.muted }}>{u.email}</div></div>
                </div>
              </td>
              <td style={{ padding:"11px 14px" }}><PlanPill planId={u.plan} plans={db.plans} /></td>
              <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:C.text }}>{u.certsUsed.toLocaleString()}</td>
              <td style={{ padding:"11px 14px", fontSize:12, color:u.creditsBalance>0?C.green:C.muted, fontWeight:700 }}>{u.creditsBalance||0}</td>
              <td style={{ padding:"11px 14px", fontSize:12, color:C.gold, fontWeight:700 }}>${u.totalPaid}</td>
              <td style={{ padding:"11px 14px" }}><StatusPill status={u.status} /></td>
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {[["Ver",()=>setSel(u),C.gold,false],["Plan",()=>setEditU(u),C.gold,true],["+ Cred",()=>{setCredU(u);setCredAmt(50);},C.green,true],["Susp/Act",()=>toggleSt(u.id),u.status==="active"?C.red:C.green,true]].map(([l,fn,color,outline])=>(
                    <button key={l} onClick={fn} style={{ padding:"4px 9px", background:outline?`${color}15`:`linear-gradient(135deg,${color},${color}cc)`, border:`1px solid ${color}44`, color:outline?color:"#1a0f00", borderRadius:6, cursor:"pointer", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{l}</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length===0&&<tr><td colSpan={7} style={{ padding:24, textAlign:"center", color:C.muted, fontSize:12 }}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal detalle */}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||""} C={C}>
        {sel&&<div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[["Email",sel.email],["Plan",<PlanPill planId={sel.plan} plans={db.plans}/>],["Estado",<StatusPill status={sel.status}/>],["Certificados",sel.certsUsed.toLocaleString()],["Créditos extra",sel.creditsBalance||0],["Total pagado",`$${sel.totalPaid}`],["Miembro desde",sel.joined]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:C.surface, borderRadius:8 }}>
              <span style={{ fontSize:11, color:C.muted }}>{l}</span><span style={{ fontSize:13, fontWeight:600, color:C.text }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={()=>{setSel(null);setEditU(sel);}} style={{ flex:1, padding:"10px 0", background:`${C.gold}18`, border:`1px solid ${C.gold}44`, color:C.gold, borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>Cambiar plan</button>
            <button onClick={()=>{toggleSt(sel.id);setSel(null);}} style={{ flex:1, padding:"10px 0", background:"#ef444418", border:"1px solid #ef444433", color:C.red, borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>{sel.status==="active"?"Suspender":"Activar"}</button>
          </div>
        </div>}
      </Modal>

      {/* Modal cambio plan */}
      <Modal open={!!editU} onClose={()=>setEditU(null)} title="Cambiar plan" width={360} C={C}>
        {editU&&<div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:14 }}>Cliente: <strong style={{ color:C.text }}>{editU.name}</strong></p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {db.plans.filter(p=>p.id!==editU.plan).map(p=>(
              <button key={p.id} onClick={()=>changePlan(editU.id,p.id)} style={{ padding:"11px 16px", background:`${p.color}15`, border:`1px solid ${p.color}44`, color:p.color, borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700, textAlign:"left", display:"flex", justifyContent:"space-between" }}>
                <span>{p.name}</span><span style={{ fontSize:12, opacity:0.8 }}>{p.price===0?"Gratis":`$${p.price}/mes`}</span>
              </button>
            ))}
          </div>
        </div>}
      </Modal>

      {/* Modal créditos */}
      <Modal open={!!credU} onClose={()=>setCredU(null)} title="Agregar créditos" width={340} C={C}>
        {credU&&<div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:14 }}>Cliente: <strong style={{ color:C.text }}>{credU.name}</strong> · Actuales: <strong style={{ color:C.green }}>{credU.creditsBalance||0}</strong></p>
          <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Cantidad</label>
          <input type="number" style={{ background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, padding:"9px 11px", outline:"none", width:"100%", boxSizing:"border-box", marginBottom:10 }} min={1} value={credAmt} onChange={e=>setCredAmt(Number(e.target.value))} />
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[50,100,200,500].map(n=><button key={n} onClick={()=>setCredAmt(n)} style={{ flex:1, padding:"7px 0", background:`${C.gold}15`, border:`1px solid ${C.gold}33`, color:C.gold, borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:700 }}>{n}</button>)}
          </div>
          <button onClick={()=>addCredits(credU.id)} style={{ width:"100%", padding:"11px 0", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:9, color:"#1a0f00", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Agregar {credAmt} créditos</button>
        </div>}
      </Modal>
    </>
  );
}

function AdminPayments({ db, save, toast, C }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all"?db.payments:db.payments.filter(p=>p.status===filter);
  const paid = db.payments.filter(p=>p.status==="paid");
  const failed = db.payments.filter(p=>p.status==="failed");
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div><h1 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:2 }}>Pagos</h1><p style={{ color:C.muted, fontSize:12 }}>{db.payments.length} transacciones</p></div>
        <select style={{ background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, padding:"8px 11px", outline:"none" }} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Todos</option><option value="paid">Pagados</option><option value="failed">Fallidos</option>
        </select>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard icon="✅" label="Cobrado" value={`$${paid.reduce((a,p)=>a+p.amount,0)}`} sub={`${paid.length} transacciones`} color={C.green} C={C} />
        <StatCard icon="❌" label="Fallidos" value={failed.length} sub={`$${failed.reduce((a,p)=>a+p.amount,0)} perdidos`} color={C.red} C={C} />
        <StatCard icon="📊" label="Tasa éxito" value={`${db.payments.length?Math.round((paid.length/db.payments.length)*100):0}%`} color={C.gold} C={C} />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:C.shadow }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
            {["ID","Cliente","Plan","Monto","Tipo","Fecha","Estado",""].map(h=><th key={h} style={{ textAlign:"left", padding:"11px 14px", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(p=>{
            const u=db.customers.find(u=>u.id===p.custId);
            return (<tr key={p.id} style={{ borderBottom:`1px solid ${C.border}22` }}>
              <td style={{ padding:"10px 14px", fontSize:10, color:C.muted, fontFamily:"monospace" }}>{p.id}</td>
              <td style={{ padding:"10px 14px", fontSize:12, color:C.text }}>{u?.name||"—"}</td>
              <td style={{ padding:"10px 14px" }}><PlanPill planId={p.plan} plans={db.plans} /></td>
              <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:p.status==="paid"?C.gold:C.red }}>${p.amount}</td>
              <td style={{ padding:"10px 14px" }}><Pill color={p.type==="credits"?C.green:C.indigo}>{p.type==="credits"?"Créditos":"Suscripción"}</Pill></td>
              <td style={{ padding:"10px 14px", fontSize:11, color:C.muted }}>{p.date}</td>
              <td style={{ padding:"10px 14px" }}><StatusPill status={p.status} /></td>
              <td style={{ padding:"10px 14px" }}>
                {p.status==="failed"&&<button onClick={()=>{save({...db,payments:db.payments.map(pay=>pay.id===p.id?{...pay,status:"paid"}:pay)});toast("Marcado como pagado");}} style={{ padding:"4px 10px", background:`${C.green}18`, border:`1px solid ${C.green}44`, color:C.green, borderRadius:6, cursor:"pointer", fontSize:10, fontWeight:700 }}>Marcar pagado</button>}
              </td>
            </tr>);
          })}</tbody>
        </table>
      </div>
    </>
  );
}

function AdminPlans({ db, save, toast, C }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, padding:"9px 11px", outline:"none", width:"100%", boxSizing:"border-box" };
  const openEdit = (p) => { setEditing(p.id); setForm({...p}); };
  const saveEdit = () => { save({...db,plans:db.plans.map(p=>p.id===editing?{...p,...form,price:Number(form.price),certs:Number(form.certs)>=999999?999999:Number(form.certs)}:p)}); toast("Plan actualizado ✓"); setEditing(null); };
  return (
    <>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:2 }}>Gestión de planes</h1>
        <p style={{ color:C.muted, fontSize:12 }}>Cambios reflejados en la landing inmediatamente.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
        {db.plans.map(plan=>{
          const uc=db.customers.filter(u=>u.plan===plan.id).length;
          const mrr=db.customers.filter(u=>u.plan===plan.id&&u.status==="active").length*plan.price;
          return (
            <div key={plan.id} style={{ background:C.card, border:`2px solid ${plan.active?plan.color+"44":C.border}`, borderRadius:14, padding:22, opacity:plan.active?1:0.55, boxShadow:C.shadow }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <h3 style={{ fontSize:15, fontWeight:800, color:C.text }}>{plan.name}</h3>
                    {!plan.active&&<Pill color={C.muted}>Oculto</Pill>}
                  </div>
                  <p style={{ fontSize:10, color:C.muted }}>{plan.id}</p>
                </div>
                <Pill color={plan.color}>{plan.price===0?"Gratis":`$${plan.price}/mes`}</Pill>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
                {[["Certs/mes",plan.certs>=999999?"Ilimitados":plan.certs],["Clientes activos",uc],["MRR generado",`$${mrr}`],["PDF",plan.pdf?"✓":"✗"],["Marca de agua",plan.watermark?"✓":"✗"],["IA",plan.aiAccess?"✓":"✗"],["Lote CSV",plan.lote?"✓":"✗"]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", background:C.surface, borderRadius:7 }}>
                    <span style={{ fontSize:11, color:C.muted }}>{l}</span><span style={{ fontSize:12, fontWeight:600, color:C.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>openEdit(plan)} style={{ flex:1, padding:"9px 0", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:8, color:"#1a0f00", fontWeight:700, fontSize:12, cursor:"pointer" }}>✏️ Editar</button>
                <button onClick={()=>{save({...db,plans:db.plans.map(p=>p.id===plan.id?{...p,active:!p.active}:p)});toast("Visibilidad actualizada");}} style={{ flex:1, padding:"9px 0", background:`${plan.active?C.red:C.green}18`, border:`1px solid ${plan.active?C.red:C.green}44`, color:plan.active?C.red:C.green, borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>{plan.active?"Ocultar":"Mostrar"}</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={`Editar — ${db.plans.find(p=>p.id===editing)?.name||""}`} width={500} C={C}>
        {editing&&<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Nombre","name","text"],["Precio (USD/mes)","price","number"],["Certs/mes (999999=ilim)","certs","number"]].map(([l,k,t])=>(
              <div key={k}><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>{l}</label>
              <input type={t} style={inp} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Color</label>
              <div style={{ display:"flex", gap:8 }}>
                <input type="color" value={form.color||"#64748b"} onChange={e=>setForm({...form,color:e.target.value})} style={{ width:38,height:38,borderRadius:6,border:`1px solid ${C.border}`,cursor:"pointer" }} />
                <input style={inp} value={form.color||""} onChange={e=>setForm({...form,color:e.target.value})} />
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"16px 0" }}>
            {[["pdf","Descarga PDF"],["aiAccess","Asistente IA"],["lote","Lote CSV"],["qr","QR"],["watermark","Marca de agua"]].map(([k,l])=>(
              <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:12, color:C.muted }}>
                <input type="checkbox" checked={!!form[k]} onChange={e=>setForm({...form,[k]:e.target.checked})} style={{ accentColor:C.gold,width:15,height:15 }} />{l}
              </label>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveEdit} style={{ flex:1, padding:"11px 0", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:9, color:"#1a0f00", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Guardar</button>
            <button onClick={()=>setEditing(null)} style={{ padding:"11px 20px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>}
      </Modal>
    </>
  );
}

function AdminCredits({ db, save, toast, C }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, padding:"9px 11px", outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <>
      <h1 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>Paquetes de créditos</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Créditos adicionales que los usuarios pueden comprar.</p>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:28 }}>
        {db.credits.map(cr=>(
          <div key={cr.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:22, minWidth:180, boxShadow:C.shadow }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>{cr.label}</div>
            <div style={{ fontSize:28, fontWeight:900, color:C.gold, marginBottom:14 }}>${cr.price}</div>
            <button onClick={()=>{setEditing(cr.id);setForm({...cr});}} style={{ width:"100%", padding:"8px 0", background:`${C.gold}18`, border:`1px solid ${C.gold}44`, color:C.gold, borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 }}>✏️ Editar</button>
          </div>
        ))}
        <div onClick={()=>{ const n={id:`c${Date.now()}`,label:"100 certificados",price:5}; save({...db,credits:[...db.credits,n]}); toast("Paquete creado"); }} style={{ background:"transparent", border:`2px dashed ${C.border}`, borderRadius:12, padding:22, minWidth:180, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6 }}>
          <span style={{ fontSize:22, color:C.muted }}>+</span>
          <span style={{ fontSize:12, color:C.muted }}>Nuevo paquete</span>
        </div>
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Editar paquete" width={340} C={C}>
        {editing&&<div>
          <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Descripción</label><input style={inp} value={form.label||""} onChange={e=>setForm({...form,label:e.target.value})} /></div>
          <div style={{ marginBottom:16 }}><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Precio (USD)</label><input type="number" style={inp} min={1} value={form.price||0} onChange={e=>setForm({...form,price:Number(e.target.value)})} /></div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{save({...db,credits:db.credits.map(c=>c.id===editing?{...form}:c)});toast("Actualizado");setEditing(null);}} style={{ flex:1, padding:"11px 0", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:9, color:"#1a0f00", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Guardar</button>
            <button onClick={()=>{save({...db,credits:db.credits.filter(c=>c.id!==editing)});toast("Eliminado","info");setEditing(null);}} style={{ padding:"11px 16px", background:"#ef444418", border:"1px solid #ef444433", color:C.red, borderRadius:9, fontSize:12, cursor:"pointer", fontWeight:700 }}>Eliminar</button>
          </div>
        </div>}
      </Modal>
    </>
  );
}

function AdminSettings({ db, save, toast, C }) {
  const [form, setForm] = useState({...db.settings});
  const inp = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, padding:"9px 11px", outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <>
      <h1 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>Ajustes del sistema</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Configuración global del SaaS</p>
      <div style={{ maxWidth:560 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:14, boxShadow:C.shadow }}>
          <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>General</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
            {[["Nombre del sitio","siteName"],["País","country"],["Moneda","currency"]].map(([l,k])=>(
              <div key={k}><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>{l}</label><input style={inp} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Descuento anual (%)</label><input type="number" style={inp} min={0} max={50} value={form.annualDiscount||0} onChange={e=>setForm({...form,annualDiscount:Number(e.target.value)})} /></div>
          </div>
          <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Demo</p>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:8 }}>Límite de certificados en demo: <strong style={{ color:C.gold }}>{form.demoLimit}</strong></label>
            <input type="range" min={1} max={20} value={form.demoLimit||5} onChange={e=>setForm({...form,demoLimit:Number(e.target.value)})} style={{ width:"100%", accentColor:C.gold }} />
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Cuántos certificados puede generar un usuario demo antes del paywall.</p>
          </div>
          <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Contacto</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
            {[["Email soporte","supportEmail"],["WhatsApp","whatsapp"]].map(([l,k])=>(
              <div key={k}><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>{l}</label><input style={inp} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
          </div>
          <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Seguridad admin</p>
          <div><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:5 }}>Contraseña admin demo</label><input type="password" style={inp} value={form.adminPassword||""} onChange={e=>setForm({...form,adminPassword:e.target.value})} /></div>
        </div>
        <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"14px 18px", marginBottom:18 }}>
          <p style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:2 }}>💡 Próximamente</p>
          <p style={{ fontSize:11, color:C.muted }}>Integración MercadoPago · Stripe · Emails automáticos · Reportes PDF</p>
        </div>
        <button onClick={()=>{save({...db,settings:form});toast("Ajustes guardados ✓");}} style={{ padding:"12px 32px", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:"none", borderRadius:10, color:"#1a0f00", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Guardar ajustes</button>
      </div>
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState("landing"); // landing | login | demo | admin
  const [session, setSession] = useState(null);
  const [db, setDb] = useState(loadDB);
  const C = getColors(dark);

  // Persist theme preference
  useEffect(() => {
    try { const t = localStorage.getItem("certpy_theme"); if(t) setDark(t==="dark"); } catch{}
  }, []);
  const toggleTheme = () => {
    setDark(d => { const nd=!d; try{localStorage.setItem("certpy_theme",nd?"dark":"light");}catch{} return nd; });
  };

  const handleLogin = (acc) => {
    setSession(acc);
    setView(acc.role==="admin"?"admin":"landing");
  };
  const handleLogout = () => { setSession(null); setView("landing"); };

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
      <div style={{ margin:0, padding:0 }}>
        <style>{`*{margin:0;padding:0;box-sizing:border-box} body{background:${C.bg}} input[type=range]{accent-color:#c8952e} input[type=checkbox]{accent-color:#c8952e} input,select,textarea{transition:border-color 0.15s} input:focus,select:focus{border-color:#c8952e!important}`}</style>
        {view==="landing" && <Landing  db={db} onLogin={()=>setView("login")} onDemo={()=>setView("demo")} C={C} />}
        {view==="login"   && <Login    onLogin={handleLogin} onBack={()=>setView("landing")} C={C} />}
        {view==="demo"    && <DemoApp  db={db} onBack={()=>setView("landing")} C={C} />}
        {view==="admin"   && session?.role==="admin" && <Admin db={db} setDb={setDb} session={session} onLogout={handleLogout} onBack={()=>setView("landing")} C={C} />}
        {view==="admin"   && !session   && <Login onLogin={handleLogin} onBack={()=>setView("landing")} C={C} />}
      </div>
    </ThemeCtx.Provider>
  );
}
