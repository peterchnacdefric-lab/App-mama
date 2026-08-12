import React, { useEffect, useState } from "react";
import { MapPin, Plus, LogOut, Pencil, MessageSquareWarning, Star, Bell, BellOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";
import { getCurrentPosition } from "../lib/geo";
import { pushSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } from "../lib/push";
import AddPetModal from "../components/AddPetModal";
import PawStampCard from "../components/PawStampCard";
import EditProfileModal from "../components/EditProfileModal";
import FeedbackModal from "../components/FeedbackModal";

export default function Profile() {
  const { profile, loadProfile, signOut } = useAuth();
  const [pets, setPets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [locStatus, setLocStatus] = useState("idle");
  const [pointReqSent, setPointReqSent] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => { if (pushSupported()) isSubscribed().then(setPushOn); }, []);

  async function togglePush() {
    setPushBusy(true);
    try {
      if (pushOn) {
        await unsubscribeFromPush();
        setPushOn(false);
      } else {
        await subscribeToPush(profile.id);
        setPushOn(true);
      }
    } catch (e) {
      alert(e.message);
    }
    setPushBusy(false);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("pets").select("*").eq("owner_id", profile.id);
    setPets(data || []);
    const { data: revs } = await supabase.from("reviews").select("*").eq("to_user", profile.id);
    setReviews(revs || []);
  }

  async function activateLocation() {
    setLocStatus("loading");
    try {
      const { lat, lng } = await getCurrentPosition();
      let neighborhood = null;
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`);
        const d = await res.json();
        neighborhood = d.locality || d.city || d.principalSubdivision || null;
      } catch {}
      await supabase.from("profiles").update({ lat, lng, neighborhood }).eq("id", profile.id);
      await loadProfile();
      setLocStatus("ok");
    } catch {
      setLocStatus("error");
    }
  }

  async function requestPoints() {
    await supabase.from("point_requests").insert({ user_id: profile.id, amount: 50 });
    setPointReqSent(true);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: c.bg }}>{profile.avatar}</div>
          <div className="flex-1">
            <h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-xl">{profile.name}</h2>
            <p className="text-[13px] flex items-center gap-2" style={{ color: c.sub }}>
              <span className="flex items-center gap-1"><MapPin size={13} /> {profile.neighborhood || "Zona no indicada"}</span>
              {reviews.length > 0 && (
                <span className="flex items-center gap-1"><Star size={12} fill={c.gold} stroke={c.gold} /> {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length})</span>
              )}
            </p>
          </div>
          <div className="text-center px-4 py-2.5 rounded-2xl" style={{ background: profile.points < 0 ? c.red : c.ink }}>
            <p className="text-xl font-bold" style={{ color: "#fff" }}>{profile.points}</p>
            <p className="text-[9px] font-semibold uppercase" style={{ color: profile.points < 0 ? "#fff" : c.gold }}>huellas</p>
          </div>
        </div>

        {profile.bio && <p className="text-[13px] mb-3" style={{ color: c.ink, opacity: 0.8 }}>{profile.bio}</p>}

        <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 text-[13px] font-semibold mb-3" style={{ color: c.accent }}>
          <Pencil size={13} /> Editar perfil
        </button>

        {profile.points < 20 && (
          <button onClick={requestPoints} disabled={pointReqSent} className="w-full py-3 rounded-2xl font-semibold text-[14px] mb-2" style={{ background: pointReqSent ? c.line : c.gold, color: c.ink }}>
            {pointReqSent ? "Solicitud enviada al administrador" : "Pedir más huellas al administrador"}
          </button>
        )}

        {profile.lat == null ? (
          <button onClick={activateLocation} className="w-full py-3 rounded-2xl font-semibold text-[14px]" style={{ background: c.accent, color: "#fff" }}>
            {locStatus === "loading" ? "Localizando..." : "Activar mi ubicación"}
          </button>
        ) : (
          <button onClick={activateLocation} className="text-[13px] font-semibold" style={{ color: c.accent }}>Actualizar ubicación</button>
        )}
        {locStatus === "error" && <p className="text-[12px] mt-1" style={{ color: c.red }}>No se pudo obtener tu ubicación. Revisa los permisos del navegador.</p>}
      </div>

      {pushSupported() && (
        <div className="rounded-3xl p-5 flex items-center gap-3" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
            {pushOn ? <Bell size={18} color={c.accent} /> : <BellOff size={18} color={c.sub} />}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold" style={{ color: c.ink }}>Notificaciones en el móvil</p>
            <p className="text-[12px]" style={{ color: c.sub }}>Avisos de mensajes nuevos aunque tengas la app cerrada.</p>
          </div>
          <button disabled={pushBusy} onClick={togglePush} className="text-[12px] font-semibold px-3 py-2 rounded-full shrink-0" style={{ background: pushOn ? c.bg : c.accent, color: pushOn ? c.ink : "#fff" }}>
            {pushBusy ? "..." : pushOn ? "Desactivar" : "Activar"}
          </button>
        </div>
      )}

      <PawStampCard points={profile.points} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-[15px]">Tus mascotas</p>
          <button onClick={() => setShowAddPet(true)} className="flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-full" style={{ background: c.card, color: c.accent, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Plus size={14} /> Añadir
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {pets.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <span className="text-2xl">{p.type}</span>
              <div><p className="font-semibold text-[14px]">{p.name}</p><p className="text-[12px]" style={{ color: c.sub }}>{p.breed}</p></div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setShowFeedback(true)} className="flex items-center gap-2 text-[13px] font-semibold px-2" style={{ color: c.ink }}>
        <MessageSquareWarning size={15} /> Enviar queja o sugerencia
      </button>

      <button onClick={signOut} className="flex items-center gap-2 text-[13px] font-semibold px-2" style={{ color: c.red }}>
        <LogOut size={15} /> Cerrar sesión
      </button>

      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)} onAdded={load} />}
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}
