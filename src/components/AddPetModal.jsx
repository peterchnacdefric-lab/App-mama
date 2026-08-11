import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1.5px solid #D8CFB4", background: "#fff", fontSize: "14px" };
const petTypeOptions = [
  { emoji: "🐕", label: "Perro" },
  { emoji: "🐈", label: "Gato" },
  { emoji: "🐇", label: "Conejo" },
  { emoji: "🐦", label: "Pájaro" },
  { emoji: "🐹", label: "Hámster/roedor" },
  { emoji: "🐢", label: "Tortuga" },
];

export default function AddPetModal({ onClose, onAdded }) {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("🐕");
  const [breed, setBreed] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("pets").insert({ owner_id: profile.id, name, type, breed: breed || "Sin especificar" });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(34,41,29,0.55)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-lg sm:rounded-lg overflow-hidden" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: c.ink }}>
          <h3 className="text-lg" style={{ ...display, color: "#fff", fontWeight: 600 }}>Añadir mascota</h3>
          <button onClick={onClose}><X size={20} color="#fff" /></button>
        </div>
        <div className="p-5">
          <label className="block mb-3">
            <span className="block text-xs font-bold uppercase mb-1" style={{ opacity: 0.6 }}>Nombre</span>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Toby" />
          </label>
          <label className="block mb-3">
            <span className="block text-xs font-bold uppercase mb-1" style={{ opacity: 0.6 }}>Tipo</span>
            <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
              {petTypeOptions.map((o) => <option key={o.emoji} value={o.emoji}>{o.emoji} {o.label}</option>)}
            </select>
          </label>
          <label className="block mb-4">
            <span className="block text-xs font-bold uppercase mb-1" style={{ opacity: 0.6 }}>Raza / descripción</span>
            <input style={inputStyle} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Ej. Mestizo mediano" />
          </label>
          <button disabled={saving || !name.trim()} onClick={submit} className="w-full py-2.5 rounded-md font-bold text-sm" style={{ background: c.ink, color: "#fff" }}>
            {saving ? "Guardando..." : "Guardar mascota"}
          </button>
        </div>
      </div>
    </div>
  );
}
