import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image, PenTool, LayoutTemplate, Type, Square, QrCode, Plus, Trash2, Move, Users, Sparkles, Loader2 } from "lucide-react";
import type { CertificateData, SealItem, SignerItem } from "@/types/certificate";
import { presetTemplates } from "@/types/certificate";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EditorPanelProps {
  data: CertificateData;
  onChange: (data: CertificateData) => void;
}

const FONT_OPTIONS = [
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Cinzel", label: "Cinzel" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Raleway", label: "Raleway" },
  { value: "IM Fell English", label: "IM Fell English" },
  { value: "Roboto", label: "Roboto" },
  { value: "Great Vibes", label: "Great Vibes" },
];

const BORDER_STYLES = [
  { value: "classic", label: "Clásico" },
  { value: "modern", label: "Moderno" },
  { value: "double", label: "Doble" },
  { value: "ornate", label: "Ornamental" },
  { value: "none", label: "Sin borde" },
];

const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange }) => {
  const signatureRef = useRef<HTMLInputElement>(null);
  const sealRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const bgImageRef = useRef<HTMLInputElement>(null);
  const newSealRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("cert-ai", {
        body: { prompt: aiPrompt },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      onChange({
        ...data,
        courseDescription: res.courseDescription || data.courseDescription,
        certType: res.certType || data.certType,
        courseName: res.suggestedTitle || data.courseName,
        institution: res.suggestedInstitution || data.institution,
        duration: res.suggestedDuration || data.duration,
      });
      toast({ title: "✓ Texto generado", description: "Los campos del certificado fueron actualizados." });
      setAiPrompt("");
    } catch (e: any) {
      toast({ title: "Error de IA", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const update = (field: keyof CertificateData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileUpload = (
    field: "signatureImage" | "sealImage" | "logoImage" | "bgImage",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...data, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <PenTool className="w-5 h-5 text-gold" />
          Editor de Certificado
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete los campos para personalizar su certificado
        </p>
      </div>

      <Separator />

      {/* Asistente IA */}
      <section className="space-y-3 rounded-lg border border-gold/30 bg-gradient-to-br from-card to-accent/40 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-gold">
          <Sparkles className="w-4 h-4" /> Asistente IA
        </h3>
        <p className="text-xs text-muted-foreground">
          Describe el curso o evento y la IA genera el texto formal del certificado.
        </p>
        <Textarea
          rows={3}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder='Ej: "Curso de primeros auxilios de 8 horas para enfermeros del hospital..."'
          className="text-sm"
        />
        <Button
          onClick={handleAIGenerate}
          disabled={aiLoading || !aiPrompt.trim()}
          size="sm"
          className="w-full bg-gold hover:bg-gold-dark text-secondary-foreground"
        >
          {aiLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando…</>)
            : (<><Sparkles className="w-4 h-4 mr-2" /> Generar texto con IA</>)}
        </Button>
      </section>

      <Separator />

      {/* Plantillas Prediseñadas */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" /> Estilos Prediseñados
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {presetTemplates.map((tpl) => (
            <button
              key={tpl.name}
              onClick={() => onChange({ ...data, ...tpl.data })}
              className="flex flex-col items-center gap-1 p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors text-left"
            >
              <span className="text-2xl">{tpl.preview}</span>
              <span className="text-xs font-semibold text-foreground">{tpl.name}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{tpl.description}</span>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Tipografía y Tamaños */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4" /> Tipografía
        </h3>
        <div className="space-y-2">
          <Label>Fuente principal</Label>
          <Select value={data.fontFamily ?? "Playfair Display"} onValueChange={(v) => update("fontFamily", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tamaño del título</Label>
            <span className="text-xs text-muted-foreground">{data.titleSize ?? 36}px</span>
          </div>
          <Slider value={[data.titleSize ?? 36]} onValueChange={([v]) => update("titleSize", v)} min={24} max={56} step={2} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tamaño del nombre</Label>
            <span className="text-xs text-muted-foreground">{data.nameSize ?? 24}px</span>
          </div>
          <Slider value={[data.nameSize ?? 24]} onValueChange={([v]) => update("nameSize", v)} min={16} max={40} step={2} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tamaño del texto</Label>
            <span className="text-xs text-muted-foreground">{data.bodySize ?? 12}px</span>
          </div>
          <Slider value={[data.bodySize ?? 12]} onValueChange={([v]) => update("bodySize", v)} min={9} max={18} step={1} />
        </div>
      </section>

      <Separator />

      {/* Estilo de Bordes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Square className="w-4 h-4" /> Estilo de Borde
        </h3>
        <div className="space-y-2">
          <Label>Tipo de borde</Label>
          <Select value={data.borderStyle ?? "classic"} onValueChange={(v) => update("borderStyle", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data.borderStyle !== "none" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Grosor del borde</Label>
              <span className="text-xs text-muted-foreground">{data.borderWidth ?? 3}px</span>
            </div>
            <Slider value={[data.borderWidth ?? 3]} onValueChange={([v]) => update("borderWidth", v)} min={1} max={8} step={1} />
          </div>
        )}
      </section>

      <Separator />

      {/* Datos del Destinatario */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Datos del Destinatario
        </h3>
        <div className="space-y-2">
          <Label htmlFor="recipientName">Nombre Completo</Label>
          <Input id="recipientName" value={data.recipientName} onChange={(e) => update("recipientName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Documento de Identidad</Label>
          <Input id="documentNumber" value={data.documentNumber} onChange={(e) => update("documentNumber", e.target.value)} />
        </div>
      </section>

      <Separator />

      {/* Datos del Curso */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Datos del Curso
        </h3>
        <div className="space-y-2">
          <Label htmlFor="courseName">Nombre del Curso</Label>
          <Input id="courseName" value={data.courseName} onChange={(e) => update("courseName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="certType">Tipo de Certificado</Label>
          <Input id="certType" value={data.certType ?? ""} placeholder="formación profesional"
            onChange={(e) => update("certType", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseDescription">Descripción</Label>
          <Textarea id="courseDescription" value={data.courseDescription} onChange={(e) => update("courseDescription", e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution">Institución</Label>
          <Input id="institution" value={data.institution} onChange={(e) => update("institution", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración</Label>
            <Input id="duration" value={data.duration} onChange={(e) => update("duration", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Inicio</Label>
            <Input id="startDate" type="date" value={data.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Fin</Label>
            <Input id="endDate" type="date" value={data.endDate} onChange={(e) => update("endDate", e.target.value)} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Datos del Certificado */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Datos del Certificado
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Nº Certificado</Label>
            <Input id="certificateNumber" value={data.certificateNumber} onChange={(e) => update("certificateNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Fecha de Emisión</Label>
            <Input id="issueDate" type="date" value={data.issueDate} onChange={(e) => update("issueDate", e.target.value)} />
          </div>
        </div>
      </section>

      <Separator />

      {/* QR Code */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <QrCode className="w-4 h-4" /> Código QR
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="showQR">Mostrar QR en certificado</Label>
          <Switch id="showQR" checked={data.showQR !== false} onCheckedChange={(v) => update("showQR", v)} />
        </div>
        <p className="text-xs text-muted-foreground">
          El QR aparece al pie del certificado después de emitir con verificación.
        </p>
      </section>

      {/* Firmantes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" /> Firmantes
        </h3>
        <p className="text-xs text-muted-foreground">
          Puede agregar hasta 4 firmantes que aparecerán al pie del certificado.
        </p>
        {(data.signers ?? []).map((signer, idx) => (
          <div key={signer.id} className="p-3 border border-border rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Firmante {idx + 1}</span>
              {(data.signers?.length ?? 0) > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => {
                    onChange({ ...data, signers: data.signers.filter((_, i) => i !== idx) });
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <Input
              value={signer.name}
              onChange={(e) => {
                const updated = [...data.signers];
                updated[idx] = { ...updated[idx], name: e.target.value };
                onChange({ ...data, signers: updated });
              }}
              placeholder="Nombre del firmante"
              className="h-8 text-sm"
            />
            <Input
              value={signer.title}
              onChange={(e) => {
                const updated = [...data.signers];
                updated[idx] = { ...updated[idx], title: e.target.value };
                onChange({ ...data, signers: updated });
              }}
              placeholder="Cargo"
              className="h-8 text-sm"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`signer-sig-${signer.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const updated = [...data.signers];
                    updated[idx] = { ...updated[idx], signatureImage: reader.result as string };
                    onChange({ ...data, signers: updated });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => document.getElementById(`signer-sig-${signer.id}`)?.click()}
              >
                <PenTool className="w-3 h-3 mr-1" />
                {signer.signatureImage ? "Cambiar Firma" : "Subir Firma"}
              </Button>
              {signer.signatureImage && (
                <img src={signer.signatureImage} alt="Firma" className="mt-1 h-8 object-contain mx-auto" />
              )}
            </div>
          </div>
        ))}
        {(data.signers?.length ?? 0) < 4 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const newSigner: SignerItem = {
                id: crypto.randomUUID(),
                name: "",
                title: "",
                signatureImage: null,
              };
              onChange({ ...data, signers: [...(data.signers ?? []), newSigner] });
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Firmante
          </Button>
        )}
      </section>

      <Separator />

      {/* Imágenes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Image className="w-4 h-4" /> Imágenes
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="mb-2 block">Logo de Institución</Label>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("logoImage", e)} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => logoRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {data.logoImage ? "Cambiar Logo" : "Subir Logo"}
            </Button>
            {data.logoImage && <img src={data.logoImage} alt="Logo" className="mt-2 h-12 object-contain mx-auto" />}
          </div>
          <div>
            <Label className="mb-2 block">Firma Digital</Label>
            <input ref={signatureRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("signatureImage", e)} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => signatureRef.current?.click()}>
              <PenTool className="w-4 h-4 mr-2" />
              {data.signatureImage ? "Cambiar Firma" : "Subir Firma"}
            </Button>
            {data.signatureImage && <img src={data.signatureImage} alt="Firma" className="mt-2 h-12 object-contain mx-auto" />}
          </div>
          <div>
            <Label className="mb-2 block">Sellos Institucionales</Label>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Move className="w-3 h-3" /> Arrastra los sellos en la vista previa para posicionarlos
            </p>
            <input
              ref={newSealRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const newSeal: SealItem = {
                    id: crypto.randomUUID(),
                    image: reader.result as string,
                    label: file.name.replace(/\.[^.]+$/, ""),
                    x: 10 + (data.seals?.length ?? 0) * 15,
                    y: 88,
                    size: 72,
                  };
                  onChange({ ...data, seals: [...(data.seals ?? []), newSeal] });
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => newSealRef.current?.click()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Sello
            </Button>
            {(data.seals ?? []).map((seal, idx) => (
              <div key={seal.id} className="flex items-center gap-2 mb-2 p-2 border border-border rounded-md">
                <img src={seal.image} alt={seal.label} className="w-10 h-10 object-contain" />
                <div className="flex-1 min-w-0">
                  <Input
                    value={seal.label}
                    onChange={(e) => {
                      const updated = [...data.seals];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      onChange({ ...data, seals: updated });
                    }}
                    className="h-7 text-xs mb-1"
                    placeholder="Nombre del sello"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{seal.size}px</span>
                    <Slider
                      value={[seal.size]}
                      onValueChange={([v]) => {
                        const updated = [...data.seals];
                        updated[idx] = { ...updated[idx], size: v };
                        onChange({ ...data, seals: updated });
                      }}
                      min={32}
                      max={140}
                      step={4}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => {
                    onChange({ ...data, seals: data.seals.filter((_, i) => i !== idx) });
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div>
            <Label className="mb-2 block">Imagen de Fondo</Label>
            <input ref={bgImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("bgImage", e)} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => bgImageRef.current?.click()}>
              <Image className="w-4 h-4 mr-2" />
              {data.bgImage ? "Cambiar Fondo" : "Subir Fondo"}
            </Button>
            {data.bgImage && (
              <div className="mt-2 flex items-center gap-2">
                <img src={data.bgImage} alt="Fondo" className="h-12 object-contain" />
                <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, bgImage: null })} className="text-destructive text-xs">
                  Quitar
                </Button>
              </div>
            )}
            {data.bgImage && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacidad del fondo</Label>
                  <span className="text-xs text-muted-foreground">{Math.round((data.bgOpacity ?? 0.15) * 100)}%</span>
                </div>
                <Slider value={[(data.bgOpacity ?? 0.15) * 100]} onValueChange={([v]) => onChange({ ...data, bgOpacity: v / 100 })} min={5} max={100} step={5} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Colores */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4" /> Colores del Certificado
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            ["borderColor", "Color de Borde"],
            ["accentColor", "Color de Acento"],
            ["textColor", "Color de Texto"],
            ["bgColor", "Color de Fondo"],
          ] as const).map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <div className="flex items-center gap-2">
                <input type="color" id={field} value={data[field]} onChange={(e) => update(field, e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={data[field]} onChange={(e) => update(field, e.target.value)} className="flex-1" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
