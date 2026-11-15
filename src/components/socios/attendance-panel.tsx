"use client";

import { useState } from "react";
import { apiRegistrarAsistencia } from "@/lib/socios/mock-api";
import { etiquetaUltimaAsistencia } from "@/lib/socios/formato";
import type { SocioRegistro } from "@/lib/socios/mock-db";
import { DIAS_APERTURA_SEMANA, type PlanSocio } from "@/lib/socios/planes";
import { diasDeSemana, numeroSemana } from "@/lib/socios/semanas";

const ETIQUETAS_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CENTRO = 100;
const RADIO = 82;
const GROSOR = 14;
const SEGMENTO = 360 / DIAS_APERTURA_SEMANA;
const HUECO = 4;

type Aviso = { tipo: "exito" | "error"; texto: string; desbloqueo?: boolean };

type AttendancePanelProps = {
  socio: SocioRegistro;
  plan: PlanSocio;
  className?: string;
  onSocioChange: (socio: SocioRegistro) => void;
  onIrAlJuego: () => void;
};

function puntoPolar(grados: number, radio = RADIO) {
  const radianes = ((grados - 90) * Math.PI) / 180;
  return { x: CENTRO + radio * Math.cos(radianes), y: CENTRO + radio * Math.sin(radianes) };
}

function trazoArco(inicio: number, fin: number): string {
  const a = puntoPolar(inicio);
  const b = puntoPolar(fin);
  const grande = fin - inicio > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${RADIO} ${RADIO} 0 ${grande} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/** Anillo de 6 segmentos (uno por día de apertura) con meta y punto de desbloqueo. */
function AnilloSemanal({
  asistencias,
  meta,
  umbral,
}: {
  asistencias: number;
  meta: number;
  umbral: number;
}) {
  const marcador = puntoPolar(umbral * SEGMENTO, RADIO + 17);
  const desbloqueado = asistencias >= umbral;

  return (
    <div className="relative mx-auto aspect-square w-[clamp(11rem,30vh,16rem)] max-w-full">
      <svg
        viewBox="-12 -12 224 224"
        className="h-full w-full"
        role="img"
        aria-label={`${asistencias} de ${DIAS_APERTURA_SEMANA} días entrenados esta semana`}
      >
        {Array.from({ length: DIAS_APERTURA_SEMANA }, (_, indice) => {
          const lleno = indice < asistencias;
          const enMeta = indice < meta;
          return (
            <path
              key={indice}
              d={trazoArco(indice * SEGMENTO + HUECO, (indice + 1) * SEGMENTO - HUECO)}
              fill="none"
              strokeWidth={GROSOR}
              stroke={lleno ? "#e6ff3c" : enMeta ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}
              style={{ transition: "stroke 500ms ease" }}
            />
          );
        })}
        <circle
          cx={marcador.x}
          cy={marcador.y}
          r="10"
          fill={desbloqueado ? "#e6ff3c" : "#181d1a"}
          stroke={desbloqueado ? "#e6ff3c" : "rgba(255,255,255,0.28)"}
          strokeWidth="1.5"
        >
          <title>Desbloqueo del Rasca y Gana</title>
        </circle>
        <text
          x={marcador.x}
          y={marcador.y + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
        >
          🎁
        </text>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          key={asistencias}
          className="count-bump text-[clamp(3rem,9vh,4.75rem)] font-black leading-none tracking-[-0.04em]"
        >
          {asistencias}
        </span>
        <span className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-fog">
          de {DIAS_APERTURA_SEMANA} días
        </span>
      </div>
    </div>
  );
}

/** Panel central: control de asistencias de la semana. */
export function AttendancePanel({
  socio,
  plan,
  className = "",
  onSocioChange,
  onIrAlJuego,
}: AttendancePanelProps) {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const asistencias = socio.asistenciasSemana;
  const restantes = Math.max(0, plan.sesionesMes - socio.asistenciasMes);
  const semanaCompleta = asistencias >= DIAS_APERTURA_SEMANA;
  const sinSesiones = restantes === 0;
  const deshabilitado = cargando || semanaCompleta || sinSesiones;
  const faltanJuego = Math.max(0, plan.umbralJuego - asistencias);
  const desbloqueado = faltanJuego === 0;
  const dias = diasDeSemana(socio.semana);
  const hoy = new Date().toDateString();

  async function registrar() {
    if (deshabilitado) return;
    setCargando(true);
    setAviso(null);
    const respuesta = await apiRegistrarAsistencia(socio.codigo);
    setCargando(false);

    if (!respuesta.ok) {
      setAviso({ tipo: "error", texto: respuesta.error });
      return;
    }
    onSocioChange(respuesta.data.socio);
    setAviso({
      tipo: "exito",
      texto: respuesta.data.mensaje,
      desbloqueo: respuesta.data.desbloqueoJuego,
    });
  }

  const etiquetaBoton = cargando
    ? "Registrando…"
    : semanaCompleta
      ? `Semana completa · ${DIAS_APERTURA_SEMANA}/${DIAS_APERTURA_SEMANA}`
      : sinSesiones
        ? "Sin sesiones disponibles este mes"
        : "Registrar Asistencia de Hoy";

  return (
    <section
      aria-labelledby="asistencias-titulo"
      className={`${className} min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border-white/10 bg-ink p-5 sm:p-7 lg:border-r xl:p-8`}
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 lg:max-w-none">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="label-xs text-fog">Control de asistencias</p>
            <h2 id="asistencias-titulo" className="mt-2 text-2xl font-black tracking-[-0.02em]">
              Tu semana de entreno
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-mist">
            Semana {numeroSemana(socio.semana)}
          </span>
        </header>

        <div className="flex flex-col items-center gap-3">
          <AnilloSemanal asistencias={asistencias} meta={plan.metaSemanal} umbral={plan.umbralJuego} />
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10.5px] text-fog">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-acid" /> Asistido
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/25" /> Meta {plan.nombre} ({plan.metaSemanal}{" "}
              días)
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">🎁</span> Desbloqueo ({plan.umbralJuego})
            </li>
          </ul>
        </div>

        <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Días de la semana">
          {dias.map((fecha, indice) => {
            const cerrado = indice === 6;
            const hecho = !cerrado && indice < asistencias;
            const esHoy = fecha.toDateString() === hoy;
            return (
              <li
                key={ETIQUETAS_DIAS[indice]}
                className={`flex flex-col items-center rounded-xl border py-2 transition-colors duration-300 ${
                  hecho
                    ? "border-acid/50 bg-acid/10"
                    : esHoy
                      ? "border-white/30 bg-white/[0.04]"
                      : "border-white/8 bg-white/[0.02]"
                } ${cerrado ? "opacity-45" : ""}`}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-fog">
                  {ETIQUETAS_DIAS[indice]}
                </span>
                <span className="mt-0.5 text-[13px] font-bold">{fecha.getDate()}</span>
                {cerrado ? (
                  <span className="mt-1.5 text-[8px] font-bold uppercase text-fog">Cerrado</span>
                ) : (
                  <span
                    className={`mt-1.5 grid h-5 w-5 place-items-center rounded-full ${
                      hecho ? "bg-acid text-ink" : "bg-white/[0.06] text-transparent"
                    }`}
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                      <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <span className="sr-only">{cerrado ? "cerrado" : hecho ? "asistido" : "pendiente"}</span>
              </li>
            );
          })}
        </ol>

        <div>
          <button
            type="button"
            onClick={() => void registrar()}
            disabled={deshabilitado}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-acid px-6 text-[12px] font-black uppercase tracking-[0.14em] text-ink transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-fog"
          >
            {cargando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                {semanaCompleta || sinSesiones ? (
                  <path d="M4 8.5L6.5 11L12 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                )}
              </svg>
            )}
            {etiquetaBoton}
          </button>

          <div aria-live="polite">
            {aviso && (
              <div
                className={`toast-in mt-3 rounded-2xl border px-4 py-3 text-[12.5px] ${
                  aviso.tipo === "exito"
                    ? "border-acid/40 bg-acid/10 text-acid"
                    : "border-red-400/30 bg-red-400/10 text-red-200"
                }`}
              >
                <p className="font-semibold">
                  {aviso.tipo === "exito" ? "✅ " : "⚠️ "}
                  {aviso.texto}
                </p>
                {aviso.desbloqueo && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">🎉 ¡Desbloqueaste tu Rasca y Gana de esta semana!</p>
                    <button
                      type="button"
                      onClick={onIrAlJuego}
                      className="rounded-full bg-acid px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-ink lg:hidden"
                    >
                      Jugar ahora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estado del desbloqueo */}
        <div
          className={`rounded-2xl border p-4 transition-colors ${
            desbloqueado ? "border-acid/40 bg-acid/[0.07]" : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${
                desbloqueado ? "bg-acid" : "bg-white/[0.06]"
              }`}
              aria-hidden="true"
            >
              {desbloqueado ? "🎁" : "🔒"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">
                {socio.premioSemana
                  ? "Rasca y Gana jugado esta semana"
                  : desbloqueado
                    ? "Rasca y Gana desbloqueado"
                    : "Rasca y Gana bloqueado"}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-fog">
                {socio.premioSemana
                  ? "Tu premio ya está vinculado a tu cuenta. Vuelve a jugar la próxima semana."
                  : desbloqueado
                    ? "Tu constancia ya suma: cada asistencia extra sube tu nivel de suerte."
                    : `Te ${faltanJuego === 1 ? "falta" : "faltan"} ${faltanJuego} ${
                        faltanJuego === 1 ? "asistencia" : "asistencias"
                      } (${plan.nombre}: ${plan.umbralJuego} por semana).`}
              </p>
            </div>
            {desbloqueado && !socio.premioSemana && (
              <button
                type="button"
                onClick={onIrAlJuego}
                className="shrink-0 rounded-full border border-acid/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-acid lg:hidden"
              >
                Jugar
              </button>
            )}
          </div>
          {!desbloqueado && (
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {Array.from({ length: plan.umbralJuego }, (_, indice) => (
                <span
                  key={indice}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    indice < asistencias ? "bg-acid" : "bg-white/12"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-fog">Este mes</dt>
            <dd className="mt-1.5 text-lg font-black leading-none">
              {socio.asistenciasMes}
              <span className="text-[11px] font-semibold text-fog">/{plan.sesionesMes}</span>
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-fog">Restantes</dt>
            <dd className="mt-1.5 text-lg font-black leading-none">{restantes}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-fog">Último</dt>
            <dd className="mt-1.5 text-[11.5px] font-bold leading-tight">
              {etiquetaUltimaAsistencia(socio.ultimaAsistencia)}
            </dd>
          </div>
        </dl>

        <p className="mt-auto text-[10.5px] leading-relaxed text-fog/80">
          Modo demo: cada clic suma una asistencia a la semana actual (máximo {DIAS_APERTURA_SEMANA},
          de lunes a sábado) y descuenta una sesión de tu plan.
        </p>
      </div>
    </section>
  );
}
