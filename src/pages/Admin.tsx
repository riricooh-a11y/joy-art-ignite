import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

const PLANS = [
  { id: "free", name: "Gratuito", price: 0, color: "#64748b", certs: 5 },
  { id: "pro", name: "Profesional", price: 9, color: C.gold, certs: 100 },
  { id: "enterprise", name: "Institucional", price: 29, color: C.indigo, certs: 999999 },
];

const MONTHLY_STATS = [
  { month: "Nov", revenue: 87 },
  { month: "Dic", revenue: 116 },
  { month: "Ene", revenue: 174 },
  { month: "Feb", revenue: 203 },
  { month: "Mar", revenue: 261 },
  { month: "Abr", revenue: 318 },
  { month: "May", revenue: 376 },
];

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color = C.gold }: { icon: string; label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data, field, color }: { data: any[]; field: string; color: string }) {
  const max = Math.max(...data.map((d) => d[field]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: `${color}cc`, borderRadius: "3px 3px 0 0", height: `${(d[field] / max) * 44}px` }} />
          <span style={{ fontSize: 8, color: C.muted }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, [string, string]> = {
    free: ["#64748b", "Gratuito"],
    pro: [C.gold, "Pro"],
    enterprise: [C.indigo, "Institucional"],
    admin: [C.indigo, "Admin"],
    user: ["#64748b", "Usuario"],
  };
  const [color, label] = map[plan] || [C.muted, plan];
  return <Badge color={color}>{label}</Badge>;
}

interface UserRow {
  user_id: string;
  name: string;
  email: string;
  role: string;
  certs: number;
  joined: string;
}

interface CertRow {
  id: string;
  recipient_name: string;
  course_name: string;
  certificate_number: string | null;
  created_at: string;
  verification_code: string;
  user_id: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [section, setSection] = useState<"overview" | "users" | "certificates" | "plans">("overview");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [certificates, setCertificates] = useState<CertRow[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    const [{ data: profiles }, { data: roles }, { data: certs }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
      supabase.from("certificates").select("id, recipient_name, course_name, certificate_number, created_at, verification_code, user_id").order("created_at", { ascending: false }).limit(200),
    ]);
    if (profiles) {
      const certCount: Record<string, number> = {};
      (certs || []).forEach((c) => {
        certCount[c.user_id] = (certCount[c.user_id] || 0) + 1;
      });
      setUsers(
        profiles.map((p) => ({
          user_id: p.user_id,
          name: p.full_name || "Sin nombre",
          email: "—",
          role: roles?.find((r) => r.user_id === p.user_id)?.role || "user",
          certs: certCount[p.user_id] || 0,
          joined: new Date(p.created_at).toISOString().slice(0, 10),
        }))
      );
    }
    if (certs) setCertificates(certs);
  };

  const toggleAdmin = async (uid: string, currentRole: string) => {
    if (uid === user?.id) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", uid);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Rol cambiado a ${newRole}` });
      load();
    }
  };

  const deleteCert = async (id: string) => {
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Certificado eliminado" });
      load();
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const totalCerts = certificates.length;
  const activeUsers = users.length;
  const mrr = users.filter((u) => u.role !== "user").length * 0; // no billing yet
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const NAV = [
    { id: "overview", icon: "📊", label: "Resumen" },
    { id: "users", icon: "👥", label: "Usuarios" },
    { id: "certificates", icon: "📜", label: "Certificados" },
    { id: "plans", icon: "📦", label: "Planes" },
  ] as const;

  const inputStyle: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, padding: "8px 12px", outline: "none" };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Lato','Segoe UI',sans-serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <aside style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏅</div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>CertificaPy</span>
          </div>
          <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Panel Administrativo</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id as any)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                background: section === n.id ? `${C.gold}18` : "transparent",
                border: section === n.id ? `1px solid ${C.gold}33` : "1px solid transparent",
                color: section === n.id ? C.gold : C.muted,
                cursor: "pointer", fontSize: 13, fontWeight: section === n.id ? 700 : 400, textAlign: "left",
              }}
            >
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => navigate("/app")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", width: "100%", background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            ← Volver al editor
          </button>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", width: "100%", background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            🏠 Inicio
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
        {section === "overview" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Resumen general</h1>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Estado actual del sistema</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <StatCard icon="💰" label="MRR" value={`$${mrr}`} sub="Ingresos recurrentes" color={C.gold} />
              <StatCard icon="👥" label="Usuarios" value={activeUsers} sub="Registrados" color={C.indigo} />
              <StatCard icon="📜" label="Certificados" value={totalCerts.toLocaleString()} sub="Emitidos en total" color="#22c55e" />
              <StatCard icon="🛡️" label="Admins" value={users.filter((u) => u.role === "admin").length} color="#f59e0b" />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Ingresos mensuales (proyección)</span>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>+18% mes anterior</span>
              </div>
              <MiniBar data={MONTHLY_STATS} field="revenue" color={C.gold} />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 16 }}>Últimos certificados</span>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Receptor", "Curso", "Nº", "Fecha"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 12px", fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.slice(0, 6).map((c) => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{c.recipient_name}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: C.muted }}>{c.course_name}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{c.certificate_number || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted }}>{new Date(c.created_at).toLocaleDateString("es")}</td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 13 }}>Sin certificados aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "users" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Usuarios</h1>
                <p style={{ color: C.muted, fontSize: 13 }}>{users.length} usuarios registrados</p>
              </div>
              <input style={{ ...inputStyle, width: 220 }} placeholder="🔍  Buscar usuario..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                    {["Usuario", "Rol", "Certificados", "Registrado", "Acciones"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold}44,${C.indigo}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{u.user_id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><PlanBadge plan={u.role} /></td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{u.certs}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{u.joined}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {u.user_id !== user.id && (
                          <button onClick={() => toggleAdmin(u.user_id, u.role)} style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}33`, color: C.gold, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                            {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 13 }}>Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "certificates" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Certificados emitidos</h1>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{certificates.length} certificados en total</p>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                    {["Receptor", "Curso", "Nº", "Código", "Fecha", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.recipient_name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{c.course_name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{c.certificate_number || "—"}</td>
                      <td style={{ padding: "12px 16px" }}><Badge color={C.gold}>{c.verification_code.slice(0, 8)}</Badge></td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{new Date(c.created_at).toLocaleDateString("es")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => deleteCert(c.id)} style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 13 }}>Sin certificados aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "plans" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Gestión de planes</h1>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Configurá los límites y precios de cada plan</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
              {PLANS.map((plan) => (
                <div key={plan.id} style={{ background: C.card, border: `2px solid ${plan.color}44`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>{plan.name}</h3>
                    <Badge color={plan.color}>{plan.price === 0 ? "Gratis" : `$${plan.price}/mes`}</Badge>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      ["Certificados/mes", plan.certs === 999999 ? "Ilimitados" : plan.certs],
                    ].map(([label, val]) => (
                      <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.surface, borderRadius: 8 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;