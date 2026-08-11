import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";

const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "16px", border: "none", background: "#F5F5F7", fontSize: "14px" };

const TYPES = [
  { id: "alojamiento", label: "Se queda en casa", icon: "🏠" },
  { id: "paseo", label: "Paseo", icon: "🚶" },
  { id: "visita", label: "Visita rápida", icon: "👀" },
];
const RECURRENCE = [
  { id: "ninguna", label: "Una vez" },
  { id: "diaria", label: "Cada día" },
  { id: "laborables", label: "Días laborables" },
];

function computeDays(start, end) {
  if (!start || !end) return 0;
  const d = Math.round((new Date(end) - new Date(start)) / 86400000);
  return Math.max(1, d);
}

export default function NewRequestModal({ onClose, onCreated }) {
  const { profile } = useAuth();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState("");
  const [type, setType] = useState("alojamiento");
  const [recurrence, setRecurrence] = useState("ninguna");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [allowCash, setAllowCash] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("pets").select("*").eq("owner_id", profile.id).then(({ data }) => {
      setPets(data || []);
      if (data?.[0]) setPetId(data[0].id);
    });
  }, []);

  const days = type === "visita" ? 1 : computeDays(start, end) || (recurrence !== "ninguna" ? 1 : 0);
  const pointsPerDay = type === "visita" ? 5 : 10;
  const points = days * pointsPerDay;
  const pet = pets.find((p) => p.id === petId);
  const notEnoughPoints = profile.points < points;

  async function submit() {
    if (!pet || !start || (!end && recurrence === "ninguna")) return;
    setSaving(true);
    await supabase.from("requests").insert({
      owner_id: profile.id,
      pet_name: pet.name,
      pet_type: pet.type,
      start_date: start,
      end_date: end || start,
      notes: notes || "Sin notas adicionales.",
      points,
      request_type: type,
      recurrence,
      allow_cash: allowCash,
      lat: profile.lat,
      lng: profile.lng,
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4">
          <h3 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-lg">Pedir cuidado</h3>
          <button onClick={onClose}><X size={20} color={c.sub} /></button>
        </div>
        <div className="px-6 pb-6">
          {pets.length === 0 ? (
            <p className="text-sm" style={{ color: c.ink }}>Añade primero una mascota desde "Perfil".</p>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Tipo de ayuda</p>
              <div className="flex gap-2 mb-4">
                {TYPES.map((t) => (
                  <button key={t.id} onClick={() => setType(t.id)} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold flex flex-col items-center gap-1" style={{ background: type === t.id ? c.ink : c.bg, color: type === t.id ? "#fff" : c.ink }}>
                    <span className="text-lg">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              <label className="block mb-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Mascota</span>
                <select style={inputStyle} value={petId} onChange={(e) => setPetId(e.target.value)}>
                  {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <label>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>{type === "visita" ? "Fecha" : "Desde"}</span>
                  <input type="date" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                {type !== "visita" && (
                  <label>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Hasta</span>
                    <input type="date" style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} />
                  </label>
                )}
              </div>

              <label className="block mb-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Repetir</span>
                <select style={inputStyle} value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                  {RECURRENCE.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                {recurrence !== "ninguna" && (
                  <span className="block text-[11px] mt-1" style={{ color: c.sub }}>
                    Ej. dar de comer al gato cada día: al marcar un cuidado como completado, se publica automáticamente el del día siguiente.
                  </span>
                )}
              </label>

              <label className="block mb-4">
                <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Notas</span>
                <textarea style={{ ...inputStyle, minHeight: 80 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>

              <div className="flex items-center justify-between p-3.5 rounded-2xl mb-3" style={{ background: c.bg }}>
                <span className="text-[13px] font-semibold">Huellas que ofreces</span>
                <span className="text-lg font-bold" style={{ color: notEnoughPoints ? c.red : c.ink }}>{points || "—"}</span>
              </div>

              {notEnoughPoints && points > 0 && (
                <div className="rounded-2xl p-3.5 mb-3 flex items-start gap-2" style={{ background: "#FFF4E5" }}>
                  <AlertTriangle size={16} color={c.gold} className="shrink-0 mt-0.5" />
                  <div className="text-[12px]" style={{ color: c.ink }}>
                    <p className="font-semibold mb-1">No te quedan huellas suficientes</p>
                    <p style={{ color: c.sub }}>Puedes pedir más al administrador desde tu perfil, o marcar aquí abajo que pagarás la diferencia en efectivo directamente a la persona que te ayude.</p>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2.5 mb-4 px-1">
                <input type="checkbox" checked={allowCash} onChange={(e) => setAllowCash(e.target.checked)} className="w-4 h-4" style={{ accentColor: c.accent }} />
                <span className="text-[13px]" style={{ color: c.ink }}>Acepto pagar en efectivo si me faltan huellas 💵</span>
              </label>

              <button disabled={saving || !start || (!end && recurrence === "ninguna") || !pet} onClick={submit} className="w-full py-3.5 rounded-2xl font-semibold text-[15px]" style={{ background: c.accent, color: "#fff" }}>
                {saving ? "Publicando..." : "Publicar solicitud"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
