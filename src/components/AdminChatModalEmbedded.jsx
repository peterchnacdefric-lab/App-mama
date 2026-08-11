import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

export default function AdminChatModalEmbedded({ userId }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`admin-chat-embed-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_chat", filter: `user_id=eq.${userId}` }, (payload) => {
        setMessages((m) => [...m, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function load() {
    const { data } = await supabase.from("admin_chat").select("*").eq("user_id", userId).order("created_at");
    setMessages(data || []);
  }

  async function send() {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await supabase.from("admin_chat").insert({ user_id: userId, sender_id: profile.id, text });
  }

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", height: "60vh" }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && <p className="text-[12px] text-center mt-6" style={{ color: c.sub }}>Aún no hay mensajes. Si tienes cualquier duda, escribe aquí.</p>}
        {messages.map((m) => (
          <div key={m.id} className="flex" style={{ justifyContent: m.sender_id === profile.id ? "flex-end" : "flex-start" }}>
            <div className="px-3.5 py-2 rounded-2xl text-[13px] max-w-[75%]" style={{ background: m.sender_id === profile.id ? c.accent : c.bg, color: m.sender_id === profile.id ? "#fff" : c.ink }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 flex items-center gap-2" style={{ borderTop: `1px solid ${c.line}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2.5 rounded-full text-[13px]" style={{ background: c.bg, border: "none" }} />
        <button onClick={send} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.accent }}><Send size={16} color="#fff" /></button>
      </div>
    </div>
  );
}
