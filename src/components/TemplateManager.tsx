import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import type { CertificateData } from "@/types/certificate";

interface TemplateManagerProps {
  data: CertificateData;
  onLoad: (data: CertificateData) => void;
}

interface Template {
  id: string;
  name: string;
  data: CertificateData;
  created_at: string;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ data, onLoad }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  const fetchTemplates = async () => {
    if (!user) return;
    const { data: rows } = await supabase
      .from("certificate_templates")
      .select("*")
      .order("updated_at", { ascending: false });
    if (rows) setTemplates(rows as unknown as Template[]);
  };

  useEffect(() => { fetchTemplates(); }, [user]);

  const handleSave = async () => {
    if (!user || !saveName.trim()) return;
    const { error } = await supabase.from("certificate_templates").insert([{
      user_id: user.id,
      name: saveName.trim(),
      data: JSON.parse(JSON.stringify(data)),
    }]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plantilla guardada" });
      setSaveName("");
      setSaveOpen(false);
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("certificate_templates").delete().eq("id", id);
    fetchTemplates();
  };

  const handleLoad = (tpl: Template) => {
    onLoad(tpl.data);
    setLoadOpen(false);
    toast({ title: "Plantilla cargada", description: tpl.name });
  };

  return (
    <div className="flex gap-2">
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1" /> Guardar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre de la plantilla"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Button onClick={handleSave} className="w-full" disabled={!saveName.trim()}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={loadOpen} onOpenChange={(o) => { setLoadOpen(o); if (o) fetchTemplates(); }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-1" /> Plantillas
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mis Plantillas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes plantillas guardadas
              </p>
            )}
            {templates.map((tpl) => (
              <div key={tpl.id} className="flex items-center justify-between p-3 border rounded-md">
                <button
                  onClick={() => handleLoad(tpl)}
                  className="text-sm font-medium text-left hover:text-primary flex-1"
                >
                  {tpl.name}
                </button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(tpl.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager;
