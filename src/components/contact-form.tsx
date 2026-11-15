"use client";

import { useState } from "react";

const TOPICS = [
  "Membresías y planes",
  "Entrenamiento personal",
  "Wellness y recovery",
  "Incidencia como socio",
  "Otro",
];

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0],
    message: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setFeedback(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }
      setStatus("success");
      setFeedback(data.message ?? "Mensaje enviado.");
    } catch {
      setStatus("error");
      setFeedback("Problema de conexión. Escríbenos por WhatsApp.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-start justify-center rounded-[24px] border border-acid/30 bg-acid/[0.06] p-7 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-acid text-ink">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-5 text-2xl font-black tracking-tight text-white">Mensaje recibido</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-fog">{feedback}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm({ name: "", email: "", phone: "", topic: TOPICS[0], message: "" });
          }}
          className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-acid hover:text-acid"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label-xs mb-2 block text-fog">
            Nombre
          </label>
          <input
            id="contact-name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Cómo te llamas"
            className="field"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="label-xs mb-2 block text-fog">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="tu@email.com"
            className="field"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="label-xs mb-2 block text-fog">
            Teléfono
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+591 7000 0000"
            className="field"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="contact-topic" className="label-xs mb-2 block text-fog">
            Me interesa
          </label>
          <select
            id="contact-topic"
            value={form.topic}
            onChange={(event) => update("topic", event.target.value)}
            className="field appearance-none pr-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'><path d='M4 6l4 4 4-4' stroke='%238e978f' stroke-width='1.6'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "16px",
            }}
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic} className="bg-graphite">
                {topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="label-xs mb-2 block text-fog">
          Tu mensaje
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Cuéntanos tu objetivo, horarios o cualquier duda…"
          className="field resize-none"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-xs font-medium text-red-300">
          {feedback}
        </p>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[15rem] text-[10px] leading-relaxed text-fog/80">
          Respondemos en menos de 24 h laborables. Sin compromiso ni llamadas insistentes.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
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
      </div>
    </form>
  );
}
