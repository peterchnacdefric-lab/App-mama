import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { c, display } from "../theme";

export default function VerifyNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 text-center" style={{ background: c.bg }}>
      <div className="max-w-sm rounded-[28px] p-8" style={{ background: c.card, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: c.bg }}>
          <Mail size={26} color={c.accent} />
        </div>
        <h1 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-xl mb-2">Revisa tu correo</h1>
        <p className="text-sm mb-6" style={{ color: c.sub }}>
          Te hemos enviado un enlace de confirmación. Ábrelo desde tu email para activar la cuenta y poder iniciar sesión.
        </p>
        <Link to="/login" className="font-semibold text-sm" style={{ color: c.accent }}>Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}
