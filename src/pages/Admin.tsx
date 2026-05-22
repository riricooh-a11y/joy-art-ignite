import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Award, Trash2, ArrowLeft, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  created_at: string;
  role: string;
}

interface CertificateRow {
  id: string;
  recipient_name: string;
  course_name: string;
  certificate_number: string | null;
  created_at: string;
  user_id: string;
  verification_code: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "certificates">("users");

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
    if (data) {
      fetchUsers();
      fetchCertificates();
    }
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles) {
      const mapped = profiles.map((p) => {
        const userRole = roles?.find((r) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          created_at: p.created_at,
          role: userRole?.role || "user",
        };
      });
      setUsers(mapped);
    }
  };

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from("certificates")
      .select("id, recipient_name, course_name, certificate_number, created_at, user_id, verification_code")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setCertificates(data);
  };

  const handleDeleteCertificate = async (id: string) => {
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Certificado eliminado" });
      fetchCertificates();
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    if (userId === user?.id) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Rol cambiado a ${newRole}` });
      fetchUsers();
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Panel de Administración</h1>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Editor
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificados</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{certificates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
            <Crown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4 mr-2" /> Usuarios
          </Button>
          <Button
            variant={activeTab === "certificates" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("certificates")}
          >
            <Award className="w-4 h-4 mr-2" /> Certificados
          </Button>
        </div>

        {activeTab === "users" && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {users.map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {new Date(u.created_at).toLocaleDateString("es")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                      {u.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(u.user_id, u.role)}
                        >
                          {u.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "certificates" && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {certificates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay certificados emitidos</p>
                )}
                {certificates.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{c.recipient_name}</p>
                      <p className="text-sm text-muted-foreground">{c.course_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.certificate_number} · {new Date(c.created_at).toLocaleDateString("es")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{c.verification_code.slice(0, 8)}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCertificate(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;
