import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";
import Header from "./components/Header";
import InstallBanner from "./components/InstallBanner";
import ShareButton from "./components/ShareButton";
import { pushSupported, subscribeToPush } from "./lib/push";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyNotice from "./pages/VerifyNotice";
import Feed from "./pages/Feed";
import MyRequests from "./pages/MyRequests";
import Caring from "./pages/Caring";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import { c } from "./theme";

function Layout({ children }) {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile && pushSupported() && Notification.permission === "default") {
      subscribeToPush(profile.id).catch(() => {});
    }
  }, [profile?.id]);

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      <InstallBanner />
      <Header />
      <main className="max-w-3xl mx-auto px-4 pb-10">{children}</main>
      <div className="max-w-3xl mx-auto px-4 pb-6"><ShareButton /></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Signup />} />
          <Route path="/verifica-tu-email" element={<VerifyNotice />} />
          <Route path="/" element={<RequireAuth><Layout><Feed /></Layout></RequireAuth>} />
          <Route path="/mis-solicitudes" element={
