import React, { useRef, useCallback, useState } from "react";
import type { SealItem } from "@/types/certificate";

interface DraggableSealProps {
  seal: SealItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
  editable?: boolean;
}

const DraggableSeal: React.FC<DraggableSealProps> = ({ seal, containerRef, onMove, editable = false }) => {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editable || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const sealX = (seal.x / 100) * rect.width;
    const sealY = (seal.y / 100) * rect.height;
    offsetRef.current = {
      x: e.clientX - rect.left - sealX,
      y: e.clientY - rect.top - sealY,
    };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editable, seal.x, seal.y, containerRef]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left - offsetRef.current.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - offsetRef.current.y) / rect.height) * 100;
    onMove(seal.id, Math.max(0, Math.min(100, newX)), Math.max(0, Math.min(100, newY)));
  }, [dragging, containerRef, onMove, seal.id]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <img
      src={seal.image}
      alt={seal.label}
      className={`absolute object-contain select-none ${editable ? "cursor-grab" : ""} ${dragging ? "cursor-grabbing opacity-80" : ""}`}
      style={{
        left: `${seal.x}%`,
        top: `${seal.y}%`,
        width: `${seal.size}px`,
        height: `${seal.size}px`,
        transform: "translate(-50%, -50%)",
        zIndex: dragging ? 50 : 10,
      }}
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};

export default DraggableSeal;
