import React from "react";
import { Calendar, MapPin, Repeat, Banknote } from "lucide-react";
import { c } from "../theme";
import { formatDistance } from "../lib/geo";

const TYPE_ICON = { alojamiento: "🏠", paseo: "🚶", visita: "👀" };

export default function RequestCard({ r, owner, distanceKm, showOwner = true, children }) {
  return (
    <div className="rounded-3xl p-5" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl" style={{ background: c.bg }}>{r.pet_type}</div>
          <div>
            <p className="font-semibold text-[14px] flex items-center gap-1" style={{ color: c.ink }}>
              {r.pet_name} <span className="text-[13px]">{TYPE_ICON[r.request_type] || ""}</span>
            </p>
            {showOwner && owner && (
              <p className="text-[12px] flex items-center gap-1" style={{ color: c.sub }}>
                {owner.avatar} {owner.name} · <MapPin size={10} /> {formatDistance(distanceKm)}
              </p>
            )}
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: c.bg, color: c.ink }}>{r.points}🐾</span>
      </div>
      <p className="text-[12px] flex items-center gap-1 mb-1" style={{ color: c.sub }}>
        <Calendar size={12} /> {r.start_date}{r.start_date !== r.end_date ? ` – ${r.end_date}` : ""}
      </p>
      <div className="flex items-center gap-2 mb-2">
        {r.recurrence && r.recurrence !== "ninguna" && (
          <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#E8F3FF", color: c.accent }}>
            <Repeat size={10} /> {r.recurrence === "diaria" ? "Cada día" : "Laborables"}
          </span>
        )}
        {r.allow_cash && (
          <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#E9F9EC", color: c.green }}>
            <Banknote size={10} /> Acepta efectivo
          </span>
        )}
      </div>
      <p className="text-[13px]" style={{ color: c.ink, opacity: 0.85 }}>{r.notes}</p>
      {children}
    </div>
  );
}
