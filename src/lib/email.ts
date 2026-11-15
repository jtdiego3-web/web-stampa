import { db } from "@/db";
import { emailLog } from "@/db/schema";
import type { Prize } from "@/lib/prizes";
import { SITE } from "@/lib/site";

export type PrizeEmailPayload = {
  memberId: number | null;
  recipient: string;
  firstName: string;
  prize: Prize;
  couponCode: string;
  attendance: number;
  planName: string;
};

/**
 * NOTIFICACIÓN SIMULADA.
 * Construye el email transaccional que se envía al socio con el premio y las
 * instrucciones de canje. En producción basta con sustituir `deliverEmail`
 * por Resend / Nodemailer / SES manteniendo esta misma firma.
 */
export function buildPrizeEmail(payload: PrizeEmailPayload): { subject: string; body: string } {
  const { firstName, prize, couponCode, attendance, planName } = payload;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 14);
  const expiryLabel = expiry.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subject = `🎁 ${prize.label} — tu Rasca y Gana de Stampa Wellness Gym`;
  const discountLine = prize.discountPct
    ? `\nAplicable a la renovación del plan Mensual (26 sesiones) de ${SITE.name}.`
    : "\nPremio de producto: canjéalo en recepción o en el Wellness Bar.";

  const body = [
    `Hola ${firstName},`,
    "",
    `¡Enhorabuena! Has ganado con tu rasca semanal: ${prize.label}.`,
    `Tu código de canje es: ${couponCode}`,
    discountLine,
    `Asistencias registradas esta semana: ${attendance}. Plan actual: ${planName}.`,
    "",
    "Cómo canjearlo",
    `1. ${prize.redeem}`,
    `2. Muestra este email o tu código ${couponCode} en recepción.`,
    `3. Válido hasta el ${expiryLabel}. No acumulable con otras promociones.`,
    "",
    "Sigue entrenando: cada semana que registres asistencia podrás volver a rascar y",
    "cuantos más días vengas, más probabilidades tendrás de ganar los descuentos del 10% y 20%.",
    "",
    `Nos vemos en el club.`,
    `Equipo ${SITE.name} · ${SITE.address}`,
    `${SITE.email} · WhatsApp ${SITE.phoneDisplay}`,
  ].join("\n");

  return { subject, body };
}

/** Punto de salida del envío. Mock: persiste en email_log y escribe en consola. */
async function deliverEmail(input: {
  memberId: number | null;
  recipient: string;
  subject: string;
  body: string;
  kind: string;
}): Promise<{ status: "simulado" | "error"; id: number | null }> {
  try {
    const [entry] = await db
      .insert(emailLog)
      .values({
        memberId: input.memberId,
        recipient: input.recipient,
        subject: input.subject,
        body: input.body,
        kind: input.kind,
        status: "simulado",
      })
      .returning({ id: emailLog.id });

    // Mock de proveedor: aquí iría await resend.emails.send({...}).
    console.info(
      `[email:simulado] → ${input.recipient} | ${input.subject} | log #${entry?.id ?? "?"}`,
    );
    return { status: "simulado", id: entry?.id ?? null };
  } catch (error) {
    console.error("[email:error] No se pudo registrar la notificación", error);
    return { status: "error", id: null };
  }
}

export async function sendPrizeEmail(
  payload: PrizeEmailPayload,
): Promise<{ status: "simulado" | "error"; recipient: string; subject: string }> {
  const { subject, body } = buildPrizeEmail(payload);
  const result = await deliverEmail({
    memberId: payload.memberId,
    recipient: payload.recipient,
    subject,
    body,
    kind: "premio",
  });

  return { status: result.status, recipient: payload.recipient, subject };
}

export async function sendNewsletterWelcome(input: {
  name: string | null;
  recipient: string;
}): Promise<void> {
  const subject = "Bienvenido/a al Stampa Insider · consejos de entrenamiento y nutrición";
  const body = [
    input.name ? `Hola ${input.name},` : "Hola,",
    "",
    "Ya formas parte del Stampa Insider. Cada martes recibirás una rutina corta,",
    "una pauta de nutrición y acceso anticipado a eventos del club.",
    "",
    "Mientras tanto, pásate por el club: la primera sesión de bienvenida con un",
    "entrenador es gratuita. Reserva por WhatsApp.",
    "",
    `Equipo ${SITE.name}`,
  ].join("\n");

  await deliverEmail({
    memberId: null,
    recipient: input.recipient,
    subject,
    body,
    kind: "newsletter",
  });
}
