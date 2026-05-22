import React, { useRef } from "react";
import type { CertificateData } from "@/types/certificate";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import DraggableSeal from "./DraggableSeal";

interface CertificatePreviewProps {
  data: CertificateData;
  verificationCode?: string | null;
  onSealMove?: (id: string, x: number, y: number) => void;
  onQrMove?: (x: number, y: number) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return dateStr;
  }
};

const FONT_MAP: Record<string, string> = {
  "Playfair Display": "'Playfair Display', serif",
  "Merriweather": "'Merriweather', serif",
  "Cormorant Garamond": "'Cormorant Garamond', serif",
  "Cinzel": "'Cinzel', serif",
  "Montserrat": "'Montserrat', sans-serif",
  "Raleway": "'Raleway', sans-serif",
  "IM Fell English": "'IM Fell English', serif",
  "Roboto": "'Roboto', sans-serif",
  "Great Vibes": "'Great Vibes', cursive",
};

// SVG-based border renderer (sharper PDF output, more elegant)
const CertBorder: React.FC<{ style: string; color: string; accent: string; bw: number }> = ({ style, color, accent, bw }) => {
  if (style === "none") return null;
  const s: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" };

  if (style === "classic") return (
    <svg style={s} viewBox="0 0 900 637" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x={12} y={12} width={876} height={613} stroke={color} strokeWidth={bw} fill="none" />
      <rect x={20} y={20} width={860} height={597} stroke={accent} strokeWidth={1} fill="none" />
      {[[0,0,1,1],[900,0,-1,1],[900,637,-1,-1],[0,637,1,-1]].map(([cx,cy,sx,sy],i) => (
        <g key={i} transform={`translate(${cx},${cy}) scale(${sx},${sy})`}>
          <path d="M0 0 L28 0 L28 4 L4 4 L4 28 L0 28 Z" fill={accent} />
          <path d="M0 0 L14 0 L14 2 L2 2 L2 14 L0 14 Z" fill={color} />
        </g>
      ))}
    </svg>
  );
  if (style === "double") return (
    <svg style={s} viewBox="0 0 900 637" fill="none" preserveAspectRatio="none">
      <rect x={8} y={8} width={884} height={621} stroke={color} strokeWidth={bw} fill="none" />
      <rect x={16} y={16} width={868} height={605} stroke={color} strokeWidth={1} fill="none" />
      <rect x={22} y={22} width={856} height={593} stroke={accent} strokeWidth={1} fill="none" strokeDasharray="6 3" />
    </svg>
  );
  if (style === "modern") return (
    <svg style={s} viewBox="0 0 900 637" fill="none" preserveAspectRatio="none">
      <rect x={10} y={10} width={880} height={617} stroke={color} strokeWidth={bw} rx={6} fill="none" />
      <line x1={10} y1={10} x2={80} y2={10} stroke={accent} strokeWidth={3} />
      <line x1={820} y1={10} x2={890} y2={10} stroke={accent} strokeWidth={3} />
      <line x1={10} y1={627} x2={80} y2={627} stroke={accent} strokeWidth={3} />
      <line x1={820} y1={627} x2={890} y2={627} stroke={accent} strokeWidth={3} />
      <line x1={10} y1={10} x2={10} y2={80} stroke={accent} strokeWidth={3} />
      <line x1={890} y1={10} x2={890} y2={80} stroke={accent} strokeWidth={3} />
      <line x1={10} y1={557} x2={10} y2={627} stroke={accent} strokeWidth={3} />
      <line x1={890} y1={557} x2={890} y2={627} stroke={accent} strokeWidth={3} />
    </svg>
  );
  if (style === "ornate") return (
    <svg style={s} viewBox="0 0 900 637" fill="none" preserveAspectRatio="none">
      <rect x={8} y={8} width={884} height={621} stroke={color} strokeWidth={bw} fill="none" />
      <rect x={15} y={15} width={870} height={607} stroke={accent} strokeWidth={1} fill="none" />
      <rect x={20} y={20} width={860} height={597} stroke={accent} strokeWidth={0.5} strokeDasharray="4 4" fill="none" opacity={0.5} />
      {[[26,26,1,1],[874,26,-1,1],[874,611,-1,-1],[26,611,1,-1]].map(([x,y,sx,sy],i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${sx},${sy})`}>
          <path d="M0 0 L30 0 L30 4 L4 4 L4 30 L0 30 Z" fill={accent} opacity={0.9} />
          <path d="M0 0 L16 0 L16 2 L2 2 L2 16 L0 16 Z" fill={color} />
          <circle cx={8} cy={8} r={2.5} fill={accent} opacity={0.6} />
        </g>
      ))}
      <path d="M450 18 L440 18 Q450 14 460 18 Z" fill={accent} opacity={0.5} />
      <path d="M450 619 L440 619 Q450 623 460 619 Z" fill={accent} opacity={0.5} />
    </svg>
  );
  return null;
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data, verificationCode, onSealMove, onQrMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const verifyUrl = verificationCode
    ? `${window.location.origin}/verify/${verificationCode}`
    : null;

  const displayFont = FONT_MAP[data.fontFamily] || FONT_MAP["Playfair Display"];
  const bodyFont = "'Lato', sans-serif";
  const bw = data.borderWidth ?? 3;

  const seals = data.seals ?? [];
  const signers = data.signers?.length ? data.signers : [
    { id: "legacy", name: data.signerName, title: data.signerTitle, signatureImage: data.signatureImage },
  ];
  const qrPos = data.qrPosition ?? { x: 50, y: 95 };

  return (
    <div
      ref={containerRef}
      className="certificate-preview w-[900px] aspect-[1.414/1] relative mx-auto shadow-2xl overflow-hidden"
      style={{ backgroundColor: data.bgColor }}
    >
      {/* Background image */}
      {data.bgImage && (
        <img
          src={data.bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: data.bgOpacity ?? 0.15 }}
        />
      )}

      {/* Border */}
      <CertBorder style={data.borderStyle ?? "classic"} color={data.borderColor} accent={data.accentColor} bw={bw} />

      {/* Paper texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Draggable Seals */}
      {seals.map((seal) => (
        <DraggableSeal
          key={seal.id}
          seal={seal}
          containerRef={containerRef}
          onMove={onSealMove ?? (() => {})}
          editable={!!onSealMove}
        />
      ))}

      {/* Legacy single seal (backward compat) */}
      {data.sealImage && seals.length === 0 && (
        <img
          src={data.sealImage}
          alt="Sello"
          className="absolute object-contain opacity-80"
          style={{ left: "8%", bottom: "12%", width: "96px", height: "96px" }}
        />
      )}

      {/* Draggable QR */}
      {data.showQR !== false && verifyUrl && (
        <div
          className={`absolute z-20 flex flex-col items-center ${onQrMove ? "cursor-grab" : ""}`}
          style={{
            left: `${qrPos.x}%`,
            top: `${qrPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={(e) => {
            if (!onQrMove || !containerRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            const rect = containerRef.current.getBoundingClientRect();
            const startX = e.clientX;
            const startY = e.clientY;
            const origX = qrPos.x;
            const origY = qrPos.y;
            const el = e.currentTarget;
            el.style.cursor = "grabbing";
            el.setPointerCapture(e.pointerId);

            const move = (ev: PointerEvent) => {
              const dx = ((ev.clientX - startX) / rect.width) * 100;
              const dy = ((ev.clientY - startY) / rect.height) * 100;
              onQrMove(
                Math.max(0, Math.min(100, origX + dx)),
                Math.max(0, Math.min(100, origY + dy))
              );
            };
            const up = () => {
              el.style.cursor = "grab";
              el.removeEventListener("pointermove", move);
              el.removeEventListener("pointerup", up);
            };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerup", up);
          }}
        >
          <QRCodeSVG value={verifyUrl} size={56} level="M" />
          <p style={{ color: data.textColor, opacity: 0.5, fontSize: "7px", fontFamily: bodyFont }} className="mt-0.5">
            Verificar
          </p>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-10 flex flex-col items-center justify-between py-6 px-8">
        {/* Header */}
        <div className="text-center space-y-2 w-full">
          {data.logoImage && (
            <img src={data.logoImage} alt="Logo" className="h-16 object-contain mx-auto mb-2" />
          )}
          <p style={{ color: data.accentColor, letterSpacing: "0.3em", fontFamily: bodyFont, fontSize: `${Math.max(9, data.bodySize - 2)}px` }} className="uppercase">
            República del Paraguay
          </p>
          <h3 style={{ color: data.borderColor, letterSpacing: "0.2em", fontFamily: displayFont, fontSize: `${data.bodySize + 2}px`, fontWeight: 600 }} className="uppercase">
            {data.institution}
          </h3>
          <div className="w-32 h-[1px] mx-auto my-2" style={{ backgroundColor: data.accentColor }} />
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 style={{ color: data.borderColor, letterSpacing: "0.05em", fontFamily: displayFont, fontSize: `${data.titleSize}px`, fontWeight: 700 }}>
            CERTIFICADO
          </h1>
          <p style={{ color: data.accentColor, letterSpacing: "0.25em", fontFamily: bodyFont, fontSize: `${Math.max(9, data.bodySize - 2)}px` }} className="uppercase">
            de {data.certType || "formación profesional"}
          </p>
        </div>

        {/* Body */}
        <div className="text-center space-y-4 max-w-[650px]">
          <p style={{ color: data.textColor, fontFamily: bodyFont, fontSize: `${data.bodySize}px` }}>Se certifica que</p>
          <div>
            <h2 style={{ color: data.borderColor, borderColor: data.accentColor, fontFamily: displayFont, fontSize: `${data.nameSize}px`, fontWeight: 700 }} className="border-b-2 pb-1 inline-block px-4">
              {data.recipientName}
            </h2>
            <p style={{ color: data.textColor, opacity: 0.7, fontFamily: bodyFont, fontSize: `${Math.max(9, data.bodySize - 2)}px` }} className="mt-1">
              {data.documentNumber}
            </p>
          </div>
          <p style={{ color: data.textColor, fontFamily: bodyFont, fontSize: `${data.bodySize}px`, lineHeight: 1.6 }}>
            {data.courseDescription}
          </p>
          <div style={{ color: data.borderColor, fontFamily: displayFont, fontSize: `${data.nameSize - 4}px`, fontWeight: 600 }}>
            «{data.courseName}»
          </div>
          <p style={{ color: data.textColor, opacity: 0.7, fontFamily: bodyFont, fontSize: `${Math.max(9, data.bodySize - 2)}px` }}>
            Duración: {data.duration} · Período: {formatDate(data.startDate)} al {formatDate(data.endDate)}
          </p>
        </div>

        {/* Multiple Signers */}
        <div className="w-full flex items-end justify-center px-4 gap-8">
          {signers.map((signer) => (
            <div key={signer.id} className="flex flex-col items-center">
              {signer.signatureImage ? (
                <img src={signer.signatureImage} alt="Firma" className="h-14 object-contain mb-1" />
              ) : (
                <div className="h-14 mb-1" />
              )}
              <div className="w-44 border-t pt-1 text-center" style={{ borderColor: data.borderColor }}>
                <p style={{ color: data.borderColor, fontFamily: bodyFont, fontSize: `${data.bodySize}px`, fontWeight: 600 }}>
                  {signer.name}
                </p>
                <p style={{ color: data.textColor, opacity: 0.7, fontFamily: bodyFont, fontSize: `${Math.max(8, data.bodySize - 2)}px` }}>
                  {signer.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center w-full">
          <div className="w-32 h-[1px] mx-auto mb-2" style={{ backgroundColor: data.accentColor }} />
          <div className="flex justify-between items-end" style={{ color: data.textColor, opacity: 0.5, fontSize: "9px", fontFamily: bodyFont }}>
            <span>Nº {data.certificateNumber}</span>
            <span>Emitido el {formatDate(data.issueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
