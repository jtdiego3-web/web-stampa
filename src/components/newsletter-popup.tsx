"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "stampa-insider-dismissed";

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let dismissed = true;
    try {
      dismissed = Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      dismissed = false;
    }
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 250);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* almacenamiento no disponible */
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "popup-home" }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setFeedback(data.error ?? "No hemos podido suscribirte. Inténtalo de nuevo.");
        return;
      }
      setStatus("success");
      setFeedback(data.message ?? "¡Dentro! Revisa tu correo.");
      try {
        window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {
        /* noop */
      }
    } catch {
      setStatus("error");
      setFeedback("Problema de conexión. Vuelve a intentarlo en un momento.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/80 p-3 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="animate-pop relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-white/12 bg-graphite shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:rounded-[30px]">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar pop-up"
          className="absolute right-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-ink/70 text-white transition-colors hover:border-acid hover:text-acid"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>

        <div className="grid sm:grid-cols-[0.85fr_1fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-acid p-7 text-ink sm:flex">
            <div>
              <span className="label-xs opacity-70">Stampa Insider</span>
              <p className="mt-4 text-[34px] font-black leading-[0.92] tracking-[-0.03em]">
                El 1%
                <br />
                que
                <br />
                entrena
                <br />
                distinto.
              </p>
            </div>
            <div className="relative z-10 space-y-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
              <p>· Rutinas de 30 min</p>
              <p>· Nutrición sin dietas</p>
              <p>· Acceso a eventos</p>
            </div>
            <span className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 rounded-full border-[22px] border-ink/10" />
            <span className="pointer-events-none absolute -bottom-6 -left-10 h-28 w-28 rounded-full border-[14px] border-ink/10" />
          </div>

          <div className="p-6 sm:p-8">
            {status === "success" ? (
              <div className="flex min-h-[320px] flex-col items-start justify-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-acid text-ink">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
                  Ya eres del Stampa Insider
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fog">{feedback}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-7 rounded-full bg-acid px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
                >
                  Seguir explorando
                </button>
              </div>
            ) : (
              <>
                <span className="label-xs text-acid">Newsletter exclusiva</span>
                <h2
                  id="newsletter-title"
                  className="mt-3 text-[26px] font-black leading-[1.02] tracking-[-0.025em] sm:text-[32px]"
                >
                  Consejos de entrenamiento y nutrición, sin humo.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fog">
                  Una rutina corta, una pauta de nutrición y un recordatorio: cada martes en tu
                  correo. Cero spam, cancelas cuando quieras.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
                  <div>
                    <label htmlFor="popup-name" className="sr-only">
                      Nombre
                    </label>
                    <input
                      id="popup-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Tu nombre (opcional)"
                      className="field"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="popup-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="popup-email"
                      ref={emailRef}
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tu@email.com"
                      className="field"
                      autoComplete="email"
                    />
                  </div>

                  {status === "error" && (
                    <p role="alert" className="text-xs font-medium text-red-300">
                      {feedback}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex w-full items-center justify-center gap-2 rounded-[0.9rem] bg-acid px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? "Enviando..." : "Quiero entrar"}
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                      <path
                        d="M2 8h11M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <p className="text-[10px] leading-relaxed text-fog/80">
                    Al suscribirte aceptas recibir emails de Stampa Wellness Gym. Puedes darte de
                    baja en un clic.
                  </p>
                </form>

                <button
                  type="button"
                  onClick={close}
                  className="mt-3 text-[11px] font-medium text-fog underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                >
                  Ahora no, prefiero improvisar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
