export interface SealItem {
  id: string;
  image: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px width
}

export interface SignerItem {
  id: string;
  name: string;
  title: string;
  signatureImage: string | null;
}

export interface CertificateData {
  recipientName: string;
  documentNumber: string;
  courseName: string;
  courseDescription: string;
  certType: string;
  institution: string;
  duration: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  certificateNumber: string;
  signerName: string;
  signerTitle: string;
  signatureImage: string | null;
  signers: SignerItem[];
  sealImage: string | null;
  seals: SealItem[];
  logoImage: string | null;
  borderColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  bgImage: string | null;
  bgOpacity: number;
  fontFamily: string;
  titleSize: number;
  nameSize: number;
  bodySize: number;
  borderStyle: "classic" | "modern" | "double" | "ornate" | "none";
  borderWidth: number;
  showQR: boolean;
  qrPosition: { x: number; y: number };
}

export const defaultCertificateData: CertificateData = {
  recipientName: "Juan Carlos López Martínez",
  documentNumber: "C.I. 4.567.890",
  courseName: "Desarrollo Web Full Stack",
  courseDescription: "Ha completado satisfactoriamente el curso de formación profesional, cumpliendo con todos los requisitos académicos establecidos.",
  institution: "Instituto de Formación Profesional",
  duration: "120 horas cátedra",
  startDate: "2025-03-01",
  endDate: "2025-12-15",
  issueDate: "2025-12-20",
  certificateNumber: "CERT-2025-001",
  certType: "formación profesional",
  signerName: "Dr. María González",
  signerTitle: "Directora General",
  signatureImage: null,
  signers: [
    { id: "default-1", name: "Dr. María González", title: "Directora General", signatureImage: null },
  ],
  seals: [],
  sealImage: null,
  logoImage: null,
  borderColor: "#1e3a5f",
  accentColor: "#c8952e",
  textColor: "#1a1a2e",
  bgColor: "#ffffff",
  bgImage: null,
  bgOpacity: 0.15,
  fontFamily: "Playfair Display",
  titleSize: 36,
  nameSize: 24,
  bodySize: 12,
  borderStyle: "classic",
  borderWidth: 3,
  showQR: true,
  qrPosition: { x: 50, y: 95 },
};

export interface PresetTemplate {
  name: string;
  description: string;
  preview: string;
  data: Partial<CertificateData>;
}

export const presetTemplates: PresetTemplate[] = [
  {
    name: "Clásico",
    description: "Formal con azul marino y dorado",
    preview: "🏛️",
    data: {
      borderColor: "#1e3a5f",
      accentColor: "#c8952e",
      textColor: "#1a1a2e",
      bgColor: "#ffffff",
      bgOpacity: 0.15,
    },
  },
  {
    name: "Moderno",
    description: "Contemporáneo con verde esmeralda",
    preview: "✨",
    data: {
      borderColor: "#0f172a",
      accentColor: "#10b981",
      textColor: "#1e293b",
      bgColor: "#f8fafc",
      bgOpacity: 0.1,
    },
  },
  {
    name: "Minimalista",
    description: "Limpio con colores neutros",
    preview: "◻️",
    data: {
      borderColor: "#374151",
      accentColor: "#9ca3af",
      textColor: "#111827",
      bgColor: "#ffffff",
      bgOpacity: 0.08,
    },
  },
  {
    name: "Elegante",
    description: "Burdeos y dorado premium",
    preview: "👑",
    data: {
      borderColor: "#7f1d1d",
      accentColor: "#d4a017",
      textColor: "#1c1917",
      bgColor: "#fffbeb",
      bgOpacity: 0.12,
    },
  },
  {
    name: "Corporativo",
    description: "Profesional azul y gris",
    preview: "🏢",
    data: {
      borderColor: "#1e40af",
      accentColor: "#3b82f6",
      textColor: "#1e3a5f",
      bgColor: "#f0f9ff",
      bgOpacity: 0.1,
    },
  },
];
