import React, { useEffect, useState } from "react";
import { MessageCircle, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";
import RequestCard from "../components/RequestCard";
import ChatModal from "../components/ChatModal";
import ReviewModal from "../components/ReviewModal";

export default function Caring() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [myReviews, setMyReviews] = useState([]);
  const [chatReq, setChatReq] = useState(null);
  const [reviewReq, setReviewReq] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: reqs } = await supabase.from("requests").select("*").eq("volunteer_id", profile.id).order("created_at", { ascending: false });
    const { data: profs } = await supabase.from("profiles").select("*");
    const { data: revs } = await supabase.from("reviews").select("*").eq("from_user", profile.id);
    const map = {}; (profs || []).forEach((p) => (map[p.id] = p));
    setProfiles(map);
    setRequests(reqs || []);
    setMyReviews(revs || []);
  }

  async function withdraw(id) {
    await supabase.from("requests").update({ status: "abierta", volunteer_id: null }).eq("id", id);
    load();
  }

  const reviewed = (id) => myReviews.some((rv) => rv.request_id === id);

  return (
    <div>
      <h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl mb-4">Cuidados en los que ayudas</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-center py-14" style={{ color: c.sub }}>Aún no cuidas de ninguna mascota. Ofrécete desde "Cerca de ti".</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {requests.map((r) => (
            <RequestCard key={r.id} r={r} owner={profiles[r.owner_id]}>
              {r.status === "asignada" && (
                <div className="mt-3 space-y-2">
                  <button onClick={() => setChatReq(r)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.accent, color: "#fff" }}>
                    <MessageCircle size={14} /> Hablar con {profiles[r.owner_id]?.name?.split(" ")[0]}
                  </button>
                  <button onClick={() => withdraw(r.id)} className="w-full py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.bg, color: c.red }}>Retirar mi oferta</button>
                </div>
              )}
              {r.status === "completada" && (
                <div className="mt-3">
                  <p className="text-[12px] font-semibold mb-2" style={{ color: c.green }}>Ganaste {r.points} huellas ✓</p>
                  {reviewed(r.id) ? (
                    <p className="text-[12px] font-semibold" style={{ color: c.sub }}>Ya dejaste tu reseña</p>
                  ) : (
                    <button onClick={() => setReviewReq(r)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[13px]" style={{ background: c.gold, color: c.ink }}>
                      <Star size={14} /> Dejar reseña a {profiles[r.owner_id]?.name?.split(" ")[0]}
                    </button>
                  )}
                </div>
              )}
            </RequestCard>
          ))}
        </div>
      )}
      {chatReq && <ChatModal request={chatReq} otherUser={profiles[chatReq.owner_id]} onClose={() => setChatReq(null)} />}
      {reviewReq && <ReviewModal request={reviewReq} toUser={profiles[reviewReq.owner_id]} onClose={() => setReviewReq(null)} onDone={load} />}
    </div>
  );
}
