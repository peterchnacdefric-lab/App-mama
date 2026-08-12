import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

export default function ReviewModal({ request, toUser, onClose, onDone }) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      request_id: request.id,
      from_user: profile.id,
      to_user: toUser.id,
      rating,
      comment,
    });
    setSaving(false);
    if (error) {
      setError(error.message.includes("duplicate") ? "Ya has dejado una reseña para este cuidado." : "No se pudo guardar la reseña.");
      return;
    }
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] p-6" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 style={{ color: c.ink, fontWeight: 700 }} className="text-lg">Reseña para {toUser.name}</h3>
          <button onClick={onClose}><X size={20} color={c.sub} /></button>
        </div>
        <p className="text-[12px] mb-4" style={{ color: c.sub }}>Sobre el cuidado de {request.pet_name}</p>

        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star size={28} fill={n <= rating ? c.gold : "none"} stroke={n <= rating ? c.gold : c.line} />
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="¿Cómo fue la experiencia? (opcional)" className="w-full px-4 py-3 rounded-2xl text-[14px] mb-3" style={{ background: c.bg, border: "none", minHeight: 90 }} />
        {error && <p className="text-[12px] font-semibold mb-2" style={{ color: c.red }}>{error}</p>}
        <button disabled={saving} onClick={submit} className="w-full py-3.5 rounded-2xl font-semibold text-[15px]" style={{ background: c.accent, color: "#fff" }}>
          {saving ? "Guardando..." : "Enviar reseña"}
        </button>
      </div>
    </div>
  );
}
