import React, { useState, useRef, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, LogOut, QrCode, ImageDown, Shield } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import EditorPanel from "@/components/EditorPanel";
import CertificatePreview from "@/components/CertificatePreview";
import TemplateManager from "@/components/TemplateManager";
import BatchGenerator from "@/components/BatchGenerator";
import { defaultCertificateData } from "@/types/certificate";
import type { CertificateData } from "@/types/certificate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<CertificateData>(defaultCertificateData);
  const [zoom, setZoom] = useState(0.7);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleDownloadPDF = async () => {
    const wrapper = previewRef.current;
    const el = wrapper?.querySelector(".certificate-preview") as HTMLElement;
    if (!el || !wrapper) return;
    try {
      toast({ title: "Generando PDF…", description: "Espere un momento." });

      // Wait for fonts to load
      await document.fonts.ready;

      // Temporarily remove parent transform so html2canvas renders correctly
      const prevTransform = wrapper.style.transform;
      wrapper.style.transform = "none";

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      });

      // Restore transform
      wrapper.style.transform = prevTransform;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`${data.certificateNumber || "certificado"}.pdf`);
      toast({ title: "PDF descargado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDownloadPNG = async () => {
    const wrapper = previewRef.current;
    const el = wrapper?.querySelector(".certificate-preview") as HTMLElement;
    if (!el || !wrapper) return;
    try {
      toast({ title: "Generando PNG…", description: "Espere un momento." });
      await document.fonts.ready;
      const prevTransform = wrapper.style.transform;
      wrapper.style.transform = "none";
      const canvas = await html2canvas(el, {
        scale: 4,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      });
      wrapper.style.transform = prevTransform;
      const link = document.createElement("a");
      link.download = `${data.certificateNumber || "certificado"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "PNG descargado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleIssueCertificate = async () => {
    if (!user) return;
    const { data: cert, error } = await supabase.from("certificates").insert([{
      user_id: user.id,
      recipient_name: data.recipientName,
      document_number: data.documentNumber,
      course_name: data.courseName,
      course_description: data.courseDescription,
      institution: data.institution,
      duration: data.duration,
      start_date: data.startDate,
      end_date: data.endDate,
      issue_date: data.issueDate,
      certificate_number: data.certificateNumber,
      signer_name: data.signerName,
      signer_title: data.signerTitle,
      data: JSON.parse(JSON.stringify(data)),
    }]).select("verification_code").single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setVerificationCode(cert.verification_code);
      toast({
        title: "¡Certificado emitido!",
        description: "Se generó el código QR de verificación.",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Editor */}
      <aside className="w-[380px] min-w-[380px] bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border bg-primary flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-bold text-primary-foreground">
              CertificaPy
            </h1>
            <p className="text-xs text-primary-foreground/70">
              Creador de Certificados Profesionales
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" title="Panel de Admin"
                  className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Shield className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} title="Cerrar sesión"
              className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <EditorPanel data={data} onChange={setData} />
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 flex flex-col bg-muted/50">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <TemplateManager data={data} onLoad={setData} />
            <BatchGenerator data={data} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-body w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            {verificationCode ? (
              <Button variant="outline" size="sm" onClick={() => setVerificationCode(null)} className="text-destructive">
                <QrCode className="w-4 h-4 mr-2" />
                Quitar QR
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleIssueCertificate}>
                <QrCode className="w-4 h-4 mr-2" />
                Emitir con QR
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <ImageDown className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button size="sm" className="bg-gold hover:bg-gold-dark text-secondary-foreground" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          <div
            ref={previewRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className="transition-transform duration-200"
          >
            <CertificatePreview
              data={data}
              verificationCode={verificationCode}
              onSealMove={(id, x, y) => {
                const updated = (data.seals ?? []).map((s) =>
                  s.id === id ? { ...s, x, y } : s
                );
                setData({ ...data, seals: updated });
              }}
              onQrMove={(x, y) => {
                setData({ ...data, qrPosition: { x, y } });
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
