import React, { useState } from "react";
import { X, Share, MoreVertical, PawPrint } from "lucide-react";
import { c } from "../theme";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (isStandalone() || dismissed) return null;
  const ios = isIOS();

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4">
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: c.card, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
          <PawPrint size={18} color={c.accent} />
        </div>
        <div className="flex-1 text-[13px]" style={{ color: c.ink }}>
          <p className="font-semibold mb-1">Añádela a tu pantalla de inicio</p>
          {ios ? (
            <p style={{ color: c.sub }}>Toca <Share size={13} className="inline -mt-0.5" /> "Compartir" en Safari → "Añadir a pantalla de inicio".</p>
          ) : (
            <p style={{ color: c.sub }}>Toca <MoreVertical size={13} className="inline -mt-0.5" /> el menú del navegador → "Instalar app".</p>
          )}
        </div>
        <button onClick={() => setDismissed(true)}><X size={16} color={c.sub} /></button>
      </div>
    </div>
  );
}
