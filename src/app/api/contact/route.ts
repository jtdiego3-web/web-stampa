import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import { contactMessages } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim().slice(0, 40) : "";
  const topic = typeof payload.topic === "string" ? payload.topic.slice(0, 60) : "Membresías";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Dinos cómo te llamas." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, error: "El email no parece válido." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Cuéntanos un poco más (mínimo 10 caracteres)." },
      { status: 400 },
    );
  }

  try {
    await ensureDatabaseReady();
    await db.insert(contactMessages).values({
      name: name.slice(0, 120),
      email,
      phone: phone || null,
      topic,
      message: message.slice(0, 4000),
    });

    return NextResponse.json({
      ok: true,
      message: "Mensaje recibido. Te respondemos en menos de 24 h laborables.",
    });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo enviar el mensaje. Prueba por WhatsApp." },
      { status: 500 },
    );
  }
}
