"use client";

import { useState } from "react";
import { apiRestablecerDemo, apiSimularNuevaSemana } from "@/lib/socios/mock-api";
import { formatearFecha, iniciales } from "@/lib/socios/formato";
import type { SocioRegistro } from "@/lib/socios/mock-db";
import { DIAS_APERTURA_SEMANA, type PlanSocio } from "@/lib/socios/planes";
import { SITE, whatsappLink } from "@/lib/site";

type ProfilePanelProps = {
  socio: SocioRegistro;
  plan: PlanSocio;
  className?: string;
  onReiniciar: (socio: SocioRegistro) => void;
  onSesionInvalida: () => void;
};

const fechaRenovacion = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long" });

/** Panel izquierdo: perfil del socio, plan activo y herramientas de demo. */
export function ProfilePanel({
  socio,
  plan,
  className = "",
  onReiniciar,
  onSesionInvalida,
}: ProfilePanelProps) {
  const [accion, setAccion] = useState<"semana" | "reset" | null>(null);
  const [aviso, setAviso] = useState("");

  const restantes = Math.max(0, plan.sesionesMes - socio.asistenciasMes);
  const uso = Math.min(100, Math.round((socio.asistenciasMes / plan.sesionesMes) * 100));
  const [anio, mes] = socio.mes.split("-").map(Number);
  const renovacion = fechaRenovacion.format(new Date(anio, mes, 1));

  async function simularSemana() {
    if (accion) return;
    setAccion("semana");
    setAviso("");
    const respuesta = await apiSimularNuevaSemana(socio.codigo);
    setAccion(null);
    if (!respuesta.ok) {
      setAviso(respuesta.error);
      return;
    }
    onReiniciar(respuesta.data);
    setAviso("Nueva semana simulada: contador a 0, racha actualizada y tarjeta nueva.");
  }

  async function restablecer() {
    if (accion) return;
    setAccion("reset");
    setAviso("");
    const respuesta = await apiRestablecerDemo(socio.codigo);
    setAccion(null);
    if (!respuesta.ok) {
      onSesionInvalida();
      return;
    }
    onReiniciar(respuesta.data);
    setAviso("Datos de demostración restablecidos.");
  }

  const datos = [
    { etiqueta: "Nombre", valor: socio.nombre, clase: "" },
    { etiqueta: "Código", valor: socio.codigo, clase: "font-mono tracking-[0.14em]" },
    { etiqueta: "Plan", valor: plan.nombre, clase: "" },
    { etiqueta: "Email", valor: socio.email, clase: "break-all" },
    { etiqueta: "Entrenador", valor: socio.entrenador, clase: "" },
  ];

  return (
    <aside
      aria-labelledby="perfil-titulo"
      className={`${className} min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border-white/10 bg-coal p-5 sm:p-7 lg:border-r xl:p-8`}
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col lg:max-w-none">
        <div className="flex items-center justify-between gap-3">
          <p className="label-xs text-fog">Perfil del socio</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acid/35 bg-acid/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-acid">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            Activo
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-acid text-2xl font-black text-ink ring-4 ring-acid/15">
            {iniciales(socio.nombre)}
          </span>
          <div className="min-w-0">
            <h2 id="perfil-titulo" className="truncate text-2xl font-black leading-tight tracking-[-0.02em]">
              {socio.nombre}
            </h2>
            <p className="mt-1 text-[12px] text-fog">Socio desde {formatearFecha(socio.socioDesde)}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-white/8 border-y border-white/8 text-[13px]">
          {datos.map((dato) => (
            <div key={dato.etiqueta} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-fog">{dato.etiqueta}</dt>
              <dd className={`min-w-0 text-right font-semibold text-white ${dato.clase}`}>{dato.valor}</dd>
            </div>
          ))}
        </dl>

        {/* Plan activo */}
        <section
          aria-labelledby="plan-titulo"
          className="mt-6 rounded-[22px] border border-acid/30 bg-gradient-to-br from-acid/[0.13] via-acid/[0.04] to-transparent p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label-xs text-acid">Tu plan</p>
              <h3 id="plan-titulo" className="mt-2 text-[26px] font-black leading-none tracking-[-0.03em]">
                {plan.nombre}
              </h3>
              <p className="mt-1.5 text-[12px] text-mist">
                {plan.periodo} · {socio.modalidad}
              </p>
            </div>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-acid text-center text-ink">
              <span>
                <span className="block text-xl font-black leading-none">{plan.sesionesMes}</span>
                <span className="block text-[7.5px] font-bold uppercase tracking-[0.08em]">ses/mes</span>
              </span>
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-fog">
              <span>Sesiones usadas este mes</span>
              <span className="text-white">
                {socio.asistenciasMes}/{plan.sesionesMes}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-acid transition-[width] duration-700"
                style={{ width: `${uso}%` }}
              />
            </div>
            <p className="mt-2 text-[11.5px] text-fog">
              Te quedan <strong className="text-white">{restantes}</strong>{" "}
              {restantes === 1 ? "sesión" : "sesiones"} · renueva el {renovacion}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-ink/60 px-2 py-2.5">
              <p className="text-lg font-black leading-none">{plan.metaSemanal}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-fog">
                Meta días/semana
              </p>
            </div>
            <div className="rounded-xl bg-ink/60 px-2 py-2.5">
              <p className="text-lg font-black leading-none">{DIAS_APERTURA_SEMANA}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-fog">
                Días abre el club
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <p className="label-xs text-fog">Racha</p>
            <p className="mt-2.5 text-2xl font-black leading-none">
              {socio.rachaSemanas}
              <span className="ml-1 text-[11px] font-semibold text-fog">sem.</span>
            </p>
            <p className="mt-1 text-[10.5px] text-fog">constantes seguidas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <p className="label-xs text-fog">Premios</p>
            <p className="mt-2.5 text-2xl font-black leading-none">{socio.historialPremios.length}</p>
            <p className="mt-1 text-[10.5px] text-fog">vinculados a tu cuenta</p>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-acid hover:text-acid"
          >
            <span>Soporte por WhatsApp</span>
            <span className="font-mono text-[10px] tracking-normal text-fog">{SITE.phoneDisplay}</span>
          </a>

          <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-4">
            <p className="label-xs text-acid">Modo demo</p>
            <p className="mt-2 text-[11px] leading-relaxed text-fog">
              Base de datos simulada en tu navegador (localStorage).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void simularSemana()}
                disabled={accion !== null}
                className="rounded-full border border-acid/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-acid transition-colors hover:bg-acid hover:text-ink disabled:opacity-50"
              >
                {accion === "semana" ? "Simulando…" : "Simular nueva semana"}
              </button>
              <button
                type="button"
                onClick={() => void restablecer()}
                disabled={accion !== null}
                className="rounded-full border border-white/15 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-mist transition-colors hover:border-white hover:text-white disabled:opacity-50"
              >
                {accion === "reset" ? "Restableciendo…" : "Restablecer demo"}
              </button>
            </div>
            {aviso && (
              <p role="status" className="toast-in mt-3 text-[11px] font-medium text-acid">
                {aviso}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
