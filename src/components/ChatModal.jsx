import React, { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

export default function ChatModal({ request, otherUser, onClose }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`messages-${request.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${request.id}` }, (payload) => {
        setMessages((m) => [...m, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [request.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function load() {
    const { data } = await supabase.from("messages").select("*").eq("request_id", request.id).order("created_at");
    setMessages(data || []);
  }

  async function send() {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await supabase.from("messages").insert({ request_id: request.id, sender_id: profile.id, text });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col" style={{ background: c.card, height: "70vh", maxHeight: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${c.line}` }}>
          <span className="text-2xl">{otherUser?.avatar}</span>
          <div className="flex-1">
            <p className="font-semibold text-[14px]" style={{ color: c.ink }}>{otherUser?.name}</p>
            <p className="text-[11px]" style={{ color: c.sub }}>Sobre {request.pet_name}</p>
          </div>
          <button onClick={onClose}><X size={20} color={c.sub} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && <p className="text-[12px] text-center mt-6" style={{ color: c.sub }}>Aún no hay mensajes. ¡Saluda!</p>}
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
    </div>
  );
}
