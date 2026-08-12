import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Search, EyeOff, Eye, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { c, display } from "../theme";
import AdminChatModal from "../components/AdminChatModal";

const inputStyle = { background: "#F5F5F7", border: "none" };

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [pointRequests, setPointRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("huellas");
  const [reqSearch, setReqSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [editingPoints, setEditingPoints] = useState({});
  const [chatUser, setChatUser] = useState(null);
  const [defaultPoints, setDefaultPoints] = useState(200);
  const [savingDefault, setSavingDefault] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: reqs } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: prs } = await supabase.from("point_requests").select("*").order("created_at", { ascending: false });
    const { data: reps } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    const { data: settings } = await supabase.from("app_settings").select("*").eq("key", "default_points").single();
    setRequests(reqs || []);
    setUsers(profs || []);
    setPointRequests(prs || []);
    setReports(reps || []);
    if (settings) setDefaultPoints(settings.value);
  }

  async function saveDefaultPoints() {
    setSavingDefault(true);
    await supabase.from("app_settings").update({ value: Number(defaultPoints) }).eq("key", "default_points");
    setSavingDefault(false);
  }

  async function deleteRequest(id) {
    await supabase.from("requests").delete().eq("id", id);
    load();
  }
  async function toggleHidden(r) {
    await supabase.from("requests").update({ is_hidden: !r.is_hidden }).eq("id", r.id);
    load();
  }
  async function saveRequestPoints(r) {
    const val = Number(editingPoints[r.id]);
    if (!Number.isFinite(val)) return;
    await supabase.from("requests").update({ points: val }).eq("id", r.id);
    setEditingPoints((e) => { const n = { ...e }; delete n[r.id]; return n; });
    load();
  }
  async function toggleAdmin(id, current) {
    await supabase.from("profiles").update({ is_admin: !current }).eq("id", id);
    load();
  }
  async function saveUserPoints(u, val) {
    const n = Number(val);
    if (!Number.isFinite(n)) return;
    await supabase.from("profiles").update({ points: n }).eq("id", u.id);
    load();
  }
  async function grantPoints(pr) {
    const user = users.find((u) => u.id === pr.user_id);
    await supabase.from("profiles").update({ points: (user?.points || 0) + pr.amount }).eq("id", pr.user_id);
    await supabase.from("point_requests").update({ status: "concedida" }).eq("id", pr.id);
    load();
  }
  async function rejectPoints(id) {
    await supabase.from("point_requests").update({ status: "rechazada" }).eq("id", id);
    load();
  }
  async function resolveReport(id) {
    await supabase.from("reports").update({ status: "resuelta" }).eq("id", id);
    load();
  }

  const userName = (id) => users.find((u) => u.id === id)?.name || "—";
  const pendingPoints = pointRequests.filter((p) => p.status === "pendiente");
  const pendingReports = reports.filter((r) => r.status === "pendiente");

  const filteredRequests = useMemo(() => {
    const q = reqSearch.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => (r.pet_name + " " + userName(r.owner_id) + " " + r.status).toLowerCase().includes(q));
  }, [requests, reqSearch, users]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.name + " " + (u.neighborhood || "")).toLowerCase().includes(q));
  }, [users, userSearch]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><ShieldCheck color={c.accent} size={20} /><h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl">Administración</h2></div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          ["huellas", `Solicitudes de huellas${pendingPoints.length ? ` (${pendingPoints.length})` : ""}`],
          ["quejas", `Quejas y sugerencias${pendingReports.length ? ` (${pendingReports.length})` : ""}`],
          ["anuncios", "Anuncios"],
          ["usuarios", "Usuarios"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className="px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap" style={{ background: tab === id ? c.ink : c.card, color: tab === id ? "#fff" : c.sub, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "huellas" && (
        <div className="space-y-2">
          {pointRequests.length === 0 ? <p className="text-[13px]" style={{ color: c.sub }}>No hay solicitudes de huellas.</p> : pointRequests.map((pr) => (
            <div key={pr.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: c.ink }}>{userName(pr.user_id)}</p>
                <p className="text-[12px]" style={{ color: c.sub }}>Pide {pr.amount} huellas · {pr.status}</p>
              </div>
              {pr.status === "pendiente" && (
                <div className="flex gap-2">
                  <button onClick={() => rejectPoints(pr.id)} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ color: c.red, background: c.bg }}>Rechazar</button>
                  <button onClick={() => grantPoints(pr)} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ color: "#fff", background: c.green }}>Conceder</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "quejas" && (
        <div className="space-y-2">
          {reports.length === 0 ? <p className="text-[13px]" style={{ color: c.sub }}>No hay quejas ni sugerencias.</p> : reports.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ background: r.type === "queja" ? "#FDE8E6" : "#E8F3FF", color: r.type === "queja" ? c.red : c.accent }}>{r.type}</span>
                <span className="text-[11px]" style={{ color: c.sub }}>{userName(r.user_id)}</span>
              </div>
              <p className="text-[13px] mb-2" style={{ color: c.ink }}>{r.message}</p>
              {r.status === "pendiente" ? (
                <button onClick={() => resolveReport(r.id)} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ color: "#fff", background: c.green }}>Marcar como resuelta</button>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: c.sub }}>Resuelta ✓</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "anuncios" && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Search size={15} color={c.sub} />
            <input value={reqSearch} onChange={(e) => setReqSearch(e.target.value)} placeholder="Buscar por mascota, dueño o estado..." className="flex-1 text-[13px]" style={{ background: "transparent", border: "none", outline: "none" }} />
          </div>
          <div className="space-y-2">
            {filteredRequests.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", opacity: r.is_hidden ? 0.5 : 1 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{r.pet_type}</span>
                    <div>
                      <p className="text-[13px] font-semibold">{r.pet_name} — {r.status} {r.is_hidden && "(oculto)"}</p>
                      <p className="text-[11px]" style={{ color: c.sub }}>{userName(r.owner_id)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleHidden(r)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.bg }} title={r.is_hidden ? "Mostrar" : "Ocultar"}>
                      {r.is_hidden ? <Eye size={14} color={c.ink} /> : <EyeOff size={14} color={c.ink} />}
                    </button>
                    <button onClick={() => deleteRequest(r.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
                      <Trash2 size={14} color={c.red} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px]" style={{ color: c.sub }}>Huellas de este anuncio:</span>
                  <input
                    type="number"
                    value={editingPoints[r.id] ?? r.points}
                    onChange={(e) => setEditingPoints((s) => ({ ...s, [r.id]: e.target.value }))}
                    className="w-20 px-2 py-1 rounded-lg text-[13px]"
                    style={inputStyle}
                  />
                  <button onClick={() => saveRequestPoints(r)} className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: c.accent, color: "#fff" }}>Guardar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "usuarios" && (
        <div>
          <div className="flex items-center gap-2 mb-3 p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <span className="text-[13px] font-semibold flex-1" style={{ color: c.ink }}>Huellas de regalo al registrarse</span>
            <input type="number" value={defaultPoints} onChange={(e) => setDefaultPoints(e.target.value)} className="w-20 px-2 py-1 rounded-lg text-[13px]" style={inputStyle} />
            <button onClick={saveDefaultPoints} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ background: c.accent, color: "#fff" }}>
              {savingDefault ? "..." : "Guardar"}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Search size={15} color={c.sub} />
            <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Buscar por nombre o zona..." className="flex-1 text-[13px]" style={{ background: "transparent", border: "none", outline: "none" }} />
          </div>
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{u.avatar}</span>
                    <div><p className="text-[13px] font-semibold">{u.name}</p><p className="text-[11px]" style={{ color: c.sub }}>{u.neighborhood || "Sin zona"} {u.is_admin && "· Admin"}</p></div>
                  </div>
                  <button onClick={() => toggleAdmin(u.id, u.is_admin)} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ background: u.is_admin ? c.red : c.bg, color: u.is_admin ? "#fff" : c.ink }}>
                    {u.is_admin ? "Quitar admin" : "Hacer admin"}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px]" style={{ color: c.sub }}>Huellas:</span>
                  <input type="number" defaultValue={u.points} onBlur={(e) => saveUserPoints(u, e.target.value)} className="w-20 px-2 py-1 rounded-lg text-[13px]" style={inputStyle} />
                  <span className="text-[11px]" style={{ color: c.sub }}>(se guarda al salir del campo)</span>
                </div>
                <button onClick={() => setChatUser(u)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full" style={{ background: c.bg, color: c.accent }}>
                  <MessageCircle size={13} /> Escribir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {chatUser && <AdminChatModal userId={chatUser.id} userLabel={chatUser.name} onClose={() => setChatUser(null)} />}
    </div>
  );
}
