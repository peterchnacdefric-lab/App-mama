import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { c } from "../theme";

const slides = [
  { icon: "🔎", title: "Encuentra vecinos cerca", text: "Activa tu ubicación y verás quién necesita ayuda con su mascota dentro del radio que elijas." },
  { icon: "🐾", title: "Ofrécete a cuidar", text: "Toca «Ofrecerme a cuidar» en cualquier solicitud abierta. El dueño verá que estás disponible." },
  { icon: "💬", title: "Habla con el dueño", text: "En cuanto quedáis, se abre un chat para coordinar horarios, llaves o instrucciones." },
  { icon: "🏅", title: "Gana huellas", text: "Al terminar, el dueño confirma el cuidado y tus huellas suben. Úsalas para pedir que cuiden de tu mascota." },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const s = slides[step];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] p-8 text-center" style={{ background: c.card }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="ml-auto block mb-2"><X size={18} color={c.sub} /></button>
        <div className="text-6xl mb-4">{s.icon}</div>
        <h3 style={{ color: c.ink, fontWeight: 700 }} className="text-xl mb-2">{s.title}</h3>
        <p className="text-[13px] mb-6" style={{ color: c.sub }}>{s.text}</p>
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {slides.map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: i === step ? 18 : 6, height: 6, background: i === step ? c.accent : c.line, transition: "all .2s" }} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
              <ChevronLeft size={18} color={c.ink} />
            </button>
          )}
          {step < slides.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="flex-1 py-3 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-1" style={{ background: c.accent, color: "#fff" }}>
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-semibold text-[14px]" style={{ background: c.ink, color: "#fff" }}>Entendido</button>
          )}
        </div>
      </div>
    </div>
  );
}
