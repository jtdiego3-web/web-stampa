"use client";

import { useState, type ReactNode } from "react";
import { AttendancePanel } from "./attendance-panel";
import { ProfilePanel } from "./profile-panel";
import { ScratchPanel } from "./scratch-panel";
import { Logo } from "@/components/logo";
import { formatearFechaLarga, iniciales, primerNombre } from "@/lib/socios/formato";
import type { SocioRegistro } from "@/lib/socios/mock-db";
import { obtenerPlan } from "@/lib/socios/planes";
import { numeroSemana } from "@/lib/socios/semanas";
import { whatsappLink } from "@/lib/site";

type Vista = "perfil" | "asistencia" | "juego";

type DashboardViewProps = {
  socio: SocioRegistro;
  onSocioChange: (socio: SocioRegistro) => void;
  onLogout: () => void;
};

const PESTANAS: { id: Vista; etiqueta: string; icono: ReactNode }[] = [
  {
    id: "perfil",
    etiqueta: "Perfil",
    icono: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 20c.9-3.5 3.7-5.4 7-5.4s6.1 1.9 7 5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "asistencia",
    etiqueta: "Asistencia",
    icono: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "juego",
    etiqueta: "Rasca y Gana",
    icono: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="3.5" y="8" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 8v12M3.5 12h17M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8Zm0 0c1.5-3.5 5.5-3.5 5.5-1S14 8 12 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/**
 * Dashboard del socio a PANTALLA COMPLETA.
 * Escritorio (≥1024px): 3 paneles a todo el alto del viewport
 *   Perfil y plan │ Control de asistencias │ Rasca y Gana (protagonista)
 * Móvil/tablet: un panel por pantalla con navegación inferior tipo app.
 */
export function DashboardView({ socio, onSocioChange, onLogout }: DashboardViewProps) {
  const [vista, setVista] = useState<Vista>("asistencia");
  const [version, setVersion] = useState(0);
  const plan = obtenerPlan(socio.tipoPlan);
  const juegoPendiente = !socio.premioSemana && socio.asistenciasSemana >= plan.umbralJuego;

  function reiniciarPaneles(actualizado: SocioRegistro) {
    setVersion((valor) => valor + 1);
    onSocioChange(actualizado);
  }

  const visibilidad = (id: Vista) => (vista === id ? "flex" : "hidden lg:flex");

  return (
    <div
      data-socios-dashboard
      className="dashboard-enter fixed inset-0 z-[60] flex flex-col overflow-hidden bg-ink text-white"
    >
      {/* Barra superior */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-ink px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Logo href="/" compact />
          <span className="hidden h-7 w-px bg-white/10 md:block" />
          <div className="hidden min-w-0 md:block">
            <p className="label-xs text-acid">Portal de socios</p>
            <p className="mt-1.5 truncate text-[12px] text-fog">
              {formatearFechaLarga()} · Semana {numeroSemana(socio.semana)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Soporte por WhatsApp"
            title="Soporte por WhatsApp"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-mist transition-colors hover:border-acid hover:text-acid"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.15c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.13.17 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29Z" />
            </svg>
          </a>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
              {iniciales(socio.nombre)}
            </span>
            <span className="text-[12px] font-semibold">
              <span className="sm:hidden">{primerNombre(socio.nombre)}</span>
              <span className="hidden sm:inline">{socio.nombre}</span>
            </span>
            <span className="hidden font-mono text-[10px] text-fog md:inline">#{socio.codigo}</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/12 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-mist transition-colors hover:border-acid hover:text-acid"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6M10.5 11.5L14 8l-3.5-3.5M14 8H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Paneles a pantalla completa */}
      <main
        id="contenido"
        className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[18rem_minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)_minmax(0,1.35fr)] 2xl:grid-cols-[23rem_minmax(0,1fr)_minmax(0,1.45fr)]"
      >
        <ProfilePanel
          className={`${visibilidad("perfil")} panel-enter`}
          socio={socio}
          plan={plan}
          onReiniciar={reiniciarPaneles}
          onSesionInvalida={onLogout}
        />
        <AttendancePanel
          key={`asistencia-${version}`}
          className={`${visibilidad("asistencia")} panel-enter panel-enter--2`}
          socio={socio}
          plan={plan}
          onSocioChange={onSocioChange}
          onIrAlJuego={() => setVista("juego")}
        />
        <ScratchPanel
          key={`juego-${version}`}
          className={`${visibilidad("juego")} panel-enter panel-enter--3`}
          socio={socio}
          plan={plan}
          onSocioChange={onSocioChange}
          onIrAAsistencia={() => setVista("asistencia")}
        />
      </main>

      {/* Navegación inferior (móvil / tablet) */}
      <nav
        aria-label="Secciones del panel"
        className="grid shrink-0 grid-cols-3 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {PESTANAS.map((pestana) => {
          const activa = vista === pestana.id;
          return (
            <button
              key={pestana.id}
              type="button"
              onClick={() => setVista(pestana.id)}
              aria-current={activa ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                activa ? "text-acid" : "text-fog hover:text-white"
              }`}
            >
              <span
                className={`absolute inset-x-8 top-0 h-0.5 rounded-full ${activa ? "bg-acid" : "bg-transparent"}`}
              />
              <span className="relative">
                {pestana.icono}
                {pestana.id === "juego" && juegoPendiente && (
                  <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-acid ring-2 ring-ink" />
                )}
              </span>
              {pestana.etiqueta}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
