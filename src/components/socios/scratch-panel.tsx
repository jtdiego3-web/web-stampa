"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { EmailModal } from "./email-modal";
import { apiEnviarEmailPremio, apiRevelarPremio } from "@/lib/socios/mock-api";
import { formatearDiaCorto, formatearFecha } from "@/lib/socios/formato";
import type { PremioGanado, SocioRegistro } from "@/lib/socios/mock-db";
import type { PlanSocio } from "@/lib/socios/planes";
import {
  MAX_NIVEL_SUERTE,
  NIVELES,
  PREMIOS_POR_ID,
  formatearPorcentaje,
  nivelDeSuerte,
  probabilidadPremioMayor,
  resumenCanje,
  textoAplicacion,
} from "@/lib/socios/premios";
import { desplazarSemana, lunesDeSemana, numeroSemana } from "@/lib/socios/semanas";

const UMBRAL_REVELADO = 0.4; // 40 % de superficie rascada
const DURACION_MINIMA_REVELADO_MS = 1100;

type Fase = "bloqueado" | "listo" | "rascando" | "revelando" | "revelado";
type EstadoEmail = "enviando" | "enviado" | "error";
type Variante = "activo" | "bloqueado";
type Punto = { x: number; y: number };
type Tamano = { ancho: number; alto: number };

type ScratchPanelProps = {
  socio: SocioRegistro;
  plan: PlanSocio;
  className?: string;
  onSocioChange: (socio: SocioRegistro) => void;
  onIrAAsistencia: () => void;
};

const DESTELLOS = Array.from({ length: 12 }, (_, indice) => {
  const angulo = (indice / 12) * Math.PI * 2;
  const distancia = 30 + (indice % 3) * 7;
  return {
    dx: `${(Math.cos(angulo) * distancia).toFixed(1)}cqh`,
    dy: `${(Math.sin(angulo) * distancia).toFixed(1)}cqh`,
    retraso: 150 + (indice % 4) * 45,
  };
});

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retraso(ms: number): CSSProperties {
  return { "--delay": `${ms}ms` } as CSSProperties;
}

/** Pinta la superficie rascable. Devuelve el tamaño pintado o null si está oculta. */
function pintarCubierta(
  canvas: HTMLCanvasElement | null,
  variante: Variante,
  serie: string,
): Tamano | null {
  const contenedor = canvas?.parentElement;
  if (!canvas || !contenedor) return null;
  const ancho = Math.round(contenedor.clientWidth);
  const alto = Math.round(contenedor.clientHeight);
  if (!ancho || !alto) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(ancho * dpr);
  canvas.height = Math.round(alto * dpr);
  canvas.style.width = `${ancho}px`;
  canvas.style.height = `${alto}px`;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, ancho, alto);

  const activo = variante === "activo";
  const fuente = "'Helvetica Neue', Arial, sans-serif";

  const fondo = ctx.createLinearGradient(0, 0, ancho, alto);
  if (activo) {
    fondo.addColorStop(0, "#f6ffb8");
    fondo.addColorStop(0.45, "#e6ff3c");
    fondo.addColorStop(1, "#b3cf00");
  } else {
    fondo.addColorStop(0, "#2b322d");
    fondo.addColorStop(1, "#151916");
  }
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ancho, alto);

  ctx.strokeStyle = activo ? "rgba(7,9,8,0.09)" : "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let x = -alto; x < ancho; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + alto, alto);
    ctx.stroke();
  }

  // Patrón de "?" (sin pistas del premio).
  const paso = Math.max(46, ancho * 0.11);
  ctx.fillStyle = activo ? "rgba(7,9,8,0.07)" : "rgba(255,255,255,0.035)";
  ctx.font = `900 ${Math.round(Math.max(18, ancho * 0.05))}px ${fuente}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let y = paso / 2, fila = 0; y < alto; y += paso, fila += 1) {
    for (let x = fila % 2 ? paso : paso / 2; x < ancho; x += paso) ctx.fillText("?", x, y);
  }

  if (activo) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    for (let i = 0; i < 34; i += 1) {
      ctx.beginPath();
      ctx.arc(
        (((i * 97) % 100) / 100) * ancho,
        (((i * 61) % 100) / 100) * alto,
        (i % 3) * 0.7 + 0.8,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  const margen = Math.max(16, ancho * 0.035);
  ctx.textBaseline = "top";
  ctx.font = `800 ${Math.round(Math.max(9, ancho * 0.017))}px ${fuente}`;
  ctx.fillStyle = activo ? "rgba(7,9,8,0.72)" : "rgba(255,255,255,0.3)";
  ctx.textAlign = "left";
  ctx.fillText("STAMPA REWARDS", margen, margen);
  ctx.textAlign = "right";
  ctx.fillText(serie, ancho - margen, margen);

  if (activo) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#070908";
    ctx.font = `900 ${Math.round(Math.max(26, ancho * 0.085))}px ${fuente}`;
    ctx.fillText("RASCA AQUÍ", ancho / 2, alto / 2 - ancho * 0.015);
    ctx.font = `700 ${Math.round(Math.max(10, ancho * 0.021))}px ${fuente}`;
    ctx.fillStyle = "rgba(7,9,8,0.62)";
    ctx.fillText("TU PREMIO SORPRESA ESTÁ DEBAJO", ancho / 2, alto / 2 + Math.max(26, ancho * 0.06));
  }

  ctx.strokeStyle = activo ? "rgba(7,9,8,0.38)" : "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  const esquina = Math.max(14, ancho * 0.03);
  const borde = margen * 0.55;
  const esquinas: [number, number, number, number][] = [
    [borde, borde, 1, 1],
    [ancho - borde, borde, -1, 1],
    [borde, alto - borde, 1, -1],
    [ancho - borde, alto - borde, -1, -1],
  ];
  for (const [x, y, dx, dy] of esquinas) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * esquina);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * esquina, y);
    ctx.stroke();
  }

  return { ancho, alto };
}

/** Proporción (0-1) de la superficie que ya se ha rascado. */
function calcularRascado(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !canvas.width || !canvas.height) return 0;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparentes = 0;
  let muestras = 0;
  for (let i = 3; i < data.length; i += 4 * 16) {
    muestras += 1;
    if (data[i] < 64) transparentes += 1;
  }
  return muestras ? transparentes / muestras : 0;
}

/* -------------------------------------------------------------------------- */

/** Capa bajo la superficie: NO contiene el premio (se sortea al revelar). */
function CapaMisterio({ fase, serie }: { fase: Fase; serie: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_42%,#1f2619,#080a07_75%)]">
      <div className="mystery-dots absolute inset-0 opacity-70" />
      <div className="mystery-shimmer absolute inset-0" />
      <div className="absolute inset-x-0 top-0 flex justify-between p-[5cqh] text-[length:clamp(8px,2.6cqh,11px)] font-bold uppercase tracking-[0.2em] text-white/25">
        <span>Stampa Rewards</span>
        <span className="font-mono">{serie}</span>
      </div>
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        {fase === "revelando" ? (
          <>
            <span className="pulse-ring-socios grid h-[26cqh] w-[26cqh] place-items-center rounded-full border border-acid/60 bg-acid/10 text-[length:13cqh] font-black text-acid">
              ?
            </span>
            <p className="mt-[5cqh] text-[length:clamp(10px,3.4cqh,14px)] font-bold uppercase tracking-[0.24em] text-acid">
              Revelando tu premio…
            </p>
          </>
        ) : (
          <>
            <span className="grid h-[22cqh] w-[22cqh] place-items-center rounded-full border border-white/10 bg-white/[0.03] text-[length:11cqh] font-black text-white/30">
              ?
            </span>
            <p className="mt-[4cqh] text-[length:clamp(9px,3cqh,13px)] font-bold uppercase tracking-[0.24em] text-white/35">
              Sigue rascando…
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PremioRevelado({
  premio,
  serie,
  animar,
}: {
  premio: PremioGanado;
  serie: string;
  animar: boolean;
}) {
  const catalogo = PREMIOS_POR_ID[premio.id];
  const nivel = NIVELES[premio.nivel];
  const destacado = premio.nivel === "mayor" || premio.nivel === "legendario";
  const animado = (clase: string) => (animar ? clase : "");

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#273016,#080a07_74%)]">
      <div
        className={`absolute left-1/2 top-[40%] h-[78cqh] w-[78cqh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
          destacado ? "bg-acid/30" : "bg-acid/15"
        } ${animado("reveal-glow")}`}
      />
      {animar && (
        <>
          <span className="reveal-ring absolute left-1/2 top-[40%] h-[34cqh] w-[34cqh] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-acid/70" />
          {DESTELLOS.map((destello, indice) => (
            <span
              key={indice}
              className="sparkle absolute left-1/2 top-[40%] h-[1.6cqh] min-h-1 w-[1.6cqh] min-w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid"
              style={
                {
                  "--dx": destello.dx,
                  "--dy": destello.dy,
                  "--delay": `${destello.retraso}ms`,
                } as CSSProperties
              }
            />
          ))}
        </>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-[5cqh] text-[length:clamp(8px,2.6cqh,11px)] font-bold uppercase tracking-[0.2em] text-white/35">
        <span>Stampa Rewards</span>
        <span className="rounded-full bg-acid px-2 py-0.5 tracking-[0.12em] text-ink">Vinculado ✓</span>
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-[6cqw] text-center">
        <span
          className={`grid h-[30cqh] w-[30cqh] place-items-center rounded-full border bg-ink/60 text-[length:16cqh] leading-none ${
            destacado ? "border-acid shadow-[0_0_60px_-10px_rgba(230,255,60,0.7)]" : "border-acid/40"
          } ${animado("reveal-emoji")}`}
          aria-hidden="true"
        >
          {premio.emoji}
        </span>
        <p
          className={`mt-[4cqh] text-[length:clamp(9px,3.4cqh,13px)] font-black uppercase tracking-[0.26em] text-acid ${animado("reveal-item")}`}
          style={animar ? retraso(260) : undefined}
        >
          {premio.nivel === "legendario" ? `✦ ${nivel.titular} ✦` : nivel.titular}
        </p>
        <h3
          className={`mt-[1.5cqh] text-[length:clamp(18px,9cqh,44px)] font-black leading-[1.05] tracking-[-0.03em] ${animado("reveal-item")}`}
          style={animar ? retraso(360) : undefined}
        >
          {premio.nombre}
        </h3>
        <p
          className={`mt-[1.5cqh] text-[length:clamp(10px,3.6cqh,14px)] text-mist ${animado("reveal-item")}`}
          style={animar ? retraso(460) : undefined}
        >
          {resumenCanje(catalogo)}
        </p>
        <span
          className={`mt-[3.5cqh] rounded-full border border-dashed border-acid/50 bg-acid/10 px-[4cqh] py-[1.6cqh] font-mono text-[length:clamp(11px,4.2cqh,17px)] font-bold tracking-[0.12em] text-white ${animado("reveal-item")}`}
          style={animar ? retraso(560) : undefined}
        >
          {premio.codigoCanje}
        </span>
      </div>
    </div>
  );
}

function NivelSuerte({ asistencias }: { asistencias: number }) {
  const nivel = nivelDeSuerte(asistencias);
  return (
    <div className="relative shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label-xs text-fog">Nivel de suerte</p>
        <p className="font-mono text-[11px] font-bold text-acid">
          {nivel}/{MAX_NIVEL_SUERTE}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5" aria-hidden="true">
        {Array.from({ length: MAX_NIVEL_SUERTE }, (_, indice) => (
          <span
            key={indice}
            className={`h-2 rounded-full transition-colors duration-500 ${indice < nivel ? "bg-acid" : "bg-white/10"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-[12px] text-mist">
        Probabilidad de premio mayor:{" "}
        <strong key={nivel} className="count-bump inline-block text-acid">
          {formatearPorcentaje(probabilidadPremioMayor(nivel))}
        </strong>
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-fog">
        Cada asistencia de la semana sube tu nivel. Los premios se mantienen ocultos hasta que
        rasques.
      </p>
    </div>
  );
}

function ResultadoPremio({
  premio,
  socio,
  plan,
  estadoEmail,
  animar,
  proximoJuego,
  onVerEmail,
  onReintentar,
}: {
  premio: PremioGanado;
  socio: SocioRegistro;
  plan: PlanSocio;
  estadoEmail: EstadoEmail;
  animar: boolean;
  proximoJuego: string;
  onVerEmail: () => void;
  onReintentar: () => void;
}) {
  const pasos: { titulo: string; detalle: string; estado: "ok" | "cargando" | "error" }[] = [
    { titulo: "Premio revelado", detalle: premio.nombre, estado: "ok" },
    { titulo: "Vinculado a tu cuenta", detalle: `Socio #${socio.codigo}`, estado: "ok" },
    {
      titulo:
        estadoEmail === "enviado"
          ? "Enviado a tu correo"
          : estadoEmail === "error"
            ? "Envío pendiente"
            : "Enviando a tu correo…",
      detalle: socio.email,
      estado: estadoEmail === "enviado" ? "ok" : estadoEmail === "error" ? "error" : "cargando",
    },
  ];

  return (
    <div className="space-y-3">
      <ol className="grid gap-2 sm:grid-cols-3">
        {pasos.map((paso, indice) => (
          <li
            key={indice}
            className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${
              paso.estado === "ok"
                ? "border-acid/30 bg-acid/[0.06]"
                : paso.estado === "error"
                  ? "border-red-400/30 bg-red-400/10"
                  : "border-white/10 bg-white/[0.03]"
            } ${animar ? "reveal-item" : ""}`}
            style={animar ? retraso(700 + indice * 260) : undefined}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                paso.estado === "ok"
                  ? "bg-acid text-ink"
                  : paso.estado === "error"
                    ? "bg-red-400/20 text-red-200"
                    : "bg-white/10 text-acid"
              }`}
            >
              {paso.estado === "ok" ? (
                <svg
                  viewBox="0 0 12 12"
                  className={`h-3.5 w-3.5 ${animar ? "step-check" : ""}`}
                  style={animar ? retraso(820 + indice * 260) : undefined}
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : paso.estado === "cargando" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <span className="text-sm font-black">!</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold">{paso.titulo}</p>
              <p className="truncate text-[11px] text-fog">{paso.detalle}</p>
            </div>
          </li>
        ))}
      </ol>

      {estadoEmail === "enviado" && (
        <div
          role="status"
          className={`flex flex-col gap-3 rounded-2xl bg-acid p-4 text-ink sm:flex-row sm:items-center sm:justify-between ${
            animar ? "toast-in" : ""
          }`}
        >
          <p className="text-[13px] font-semibold leading-snug">
            ¡Felicidades! Tu premio quedó <strong className="font-black">vinculado a tu cuenta</strong> y
            se envió automáticamente a <strong className="break-all font-black">{socio.email}</strong>{" "}
            con las instrucciones de canje.
          </p>
          <button
            type="button"
            onClick={onVerEmail}
            className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-acid transition-colors hover:bg-graphite"
          >
            Ver email
          </button>
        </div>
      )}

      {estadoEmail === "error" && (
        <div className="flex flex-col gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-[12px] text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <p>Tu premio está vinculado a tu cuenta, pero el email no salió. Inténtalo de nuevo.</p>
          <button
            type="button"
            onClick={onReintentar}
            className="shrink-0 rounded-full border border-acid/50 px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-acid"
          >
            Reintentar envío
          </button>
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-fog">
        {textoAplicacion(PREMIOS_POR_ID[premio.id], plan.esPlanMensual)} Próximo Rasca y Gana:{" "}
        <span className="font-semibold text-mist">{proximoJuego}</span>.
      </p>
    </div>
  );
}

function Historial({ premios }: { premios: PremioGanado[] }) {
  return (
    <div className="relative shrink-0">
      <p className="label-xs text-fog">Premios anteriores</p>
      {premios.length === 0 ? (
        <p className="mt-2 text-[11.5px] text-fog">
          Aún no tienes premios anteriores. ¡Tu colección empieza con esta tarjeta!
        </p>
      ) : (
        <ul className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {premios.map((item) => (
            <li
              key={item.codigoCanje}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-sm" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-[11.5px] font-semibold">{item.nombre}</span>
              <span className="text-[10px] text-fog">{formatearFecha(item.fecha)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Panel protagonista: tarjeta de Rasca y Gana con premios ocultos. */
export function ScratchPanel({
  socio,
  plan,
  className = "",
  onSocioChange,
  onIrAAsistencia,
}: ScratchPanelProps) {
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tamanoRef = useRef<Tamano>({ ancho: 0, alto: 0 });
  const rascandoRef = useRef(false);
  const ultimoPuntoRef = useRef<Punto | null>(null);
  const movimientosRef = useRef(0);
  const revelandoRef = useRef(false);
  const enviandoRef = useRef(false);
  const envioInicialRef = useRef(false);

  const [jugando, setJugando] = useState(false);
  const [revelando, setRevelando] = useState(false);
  const [trazoIniciado, setTrazoIniciado] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [animarRevelado, setAnimarRevelado] = useState(false);
  const [estadoEmail, setEstadoEmail] = useState<EstadoEmail>(
    socio.premioSemana?.emailEnviado ? "enviado" : "enviando",
  );
  const [error, setError] = useState("");
  const [emailAbierto, setEmailAbierto] = useState(false);

  const premio = socio.premioSemana;
  const asistencias = socio.asistenciasSemana;
  const faltan = Math.max(0, plan.umbralJuego - asistencias);
  const fase: Fase = premio
    ? "revelado"
    : revelando
      ? "revelando"
      : jugando
        ? "rascando"
        : faltan > 0
          ? "bloqueado"
          : "listo";
  const variante: Variante = fase === "bloqueado" ? "bloqueado" : "activo";
  const cubiertaVisible = fase !== "revelado";
  const serie = `Nº ${numeroSemana(socio.semana)}-${socio.codigo}`;

  const repintar = useCallback(() => {
    tamanoRef.current = pintarCubierta(canvasRef.current, variante, serie) ?? { ancho: 0, alto: 0 };
    setProgreso(0);
  }, [variante, serie]);

  useLayoutEffect(() => {
    if (cubiertaVisible) repintar();
  }, [cubiertaVisible, repintar]);

  // Repinta al cambiar el tamaño (rotación, ventana o pestaña móvil visible).
  useEffect(() => {
    if (!cubiertaVisible) return;
    const tarjeta = tarjetaRef.current;
    if (!tarjeta || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(() => {
      const ancho = Math.round(tarjeta.clientWidth);
      const alto = Math.round(tarjeta.clientHeight);
      if (!ancho || !alto) return; // panel oculto: se conserva lo rascado
      const previo = tamanoRef.current;
      if (Math.abs(previo.ancho - ancho) < 2 && Math.abs(previo.alto - alto) < 2) return;
      repintar();
    });
    observador.observe(tarjeta);
    return () => observador.disconnect();
  }, [cubiertaVisible, repintar]);

  const enviarEmail = useCallback(async () => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEstadoEmail("enviando");
    const respuesta = await apiEnviarEmailPremio(socio.codigo);
    enviandoRef.current = false;
    if (!respuesta.ok) {
      setEstadoEmail("error");
      return;
    }
    onSocioChange(respuesta.data.socio);
    setEstadoEmail("enviado");
  }, [socio.codigo, onSocioChange]);

  // Si se recargó la página antes de terminar el envío, se completa solo.
  useEffect(() => {
    if (envioInicialRef.current) return;
    envioInicialRef.current = true;
    if (premio && !premio.emailEnviado) void enviarEmail();
  }, [premio, enviarEmail]);

  async function revelar() {
    if (revelandoRef.current || socio.premioSemana) return;
    revelandoRef.current = true;
    rascandoRef.current = false;
    setError("");
    setRevelando(true);

    // El sorteo ocurre AHORA (backend simulado), no antes de rascar.
    const [respuesta] = await Promise.all([
      apiRevelarPremio(socio.codigo),
      esperar(DURACION_MINIMA_REVELADO_MS),
    ]);

    if (!respuesta.ok) {
      revelandoRef.current = false;
      setRevelando(false);
      setJugando(false);
      setTrazoIniciado(false);
      setError(respuesta.error);
      repintar();
      return;
    }

    setAnimarRevelado(true);
    setRevelando(false);
    onSocioChange(respuesta.data.socio);
    void enviarEmail();
  }

  function evaluarRascado() {
    const canvas = canvasRef.current;
    if (!canvas || revelandoRef.current) return;
    const proporcion = calcularRascado(canvas);
    setProgreso(proporcion);
    if (proporcion >= UMBRAL_REVELADO) void revelar();
  }

  function rascar(punto: Punto) {
    const ctx = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const grosor = Math.max(34, Math.min(70, tamanoRef.current.ancho * 0.09));
    const anterior = ultimoPuntoRef.current;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = grosor;
    if (anterior) {
      ctx.beginPath();
      ctx.moveTo(anterior.x, anterior.y);
      ctx.lineTo(punto.x, punto.y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(punto.x, punto.y, grosor / 2, 0, Math.PI * 2);
    ctx.fill();
    ultimoPuntoRef.current = punto;
  }

  function puntoDesdeEvento(event: ReactPointerEvent<HTMLCanvasElement>): Punto {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function alPresionar(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (fase !== "listo" && fase !== "rascando") return;
    if (fase === "listo") setJugando(true);
    event.preventDefault();
    rascandoRef.current = true;
    ultimoPuntoRef.current = null;
    setTrazoIniciado(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    rascar(puntoDesdeEvento(event));
  }

  function alMover(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!rascandoRef.current) return;
    rascar(puntoDesdeEvento(event));
    movimientosRef.current += 1;
    if (movimientosRef.current % 8 === 0) evaluarRascado();
  }

  function alSoltar(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!rascandoRef.current) return;
    rascandoRef.current = false;
    ultimoPuntoRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    evaluarRascado();
  }

  const estados: Record<Fase, { texto: string; clase: string }> = {
    bloqueado: { texto: "🔒 Bloqueado", clase: "border-white/15 text-fog" },
    listo: { texto: "● Desbloqueado", clase: "border-acid/50 bg-acid/10 text-acid" },
    rascando: { texto: "Rascando…", clase: "border-acid/50 bg-acid/10 text-acid" },
    revelando: { texto: "Revelando…", clase: "border-acid/50 bg-acid/10 text-acid" },
    revelado: { texto: "✓ Jugado esta semana", clase: "border-acid bg-acid text-ink" },
  };

  const proximoJuego = formatearDiaCorto(lunesDeSemana(desplazarSemana(socio.semana, 1)));
  const historial = socio.historialPremios
    .filter((item) => item.codigoCanje !== premio?.codigoCanje)
    .slice(0, 6);
  const emailPremio = premio
    ? (socio.emails.find((email) => email.codigoCanje === premio.codigoCanje) ?? null)
    : null;

  return (
    <section
      aria-labelledby="rasca-titulo"
      className={`${className} relative min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-coal p-5 sm:p-7 xl:p-8`}
    >
      <div className="pointer-events-none absolute right-[-15%] top-[-10%] h-[55%] w-[70%] rounded-full bg-acid/[0.07] blur-[110px]" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 lg:max-w-none">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-xs text-acid">Rasca y Gana · Semana {numeroSemana(socio.semana)}</p>
            <h2
              id="rasca-titulo"
              className="mt-2 text-[clamp(1.6rem,2.6vw,2.5rem)] font-black leading-none tracking-[-0.03em]"
            >
              Tu tarjeta semanal
            </h2>
            <p className="mt-2 text-[12.5px] text-fog">
              Premios ocultos y 100 % aleatorios: se deciden en el momento de rascar.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${estados[fase].clase}`}
          >
            {estados[fase].texto}
          </span>
        </header>

        {/* Tarjeta protagonista */}
        <div className="relative flex shrink-0 items-center justify-center lg:min-h-[240px] lg:flex-1 lg:[container-type:size]">
          <div
            ref={tarjetaRef}
            className={`relative aspect-[5/4] w-full overflow-hidden rounded-[26px] border bg-[#0b0e0a] [container-type:size] sm:aspect-[4/3] lg:w-[min(100cqw,133.333cqh)] lg:max-w-[820px] ${
              fase === "listo"
                ? "glow-ready border-acid/60"
                : premio?.nivel === "legendario"
                  ? "border-acid"
                  : "border-white/12"
            }`}
          >
            {cubiertaVisible && <CapaMisterio fase={fase} serie={serie} />}
            {fase === "revelado" && premio && (
              <PremioRevelado premio={premio} serie={serie} animar={animarRevelado} />
            )}

            {cubiertaVisible && (
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className={`absolute inset-0 z-10 h-full w-full touch-none ${
                  fase === "listo" || fase === "rascando"
                    ? "cursor-grab active:cursor-grabbing"
                    : "pointer-events-none"
                } ${fase === "revelando" ? "cover-out" : ""}`}
                onPointerDown={alPresionar}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={alSoltar}
              />
            )}

            {fase === "bloqueado" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-[8cqw] text-center">
                <span className="grid h-[22cqh] w-[22cqh] place-items-center rounded-full border border-white/15 bg-ink/70 text-[length:10cqh] backdrop-blur">
                  🔒
                </span>
                <p className="mt-[4cqh] text-[length:clamp(15px,6.5cqh,28px)] font-black">Tarjeta bloqueada</p>
                <p className="mt-[1.5cqh] max-w-[34ch] text-[length:clamp(11px,3.8cqh,15px)] leading-snug text-mist">
                  Registra {faltan} {faltan === 1 ? "asistencia" : "asistencias"} más esta semana para
                  desbloquearla.
                </p>
                <div className="mt-[4cqh] flex gap-1.5" aria-hidden="true">
                  {Array.from({ length: plan.umbralJuego }, (_, indice) => (
                    <span
                      key={indice}
                      className={`h-2 w-[9cqh] min-w-6 rounded-full ${indice < asistencias ? "bg-acid" : "bg-white/15"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {fase === "listo" && (
              <span className="pointer-events-none absolute bottom-[6cqh] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-4 py-2 text-[length:clamp(9px,2.8cqh,12px)] font-bold uppercase tracking-[0.16em] text-acid">
                Toca la tarjeta o pulsa “Jugar”
              </span>
            )}

            {fase === "rascando" && !trazoIniciado && (
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-[7cqh]">
                <span className="swipe-hint text-[length:12cqh]" aria-hidden="true">
                  👆
                </span>
                <span className="mt-[2cqh] rounded-full bg-ink/85 px-4 py-1.5 text-[length:clamp(9px,2.8cqh,12px)] font-bold uppercase tracking-[0.16em] text-acid">
                  Desliza para rascar
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones y resultado */}
        <div className="relative shrink-0" aria-live="polite">
          {fase === "bloqueado" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-bold">Desbloquéala con constancia</p>
                <p className="mt-1 text-[11.5px] text-fog">
                  {plan.nombre}: necesitas {plan.umbralJuego} asistencias esta semana. Llevas {asistencias}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onIrAAsistencia}
                  className="rounded-full border border-acid/50 px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-acid lg:hidden"
                >
                  Registrar asistencia
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-fog"
                >
                  🔒 Jugar Rasca y Gana
                </button>
              </div>
            </div>
          )}

          {fase === "listo" && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] leading-relaxed text-mist">
                ¡Tarjeta desbloqueada! Nadie sabe qué hay debajo: el premio se sortea al rascar.
              </p>
              <button
                type="button"
                onClick={() => setJugando(true)}
                className="glow-ready inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-acid px-6 text-[11px] font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-white"
              >
                Jugar Rasca y Gana
              </button>
            </div>
          )}

          {fase === "rascando" && (
            <div>
              <div className="flex items-center justify-between gap-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-fog">
                <span>Rascado {Math.round(progreso * 100)}%</span>
                <button
                  type="button"
                  onClick={() => void revelar()}
                  className="text-acid underline underline-offset-4"
                >
                  Revelar de una vez
                </button>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-acid transition-[width] duration-200"
                  style={{ width: `${Math.min(100, Math.round((progreso / UMBRAL_REVELADO) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {fase === "revelando" && (
            <div className="flex items-center gap-3 rounded-2xl border border-acid/30 bg-acid/[0.06] p-4">
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-acid border-t-transparent" />
              <p className="text-[12.5px] font-semibold text-acid">
                Sorteando tu premio según tu nivel de suerte ({nivelDeSuerte(asistencias)}/{MAX_NIVEL_SUERTE})…
              </p>
            </div>
          )}

          {fase === "revelado" && premio && (
            <ResultadoPremio
              premio={premio}
              socio={socio}
              plan={plan}
              estadoEmail={estadoEmail}
              animar={animarRevelado}
              proximoJuego={proximoJuego}
              onVerEmail={() => setEmailAbierto(true)}
              onReintentar={() => void enviarEmail()}
            />
          )}

          {error && (
            <p role="alert" className="toast-in mt-3 text-[11.5px] font-medium text-red-300">
              ⚠️ {error}
            </p>
          )}
        </div>

        {fase !== "revelado" && <NivelSuerte asistencias={asistencias} />}

        <Historial premios={historial} />
      </div>

      {emailAbierto && emailPremio && (
        <EmailModal email={emailPremio} onClose={() => setEmailAbierto(false)} />
      )}
    </section>
  );
}
