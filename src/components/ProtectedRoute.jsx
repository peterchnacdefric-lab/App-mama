import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { c } from "../theme";

export function RequireAuth({ children }) {
  const { session, profile } = useAuth();
  if (session === undefined) return <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>Cargando…</div>;
  if (session === null) return <Navigate to="/login" replace />;
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>Cargando tu perfil…</div>;
  return children;
}

export function RequireAdmin({ children }) {
  const { profile } = useAuth();
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return children;
}
