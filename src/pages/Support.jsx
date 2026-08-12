import React, { useEffect } from "react";
import { display, c } from "../theme";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import AdminChatModalEmbedded from "../components/AdminChatModalEmbedded";

export default function Support() {
  const { profile, loadProfile } = useAuth();

  useEffect(() => {
    supabase.from("profiles").update({ last_seen_support: new Date().toISOString() }).eq("id", profile.id).then(loadProfile);
  }, []);

  return (
    <div>
      <h2 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl mb-1">Soporte</h2>
      <p className="text-sm mb-4" style={{ color: c.sub }}>Habla directamente con el administrador de Huellas del Barrio.</p>
      <AdminChatModalEmbedded userId={profile.id} />
    </div>
  );
}
