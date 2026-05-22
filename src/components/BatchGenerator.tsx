import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Upload, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import type { CertificateData } from "@/types/certificate";

interface BatchGeneratorProps {
  data: CertificateData;
}

const BatchGenerator: React.FC<BatchGeneratorProps> = ({ data }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState<{ name: string; doc: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row: any) => ({
          name: row.nombre || row.name || row.Nombre || row.Name || "",
          doc: row.documento || row.document || row.Documento || row.ci || row.CI || "",
        })).filter((r) => r.name.trim());
        setNames(parsed);
        setDone(false);
      },
    });
  };

  const handleGenerate = async () => {
    if (!user || names.length === 0) return;
    setGenerating(true);
    try {
      const records = names.map((n) => ({
        user_id: user.id,
        recipient_name: n.name,
        document_number: n.doc,
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
      }));
      const { error } = await supabase.from("certificates").insert(records);
      if (error) throw error;
      setDone(true);
      toast({
        title: "¡Certificados generados!",
        description: `${names.length} certificados creados con código QR de verificación.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setNames([]); setDone(false); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-1" /> Lote CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generación en Lote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sube un archivo CSV con columnas <code className="text-xs bg-muted px-1 rounded">nombre</code> y{" "}
            <code className="text-xs bg-muted px-1 rounded">documento</code> para generar certificados masivamente.
          </p>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Seleccionar archivo CSV
          </Button>

          {names.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{names.length} registros encontrados:</p>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {names.map((n, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <span>{n.name}</span>
                    <span className="text-muted-foreground">{n.doc}</span>
                  </div>
                ))}
              </div>
              {done ? (
                <div className="flex items-center gap-2 text-primary justify-center">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">¡Generados exitosamente!</span>
                </div>
              ) : (
                <Button onClick={handleGenerate} className="w-full" disabled={generating}>
                  {generating ? "Generando..." : `Generar ${names.length} certificados`}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchGenerator;
