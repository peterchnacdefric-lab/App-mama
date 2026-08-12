import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";
import { distanceKm } from "../lib/geo";
import RequestCard from "../components/RequestCard";
import NewRequestModal from "../components/NewRequestModal";

export default function Feed() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [radius, setRadius] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: reqs } = await supabase
      .from("requests")
      .select("*")
      .in("status", ["abierta", "asignada"])
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });
    const { data: profs } = await supabase.from("profiles").select("*");
    const map = {};
    (profs || []).forEach((p) => (map[p.id] = p));
    setProfiles(map);
    setRequests(reqs || []);
    setLoading(false);
  }

  async function offer(reqId) {
    await supabase.from("requests").update({ status: "asignada", volunteer_id: profile.id }).eq("id", reqId);
    load();
  }

  const withDistance = (requests || [])
    .filter((r) => r.owner_id !== profile.id)
    .map((r) => ({
      r,
      km: profile?.lat != null ? distanceKm(profile.lat, profile.lng, r.lat, r.lng) : null,
    }))
    .filter(({ km }) => km === null || km <= radius)
    .sort((a, b) => (a.km ?? 9999) - (b.km ?? 9999));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl">Cerca de ti</h2>
          <p className="text-sm mt-1" style={{ color: c.sub }}>Vecinos que necesitan ayuda con sus mascotas.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: c.accent, color: "#fff" }}>
          <Plus size={18} />
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-5" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between text-[13px] font-semibold mb-2" style={{ color: c.ink }}>
          <span>Radio de búsqueda</span>
          <span style={{ color: c.accent }}>{radius} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: c.accent }}
        />
        {profile?.lat == null && (
          <p className="text-[11px] mt-1" style={{ color: c.sub }}>
            Activa tu ubicación desde "Perfil" para filtrar por distancia real.
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: c.sub }}>Cargando…</p>
      ) : withDistance.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: c.sub }}>
          No hay solicitudes dentro de {radius} km. Prueba a ampliar el radio.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {withDistance.map(({ r, km }) => (
            <RequestCard key={r.id} r={r} owner={profiles[r.owner_id]} distanceKm={km}>
              {r.status === "abierta" ? (
                <button onClick={() => offer(r.id)} className="w-full mt-3 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.ink, color: "#fff" }}>
                  Ofrecerme a cuidar
                </button>
              ) : (
                <p className="text-[12px] font-semibold mt-3" style={{ color: c.green }}>
                  Ya se ha ofrecido {profiles[r.volunteer_id]?.name}
                </p>
              )}
            </RequestCard>
          ))}
        </div>
      )}

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}
