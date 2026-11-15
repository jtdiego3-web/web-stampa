import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import { newsletterSubscribers } from "@/db/schema";
import { sendNewsletterWelcome } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let payload: { email?: unknown; name?: unknown; source?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 120) : "";
  const source = typeof payload.source === "string" ? payload.source.slice(0, 40) : "popup";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Introduce un email válido para recibir los consejos." },
      { status: 400 },
    );
  }

  try {
    await ensureDatabaseReady();
    const [subscriber] = await db
      .insert(newsletterSubscribers)
      .values({ email, name: name || null, source })
      .onConflictDoNothing({ target: newsletterSubscribers.email })
      .returning({ id: newsletterSubscribers.id });

    if (subscriber) {
      await sendNewsletterWelcome({ name: name || null, recipient: email });
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed: !subscriber,
      message: subscriber
        ? "¡Dentro! Revisa tu correo: te hemos enviado la primera entrega."
        : "Ya estabas en el Stampa Insider. Te esperamos en el próximo email.",
    });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json(
      { ok: false, error: "No hemos podido suscribirte. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
