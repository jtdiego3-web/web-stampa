"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatearFechaHora } from "@/lib/socios/formato";
import type { EmailSimulado } from "@/lib/socios/mock-db";
import { SITE } from "@/lib/site";

type EmailModalProps = {
  email: EmailSimulado;
  onClose: () => void;
};

/** Vista previa del email automático enviado al socio (simulado). */
export function EmailModal({ email, onClose }: EmailModalProps) {
  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const alPulsarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", alPulsarTecla);
    botonCerrarRef.current?.focus();
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, []);

  return createPortal(
    <div
      className="modal-backdrop-in fixed inset-0 z-[95] flex items-end justify-center bg-ink/80 p-3 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-asunto"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-pop w-full max-w-lg overflow-hidden rounded-[26px] border border-white/12 bg-graphite shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-acid" />
            <p className="label-xs text-acid">Email automático · {email.estado}</p>
          </div>
          <button
            ref={botonCerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-acid hover:text-acid"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        <dl className="space-y-1.5 border-b border-white/10 px-5 py-4 text-[12px]">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-fog">De</dt>
            <dd className="min-w-0 break-all text-mist">
              {SITE.name} &lt;{SITE.email}&gt;
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-fog">Para</dt>
            <dd className="min-w-0 break-all font-semibold text-white">{email.para}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-fog">Fecha</dt>
            <dd className="text-mist">{formatearFechaHora(email.fecha)}</dd>
          </div>
        </dl>

        <div className="max-h-[55svh] overflow-y-auto px-5 py-4">
          <h3 id="email-asunto" className="text-[15px] font-bold leading-snug">
            {email.asunto}
          </h3>
          <p className="mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-mist">{email.cuerpo}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
