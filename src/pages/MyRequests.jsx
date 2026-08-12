import React, { useEffect, useState } from "react";
import { MessageCircle, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";
import RequestCard from "../components/RequestCard";
import ChatModal from "../components/ChatModal";
import ReviewModal from "../components/ReviewModal";

function nextDate(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function MyRequests() {
  const { profile, loadProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [myReviews, setMyReviews] = useState([]);
  const [chatReq, setChatReq] = useState(null);
  const [reviewReq, setReviewReq] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: reqs } = await supabase.from("requests").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false });
    const { data: profs } = await supabase.from("profiles").select("*");
    const { data: revs } = await supabase.from("reviews").select("*").eq("from_user", profile.id);
    const map = {}; (profs || []).forEach((p) => (map[p.id] = p));
    setProfiles(map);
    setRequests(reqs || []);
    setMyReviews(revs || []);
  }

  async function complete(r) {
    await supabase.from("requests").update({ status: "completada" }).eq("id", r.id);
    await supabase.from("profiles").update({ points: (profiles[r.volunteer_id]?.points || 0) + r.points }).eq("id", r.volunteer_id);
    await supabase.from("profiles").update({ points: profile.points - r.points }).eq("id", profile.id);

    if (r.recurrence && r.recurrence !== "ninguna") {
      const nStart = nextDate(r.start_date);
      const nEnd = nextDate(r.end_date);
      await supabase.from("requests").insert({
        owner_id: r.owner_id, pet_name: r.pet_name, pet_type: r.pet_type,
        start_date: nStart, end_date: nEnd, notes: r.notes, points: r.points,
        request_type: r.request_type, recurrence: r.recurrence, allow_cash: r.allow_cash,
        lat: r.lat, lng: r.lng,
      });
    }

    await loadProfile();
    load();
  }
  async function cancel(id) {
    await supabase.from("requests").update({ status: "cancelada" }).eq("id", id);
    load();
  }

  const reviewed = (id) => myReviews.some((rv) => rv.request_id === id);

  return (
    <div>
      <h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl mb-4">Tus solicitudes</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-center py-14" style={{ color: c.sub }}>Aún no has pedido ayuda con tus mascotas.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {requests.map((r) => (
            <RequestCard key={r.id} r={r} showOwner={false}>
              {r.status === "abierta" && (
                <button onClick={() => cancel(r.id)} className="w-full mt-3 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.bg, color: c.red }}>Cancelar</button>
              )}
              {r.status === "asignada" && (
                <div className="mt-3 space-y-2">
                  <p className="text-[12px] font-semibold" style={{ color: c.green }}>{profiles[r.volunteer_id]?.name} se ha ofrecido</p>
                  <button onClick={() => setChatReq(r)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.accent, color: "#fff" }}>
                    <MessageCircle size={14} /> Hablar con {profiles[r.volunteer_id]?.name?.split(" ")[0]}
                  </button>
                  <button onClick={() => complete(r)} className="w-full py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.ink, color: "#fff" }}>Marcar como completado</button>
                </div>
              )}
              {r.status === "completada" && (
                <div className="mt-3">
                  {reviewed(r.id) ? (
                    <p className="text-[12px] font-semibold" style={{ color: c.sub }}>Completado ✓ · Ya dejaste tu reseña</p>
                  ) : (
                    <button onClick={() => setReviewReq(r)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.gold, color: c.ink }}>
                      <Star size={14} /> Dejar reseña a {profiles[r.volunteer_id]?.name?.split(" ")[0]}
                    </button>
                  )}
                </div>
              )}
              {r.status === "cancelada" && <p className="text-[12px] font-semibold mt-3" style={{ color: c.sub, opacity: 0.7 }}>Cancelada</p>}
            </RequestCard>
          ))}
        </div>
      )}
      {chatReq && <ChatModal request={chatReq} otherUser={profiles[chatReq.volunteer_id]} onClose={() => setChatReq(null)} />}
      {reviewReq && <ReviewModal request={reviewReq} toUser={profiles[reviewReq.volunteer_id]} onClose={() => setReviewReq(null)} onDone={load} />}
    </div>
  );
}
