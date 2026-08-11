import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

const AVATAR_OPTIONS = [
  "🙂","😺","🐕","🐈","🐇","🐹","🦜","🐢","🐾","🌻","🌳","⭐","🏡","🚲","☕","🎨",
];

export default function EditProfileModal({ onClose }) {
  const { profile, loadProfile } = useAuth();
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "🙂");
  const [bio, setBio] = useState(profile.bio || "");
  const [zone, setZone] = useState(profile.neighborhood || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from("profiles").update({ name, avatar, bio, neighborhood: zone }).eq("id", profile.id);
    await loadProfile();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] p-6 max-h-[85vh] overflow-y-auto" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: c.ink, fontWeight: 700 }} className="text-lg">Editar perfil</h3>
          <button onClick={onClose}><X size={20} color={c.sub} /></button>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: c.sub }}>Avatar / logo</p>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {AVATAR_OPTIONS.map((e) => (
            <button key={e} onClick={() => setAvatar(e)} className="aspect-square rounded-xl flex items-center justify-center text-lg" style={{ background: avatar === e ? c.accent : c.bg, border: avatar === e ? `2px solid ${c.accent}` : "2px solid transparent" }}>
              {e}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-[14px]" style={{ background: c.bg, border: "none" }} />
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Zona aproximada</span>
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Ej. Gràcia" className="w-full px-4 py-3 rounded-2xl text-[14px]" style={{ background: c.bg, border: "none" }} />
            <span className="block text-[11px] mt-1" style={{ color: c.sub }}>Solo se muestra el barrio, nunca tu dirección ni tu ubicación exacta.</span>
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>Sobre ti</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntale al barrio algo sobre ti o tus mascotas..." className="w-full px-4 py-3 rounded-2xl text-[14px]" style={{ background: c.bg, border: "none", minHeight: 90 }} />
          </label>
        </div>

        <button disabled={saving} onClick={save} className="w-full py-3.5 rounded-2xl font-semibold text-[15px] mt-4" style={{ background: c.accent, color: "#fff" }}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
