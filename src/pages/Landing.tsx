import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "mes",
    color: "#64748b",
    badge: null as string | null,
    certs: 5,
    features: [
      { ok: true, text: "5 certificados por mes" },
      { ok: true, text: "3 plantillas básicas" },
      { ok: true, text: "Descarga PNG" },
      { ok: false, text: "Descarga PDF" },
      { ok: false, text: "Sin marca de agua" },
      { ok: false, text: "Asistente IA" },
      { ok: false, text: "Generación en lote CSV" },
      { ok: false, text: "Verificación QR" },
    ],
  },
  {
    id: "pro",
    name: "Profesional",
    price: 9,
    period: "mes",
    color: "#c8952e",
    badge: "MÁS POPULAR",
    certs: 100,
    features: [
      { ok: true, text: "100 certificados por mes" },
      { ok: true, text: "Todas las plantillas" },
      { ok: true, text: "Descarga PNG y PDF" },
      { ok: true, text: "Sin marca de agua" },
      { ok: true, text: "Asistente IA incluido" },
      { ok: true, text: "Generación en lote CSV" },
      { ok: true, text: "Verificación QR" },
      { ok: false, text: "Templates personalizados" },
    ],
  },
  {
    id: "enterprise",
    name: "Institucional",
    price: 29,
    period: "mes",
    color: "#6366f1",
    badge: "PARA EMPRESAS",
    certs: 999999,
    features: [
      { ok: true, text: "Certificados ilimitados" },
      { ok: true, text: "Templates institucionales" },
      { ok: true, text: "Descarga PNG y PDF" },
      { ok: true, text: "Sin marca de agua" },
      { ok: true, text: "IA prioritaria" },
      { ok: true, text: "Lote CSV ilimitado" },
      { ok: true, text: "Verificación QR avanzada" },
      { ok: true, text: "Soporte prioritario" },
    ],
  },
];

const C = {
  bg: "#060d1a",
  surface: "#0b1120",
  card: "#0f172a",
  border: "#1e293b",
  border2: "#334155",
  text: "#f1f5f9",
  muted: "#64748b",
  gold: "#c8952e",
  goldLight: "#d4a843",
  indigo: "#6366f1",
};

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
      {children}
    </span>
  );
}

const Landing = () => {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const onGoApp = () => navigate("/app");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Lato','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing:border-box; } ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#0f172a} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: `${C.bg}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏅</div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>CertificaPy</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/auth"><button style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Ingresar</button></Link>
          <button onClick={onGoApp} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, border: "none", color: "#1a0f00", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
            Empezar gratis →
          </button>
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "100px 40px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: `radial-gradient(ellipse, ${C.gold}18 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.gold}15`, border: `1px solid ${C.gold}33`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ fontSize: 12 }}>✦</span>
          <span style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: "0.06em" }}>PLATAFORMA DE CERTIFICADOS PROFESIONALES</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,5vw,64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em" }}>
          Emití certificados
          <br />
          <span style={{ color: C.gold }}>profesionales</span> en segundos
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Creá, personalizá y verificá certificados con IA. Para instituciones educativas, empresas y profesionales de Paraguay.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onGoApp} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, border: "none", color: "#1a0f00", borderRadius: 10, padding: "14px 32px", cursor: "pointer", fontSize: 15, fontWeight: 800, letterSpacing: "0.02em" }}>
            Empezar gratis
          </button>
          <a href="#pricing" style={{ textDecoration: "none" }}>
            <button style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 10, padding: "14px 32px", cursor: "pointer", fontSize: 15 }}>
              Ver planes ▶
            </button>
          </a>
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}>
          {[["2,640+", "Certificados emitidos"], ["61", "Instituciones activas"], ["99.9%", "Uptime garantizado"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.gold }}>{n}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, marginBottom: 48 }}>
          Todo lo que necesitás
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {[
            ["🤖", "Asistente IA", "Escribí una descripción informal y la IA genera el texto formal del certificado automáticamente."],
            ["🎨", "Editor visual", "Arrastrá sellos, personalizá colores, fuentes y bordes en tiempo real."],
            ["📦", "Generación en lote", "Subí un CSV con 1.000 nombres y generá todos los certificados de una sola vez."],
            ["🔐", "Verificación QR", "Cada certificado tiene un código QR único. Cualquiera puede verificar su autenticidad."],
            ["📄", "PDF de alta calidad", "Descargá en PDF A4 landscape listo para imprimir con resolución profesional."],
            ["🏢", "Multi-institución", "Gestioná múltiples instituciones desde una sola cuenta Enterprise."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }} id="pricing">
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Planes y precios
        </h2>
        <p style={{ textAlign: "center", color: C.muted, marginBottom: 32 }}>Empezá gratis, escalá cuando necesites</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40 }}>
          <span style={{ fontSize: 13, color: billingAnnual ? C.muted : C.text, fontWeight: billingAnnual ? 400 : 700 }}>Mensual</span>
          <div onClick={() => setBillingAnnual(!billingAnnual)} style={{ width: 48, height: 26, background: billingAnnual ? C.gold : C.border2, borderRadius: 13, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: billingAnnual ? 22 : 3, width: 20, height: 20, background: "white", borderRadius: 10, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 13, color: billingAnnual ? C.text : C.muted, fontWeight: billingAnnual ? 700 : 400 }}>Anual</span>
          {billingAnnual && <Badge color="#22c55e">2 meses gratis</Badge>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {PLANS.map((plan) => {
            const price = billingAnnual ? Math.round(plan.price * 0.83) : plan.price;
            const isHovered = hoveredPlan === plan.id;
            const isPro = plan.id === "pro";
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  background: isPro ? `linear-gradient(160deg, #1a1400, #0f0a00)` : C.card,
                  border: `2px solid ${isPro || isHovered ? plan.color : C.border}`,
                  borderRadius: 16,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  transition: "all 0.2s",
                  transform: isPro || isHovered ? "translateY(-4px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {isPro && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${C.gold}12, transparent 60%)`, pointerEvents: "none" }} />}
                {plan.badge && (
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <Badge color={plan.color}>{plan.badge}</Badge>
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{plan.name}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: plan.price === 0 ? C.muted : plan.color }}>
                      {plan.price === 0 ? "Free" : `$${price}`}
                    </span>
                    {plan.price > 0 && <span style={{ fontSize: 13, color: C.muted }}>USD/{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    {plan.certs === 999999 ? "Ilimitados" : `${plan.certs} certificados`}/mes
                  </p>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: f.ok ? C.text : C.muted, opacity: f.ok ? 1 : 0.5 }}>
                      <span style={{ fontSize: 14, color: f.ok ? "#22c55e" : "#ef4444" }}>{f.ok ? "✓" : "✗"}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGoApp}
                  style={{
                    padding: "12px 0",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 13,
                    background: isPro ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : `${plan.color}22`,
                    color: isPro ? "#1a0f00" : plan.color,
                    border: isPro ? "none" : `1px solid ${plan.color}44`,
                    transition: "all 0.2s",
                  }}
                >
                  {plan.price === 0 ? "Empezar gratis" : "Elegir plan"} →
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Créditos adicionales</h3>
            <p style={{ fontSize: 13, color: C.muted }}>¿Se te acabaron los certificados del mes? Comprá créditos extra sin cambiar de plan.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[["50 certificados", "$3"], ["200 certificados", "$9"], ["500 certificados", "$19"]].map(([q, p]) => (
              <button key={q} style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}44`, color: C.gold, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <div>{q}</div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{p}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🏅</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>CertificaPy</span>
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>© 2025 CertificaPy · Hecho en Paraguay 🇵🇾</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Términos", "Privacidad", "Contacto"].map((l) => (
            <a key={l} href="#" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Landing;