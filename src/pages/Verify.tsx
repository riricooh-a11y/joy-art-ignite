import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return dateStr;
  }
};

const Verify = () => {
  const { code } = useParams<{ code: string }>();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!code) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .rpc("verify_certificate", { _code: code });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) {
        setNotFound(true);
      } else {
        setCertificate(row);
      }
      setLoading(false);
    };
    fetchCertificate();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
            <Award className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-display">Verificación de Certificado</CardTitle>
        </CardHeader>
        <CardContent>
          {notFound ? (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <p className="text-lg font-semibold">Certificado no encontrado</p>
              <p className="text-sm text-muted-foreground">
                El código de verificación no corresponde a ningún certificado registrado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
                <Badge variant="outline" className="text-primary border-primary/30 bg-accent">
                  Certificado Válido
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Destinatario:</span>
                  <span className="font-semibold">{certificate.recipient_name}</span>
                </div>
                {certificate.document_number && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Documento:</span>
                    <span>{certificate.document_number}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Curso:</span>
                  <span className="font-semibold">{certificate.course_name}</span>
                </div>
                {certificate.institution && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Institución:</span>
                    <span>{certificate.institution}</span>
                  </div>
                )}
                {certificate.duration && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Duración:</span>
                    <span>{certificate.duration}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Período:</span>
                  <span>{formatDate(certificate.start_date)} — {formatDate(certificate.end_date)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Emitido:</span>
                  <span>{formatDate(certificate.issue_date)}</span>
                </div>
                {certificate.certificate_number && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Nº Certificado:</span>
                    <span>{certificate.certificate_number}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-mono text-xs">{certificate.verification_code}</span>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;
