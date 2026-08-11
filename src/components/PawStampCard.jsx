import React from "react";
import { Sparkles } from "lucide-react";
import { c } from "../theme";

export default function PawStampCard({ points }) {
  const stamps = Math.max(0, Math.floor(points / 10));
  const total = 20;
  return (
    <div className="rounded-3xl p-6" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-1">
        <p style={{ color: c.ink, fontWeight: 700 }} className="text-[15px]">Cartilla de Huellas</p>
        <Sparkles size={14} color={c.gold} />
      </div>
      <p className="text-[12px] mb-4" style={{ color: c.sub }}>Cada cuidado completado te da un sello.</p>
      <div className="rounded-2xl p-4" style={{ background: c.bg, border: `1.5px dashed ${c.line}` }}>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < stamps;
            const rot = ((i * 37) % 17) - 8;
            return (
              <div key={i} className="aspect-square rounded-full flex items-center justify-center" style={{ background: filled ? "#FFF7E8" : "#fff", border: `2px solid ${filled ? c.gold : c.line}` }}>
                <span style={{ fontSize: 16, transform: `rotate(${filled ? rot : 0}deg)`, opacity: filled ? 1 : 0.25 }}>🐾</span>
              </div>
            );
          })}
        </div>
      </div>
      {points < 0 && (
        <p className="text-[12px] font-semibold mt-3" style={{ color: c.red }}>
          Estás en negativo ({points}). Pide más huellas al administrador desde el botón de arriba.
        </p>
      )}
    </div>
  );
}
