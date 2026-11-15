"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Logo } from "@/components/logo";
import { apiLogin } from "@/lib/socios/mock-api";
import { listarUsuariosDemo, normalizarCodigo, type SocioRegistro } from "@/lib/socios/mock-db";
import { PLANES_SOCIO } from "@/lib/socios/planes";
import { SITE, whatsappLink } from "@/lib/site";

export type OrigenTransicion = { x: number; y: number };

type LoginViewProps = {
  heroImage: string;
  onLogin: (socio: SocioRegistro, origen: OrigenTransicion) => void;
};

const PASOS = [
  {
    titulo: "Ingresa con tu código",
    texto: "Acceso exclusivo con tu Código de Inscrito (00001 – 9999).",
  },
  {
    titulo: "Registra tus asistencias",
    texto: `${PLANES_SOCIO.completo.nombre}: ${PLANES_SOCIO.completo.sesionesMes} sesiones/mes · ${PLANES_SOCIO.medio.nombre}: ${PLANES_SOCIO.medio.sesionesMes} sesiones/mes.`,
  },
  {
    titulo: "Constancia = más suerte",
    texto: "Desbloquea el Rasca y Gana y sube tu nivel de suerte cada semana.",
  },
];

export function LoginView({ heroImage, onLogin }: LoginViewProps) {
  const botonRef = useRef<HTMLButtonElement>(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuariosDemo] = useState(listarUsuariosDemo);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) return;

    if (!normalizarCodigo(codigo)) {
      setError("Introduce un código numérico válido (00001 – 9999).");
      return;
    }

    setError("");
    setCargando(true);
    const respuesta = await apiLogin(codigo);

    if (!respuesta.ok) {
      setError(respuesta.error);
      setCargando(false);
      return;
    }

    const rect = botonRef.current?.getBoundingClientRect();
    onLogin(
      respuesta.data,
      rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    );
  }

  return (
    <main id="contenido" className="min-h-[100svh] bg-ink">
      <div className="grid min-h-[100svh] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Panel visual (escritorio) */}
        <section className="relative isolate hidden flex-col justify-between overflow-hidden p-10 lg:flex">
          <Image
            src={heroImage}
            alt="Sala de máquinas de Stampa Gym"
            fill
            loading="eager"
            sizes="50vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink/95 via-ink/75 to-ink/95" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_25%,rgba(230,255,60,0.16),transparent_55%)]" />

          <div className="flex items-center justify-between">
            <Logo href="/" />
            <Link
              href="/"
              className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-fog transition-colors hover:text-acid"
            >
              ← Volver al club
            </Link>
          </div>

          <div className="max-w-lg">
            <span className="label-xs text-acid">Área privada · socios Stampa</span>
            <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
              Entrena.
              <br />
              Registra.
              <br />
              <span className="text-acid">Rasca y gana.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-mist">
              Tu panel de socio a pantalla completa: datos, plan, asistencias de la semana y tu
              tarjeta de Rasca y Gana.
            </p>

            <ol className="mt-8 grid gap-2.5">
              {PASOS.map((paso, indice) => (
                <li
                  key={paso.titulo}
                  className="flex items-start gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-acid text-[11px] font-black text-ink">
                    {indice + 1}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-white">{paso.titulo}</span>
                    <span className="block text-[11.5px] text-fog">{paso.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Los premios NO se muestran: se descubren solo al rascar. */}
          <div className="flex max-w-lg items-center gap-4 rounded-[16px] border border-white/12 bg-white/[0.04] p-4 backdrop-blur">
            <div className="flex -space-x-2" aria-hidden="true">
              {[0, 1, 2, 3].map((indice) => (
                <span
                  key={indice}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-acid/30 bg-ink text-lg font-black text-acid"
                >
                  ?
                </span>
              ))}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">Premios sorpresa cada semana</p>
              <p className="text-[11.5px] leading-relaxed text-fog">
                Están ocultos y son aleatorios: solo los descubres al rascar tu tarjeta.
              </p>
            </div>
          </div>
        </section>

        {/* Formulario de acceso */}
        <section className="flex flex-col justify-center px-5 py-8 pb-28 sm:px-10 sm:py-12 lg:pb-12">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Logo href="/" />
              <Link
                href="/"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fog hover:text-acid"
              >
                ← Inicio
              </Link>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-graphite to-coal p-6 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)] sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-acid/40 bg-acid/10 text-acid">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                    <rect x="3.5" y="8.5" width="13" height="8.5" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7 8.5V6.5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="label-xs text-fog">Acceso exclusivo para socios</span>
              </div>

              <h2 className="mt-5 text-[26px] font-black leading-none tracking-[-0.025em] sm:text-[30px]">
                Bienvenido
                <br />
                de nuevo.
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-fog">
                Ingresa tu Código de Inscrito para abrir tu panel a pantalla completa.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <label htmlFor="codigo-inscrito" className="label-xs block text-fog">
                  Código de Inscrito
                </label>
                <div className="relative mt-2.5">
                  <input
                    id="codigo-inscrito"
                    name="codigo"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    maxLength={5}
                    value={codigo}
                    onChange={(event) => {
                      setCodigo(event.target.value.replace(/\D/g, "").slice(0, 5));
                      if (error) setError("");
                    }}
                    placeholder="00000"
                    aria-invalid={Boolean(error)}
                    aria-describedby="codigo-ayuda"
                    className="w-full rounded-[14px] border border-line bg-white/[0.03] px-4 py-4 text-center text-[26px] font-bold tracking-[0.5em] text-white outline-none transition-colors placeholder:text-white/15 focus:border-acid/70 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(230,255,60,0.12)] sm:py-5 sm:text-3xl"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.16em] text-fog">
                    {codigo.length}/5
                  </span>
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="toast-in mt-3 flex items-start gap-2 rounded-[10px] border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-xs leading-relaxed text-red-200"
                  >
                    <span aria-hidden="true">⚠</span>
                    {error}
                  </p>
                ) : (
                  <p id="codigo-ayuda" className="mt-3 text-[11px] leading-relaxed text-fog">
                    Lo encontrarás en tu tarjeta de socio. Solo números, del 00001 al 9999.
                  </p>
                )}

                <button
                  ref={botonRef}
                  type="submit"
                  disabled={cargando || codigo.length === 0}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-fog"
                >
                  {cargando ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Verificando código…
                    </>
                  ) : (
                    <>
                      Ingresar a mi panel
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                        <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-[14px] border border-dashed border-white/15 bg-white/[0.02] p-4">
                <p className="label-xs text-acid">Usuarios de prueba</p>
                <p className="mt-2 text-[11px] leading-relaxed text-fog">
                  Toca un usuario para rellenar su código.
                </p>
                <ul className="mt-3 grid gap-2">
                  {usuariosDemo.map((usuario) => (
                    <li key={usuario.codigo}>
                      <button
                        type="button"
                        onClick={() => {
                          setCodigo(usuario.codigo);
                          setError("");
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-acid/50 hover:bg-acid/[0.06]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-semibold text-white">
                            {usuario.nombre}
                          </span>
                          <span className="block truncate text-[10.5px] text-fog">
                            {usuario.plan} · {usuario.asistenciasSemana}/{usuario.umbralJuego}{" "}
                            para jugar
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full border border-acid/30 bg-acid/10 px-2.5 py-1 font-mono text-[12px] font-bold tracking-[0.12em] text-acid">
                          {usuario.codigo}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[12px] font-semibold text-white">¿Problemas con tu código?</p>
              <p className="mt-1 text-[11px] leading-relaxed text-fog">
                Escríbenos y te ayudamos a recuperar tu acceso.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-acid underline underline-offset-4"
              >
                WhatsApp · {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
