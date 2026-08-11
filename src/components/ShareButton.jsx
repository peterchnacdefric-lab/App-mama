import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { c } from "../theme";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin;
    const shareData = { title: "Huellas del Barrio", text: "Únete a los vecinos que cuidan mascotas cerca de ti 🐾", url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button onClick={share} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-[13px]" style={{ background: c.card, color: c.accent, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      {copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Enlace copiado" : "Invitar a un vecino"}
    </button>
  );
}
