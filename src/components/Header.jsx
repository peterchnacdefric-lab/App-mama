import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { PawPrint, ShieldCheck, HelpCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";
import OnboardingModal from "./OnboardingModal";

export default function Header() {
  const { profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!profile) return;
    loadUnread();
    const channel = supabase
      .channel(`unread-support-${profile.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_chat", filter: `user_id=eq.${profile.id}` }, (payload) => {
        if (payload.new.sender_id !== profile.id) setUnread((n) => n + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile?.id]);

  async function loadUnread() {
    const { count } = await supabase
      .from("admin_chat")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .neq("sender_id", profile.id)
      .gt("created_at", profile.last_seen_support);
    setUnread(count || 0);
  }

  if (!profile) return null;

  const tabs = [
    { to: "/", label: "Cerca de ti", end: true },
    { to: "/mis-solicitudes", label: "Mis solicitudes" },
    { to: "/mis-cuidados", label: "Mis cuidados" },
    { to: "/perfil", label: "Perfil" },
    { to: "/soporte", label: "Soporte", badge: unread },
  ];
  if (profile.is_admin) tabs.push({ to: "/admin", label: "Admin" });

  return (
    <header className="max-w-3xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.ink }}>
            <PawPrint color="#fff" size={18} />
          </div>
          <h1 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-lg">Huellas</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowOnboarding(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <HelpCircle size={16} color={c.sub} />
          </button>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-semibold" style={{ background: c.card, color: profile.points < 0 ? c.red : c.ink, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <PawPrint size={12} color={profile.points < 0 ? c.red : c.accent} fill={profile.points < 0 ? c.red : c.accent} /> {profile.points}
          </div>
        </div>
      </div>
      <div className="flex p-1 rounded-2xl mb-5 overflow-x-auto" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className="flex-1 px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap flex items-center justify-center gap-1 relative"
            style={({ isActive }) => ({ background: isActive ? c.ink : "transparent", color: isActive ? "#fff" : c.sub })}
          >
            {t.label === "Admin" && <ShieldCheck size={13} />} {t.label}
            {!!t.badge && (
              <span className="flex items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#FF3B30", color: "#fff", minWidth: 16, height: 16, padding: "0 4px" }}>
                {t.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </header>
  );
}
