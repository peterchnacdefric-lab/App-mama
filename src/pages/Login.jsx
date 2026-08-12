import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "./Signup";
import { c, display } from "../theme";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Email not confirmed")
          ? "Confirma tu email antes de iniciar sesión (revisa tu bandeja de entrada)."
          : "Email o contraseña incorrectos."
      );
      return;
    }
    nav("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: c.bg }}>
      <div className="w-full max-w-sm rounded-[28px] p-8" style={{ background: c.card, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: c.bg }}>
          <PawPrint color={c.accent} size={26} />
        </div>
        <h1 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl mb-1">Huellas del Barrio</h1>
        <p className="text-sm mb-6" style={{ color: c.sub }}>Inicia sesión para ver a tus vecinos.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Contraseña" type="password" value={password} onChange={setPassword} required />
          {error && <p className="text-sm font-semibold" style={{ color: c.red }}>{error}</p>}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl font-semibold text-[15px] mt-1" style={{ background: c.accent, color: "#fff" }}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-[13px] mt-5 text-center" style={{ color: c.sub }}>
          ¿Aún no tienes cuenta? <Link to="/registro" className="font-semibold" style={{ color: c.accent }}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
