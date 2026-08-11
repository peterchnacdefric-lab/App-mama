import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

export default function FeedbackModal({ onClose }) {
  const { profile } = useAuth();
  const [type, setType] = useState("sugerencia");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    await supabase.from("reports").insert({ user_id: profile.id, type, message });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] p-6" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: c.ink, fontWeight: 700 }} className="text-lg">Queja o sugerencia</h3>
          <button onClick={onClose}><X size={20} color={c.sub} /></button>
        </div>
        {sent ? (
          <p className="text-[14px] py-6 text-center" style={{ color: c.green }}>¡Gracias! Se lo hemos hecho llegar al administrador.</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              {[["sugerencia","Sugerencia"],["queja","Queja"]].map(([id, label]) => (
                <button key={id} onClick={() => setType(id)} className="flex-1 py-2 rounded-xl text-[13px] font-semibold" style={{ background: type === id ? c.ink : c.bg, color: type === id ? "#fff" : c.sub }}>{label}</button>
              ))}
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Cuéntanos qué pasó o qué mejorarías..." className="w-full px-4 py-3 rounded-2xl text-[14px] mb-4" style={{ background: c.bg, border: "none", minHeight: 110 }} />
            <button onClick={submit} className="w-full py-3.5 rounded-2xl font-semibold text-[15px]" style={{ background: c.accent, color: "#fff" }}>Enviar al administrador</button>
          </>
        )}
      </div>
    </div>
  );
}
