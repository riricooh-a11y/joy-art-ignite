import React, { useRef } from "react";
import type { CertificateData, SealItem } from "@/types/certificate";
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
  "Roboto": "'Roboto', sans-serif",
  "Great Vibes": "'Great Vibes', cursive",
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data, verificationCode, onSealMove, onQrMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const verifyUrl = verificationCode
    ? `${window.location.origin}/verify/${verificationCode}`
    : null;

  const displayFont = FONT_MAP[data.fontFamily] || FONT_MAP["Playfair Display"];
  const bodyFont = "'Lato', sans-serif";
  const bw = data.borderWidth ?? 3;

  const renderBorder = () => {
    const style = data.borderStyle ?? "classic";
    if (style === "none") return null;

    switch (style) {
      case "double":
        return (
          <>
            <div className="absolute" style={{ inset: "8px", border: `${bw}px solid ${data.borderColor}` }} />
            <div className="absolute" style={{ inset: "14px", border: `${bw}px solid ${data.borderColor}` }} />
          </>
        );
      case "modern":
        return (
          <>
            <div className="absolute" style={{ inset: "10px", border: `${bw}px solid ${data.borderColor}`, borderRadius: "8px" }} />
            <div className="absolute top-3 left-3 w-16 h-1" style={{ backgroundColor: data.accentColor }} />
            <div className="absolute top-3 right-3 w-16 h-1" style={{ backgroundColor: data.accentColor }} />
            <div className="absolute bottom-3 left-3 w-16 h-1" style={{ backgroundColor: data.accentColor }} />
            <div className="absolute bottom-3 right-3 w-16 h-1" style={{ backgroundColor: data.accentColor }} />
          </>
        );
      case "ornate":
        return (
          <>
            <div className="absolute" style={{ inset: "8px", border: `${bw}px solid ${data.borderColor}` }} />
            <div className="absolute" style={{ inset: "14px", border: `1px solid ${data.accentColor}` }} />
            <div className="absolute" style={{ inset: "18px", border: `1px dashed ${data.accentColor}`, opacity: 0.5 }} />
            {["top-[15px] left-[15px]", "top-[15px] right-[15px] rotate-90", "bottom-[15px] right-[15px] rotate-180", "bottom-[15px] left-[15px] -rotate-90"].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-14 h-14`}>
                <svg viewBox="0 0 50 50" className="w-full h-full">
                  <path d="M0 0 L20 0 L20 3 L3 3 L3 20 L0 20 Z" fill={data.accentColor} />
                  <path d="M0 0 L10 0 L10 1.5 L1.5 1.5 L1.5 10 L0 10 Z" fill={data.borderColor} />
                  <circle cx="6" cy="6" r="2" fill={data.accentColor} opacity="0.5" />
                </svg>
              </div>
            ))}
          </>
        );
      case "classic":
      default:
        return (
          <>
            <div className="absolute" style={{ inset: "12px", border: `${bw}px solid ${data.borderColor}` }} />
            <div className="absolute" style={{ inset: "20px", border: `1px solid ${data.accentColor}` }} />
            {["top-6 left-6", "top-6 right-6 rotate-90", "bottom-6 right-6 rotate-180", "bottom-6 left-6 -rotate-90"].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-12 h-12`}>
                <svg viewBox="0 0 50 50" className="w-full h-full">
                  <path d="M0 0 L20 0 L20 3 L3 3 L3 20 L0 20 Z" fill={data.accentColor} />
                  <path d="M0 0 L10 0 L10 1.5 L1.5 1.5 L1.5 10 L0 10 Z" fill={data.borderColor} />
                </svg>
              </div>
            ))}
          </>
        );
    }
  };

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
      {renderBorder()}

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
            de formación profesional
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
