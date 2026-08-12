import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { c, display } from "../theme";

export default function Signup() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    nav("/verifica-tu-email");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: c.bg }}>
      <div className="w-full max-w-sm rounded-[28px] p-8" style={{ background: c.card, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)" }}>
        <h1 style={{ ...display, color: c.ink, fontWeight: 700 }} className="text-2xl mb-1">Crear cuenta</h1>
        <p className="text-sm mb-6" style={{ color: c.sub }}>Te enviaremos un email para confirmarla.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nombre" value={name} onChange={setName} required />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Contraseña (mín. 6 caracteres)" type="password" value={password} onChange={setPassword} required />
          {error && <p className="text-sm font-semibold" style={{ color: c.red }}>{error}</p>}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl font-semibold text-[15px] mt-1" style={{ background: c.ink, color: "#fff" }}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <button onClick={() => nav("/login")} className="text-[13px] mt-5 font-semibold block mx-auto" style={{ color: c.accent }}>Volver a iniciar sesión</button>
      </div>
    </div>
  );
}

export function Input({ label, type = "text", value, onChange, required }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.sub }}>{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl text-[14px]"
        style={{ background: c.bg, border: "none" }}
      />
    </label>
  );
}
