/**
 * BACKEND SIMULADO · Portal de socios
 *
 * Cada función imita un endpoint REST: es asíncrona, añade latencia de red y
 * devuelve { ok: true, data } o { ok: false, error }.
 * Para conectar un backend real basta con sustituir el cuerpo de cada función
 * por un fetch() al endpoint indicado en su comentario.
 */
import { SITE } from "@/lib/site";
import {
  buscarSocio,
  guardarSesion,
  guardarSocio,
  mesDe,
  normalizarCodigo,
  restablecerBaseDatos,
  type EmailSimulado,
  type PremioGanado,
  type SocioRegistro,
} from "./mock-db";
import { DIAS_APERTURA_SEMANA, obtenerPlan } from "./planes";
import {
  NIVELES,
  PREMIOS_POR_ID,
  generarCodigoCanje,
  obtenerPremioAleatorio,
  textoAplicacion,
} from "./premios";
import { desplazarSemana, lunesDeSemana } from "./semanas";

type Fallo = { ok: false; error: string };
export type RespuestaApi<T> = { ok: true; data: T } | Fallo;

const LATENCIA_MS = {
  login: 650,
  asistencia: 500,
  sorteo: 600,
  email: 1400,
  utilidad: 400,
} as const;

const SESION_INVALIDA = "Sesión no válida. Vuelve a ingresar con tu código.";

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exito<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}

function fallo(error: string): Fallo {
  return { ok: false, error };
}

/* ------------------------------------------------------------------ LOGIN */

/** POST /api/socios/login */
export async function apiLogin(codigoIngresado: string): Promise<RespuestaApi<SocioRegistro>> {
  await esperar(LATENCIA_MS.login);

  const codigo = normalizarCodigo(codigoIngresado);
  if (!codigo) return fallo("El código de inscrito debe ser numérico (00001 – 9999).");

  const socio = buscarSocio(codigo);
  if (!socio) {
    return fallo(
      "Código de inscrito no encontrado. Revisa tu tarjeta de socio o escríbenos por WhatsApp.",
    );
  }

  guardarSesion(socio.codigo);
  return exito(socio);
}

/* ------------------------------------------------------------- ASISTENCIA */

export type ResultadoAsistencia = {
  socio: SocioRegistro;
  mensaje: string;
  desbloqueoJuego: boolean;
  metaCumplida: boolean;
};

/** POST /api/socios/asistencias */
export async function apiRegistrarAsistencia(
  codigo: string,
): Promise<RespuestaApi<ResultadoAsistencia>> {
  await esperar(LATENCIA_MS.asistencia);

  const socio = buscarSocio(codigo);
  if (!socio) return fallo(SESION_INVALIDA);
  const plan = obtenerPlan(socio.tipoPlan);

  if (socio.asistenciasSemana >= DIAS_APERTURA_SEMANA) {
    return fallo(
      `Ya registraste los ${DIAS_APERTURA_SEMANA} días de esta semana: el club abre de lunes a sábado.`,
    );
  }
  if (socio.asistenciasMes >= plan.sesionesMes) {
    return fallo(
      `Ya usaste las ${plan.sesionesMes} sesiones de tu ${plan.nombre} este mes. Renueva para seguir entrenando.`,
    );
  }

  const actualizado = guardarSocio({
    ...socio,
    asistenciasSemana: socio.asistenciasSemana + 1,
    asistenciasMes: socio.asistenciasMes + 1,
    ultimaAsistencia: new Date().toISOString(),
  });

  const total = actualizado.asistenciasSemana;
  const metaCumplida = total === plan.metaSemanal;

  return exito({
    socio: actualizado,
    mensaje: metaCumplida
      ? `¡Asistencia registrada! Cumpliste tu meta semanal de ${plan.metaSemanal} días.`
      : `¡Asistencia registrada con éxito! Llevas ${total} de ${DIAS_APERTURA_SEMANA} días esta semana.`,
    desbloqueoJuego: total === plan.umbralJuego && !actualizado.premioSemana,
    metaCumplida,
  });
}

/* ----------------------------------------------------------- RASCA Y GANA */

export type ResultadoRevelado = { socio: SocioRegistro; premio: PremioGanado; nuevo: boolean };

/**
 * POST /api/socios/rasca-y-gana/revelar
 * El sorteo se ejecuta AQUÍ, en el momento de revelar la tarjeta: antes de
 * rascar no existe ningún premio asignado (sorpresa 100 % real). El premio queda
 * vinculado a la cuenta del socio y solo se permite una jugada por semana.
 */
export async function apiRevelarPremio(codigo: string): Promise<RespuestaApi<ResultadoRevelado>> {
  await esperar(LATENCIA_MS.sorteo);

  const socio = buscarSocio(codigo);
  if (!socio) return fallo(SESION_INVALIDA);
  if (socio.premioSemana) return exito({ socio, premio: socio.premioSemana, nuevo: false });

  const plan = obtenerPlan(socio.tipoPlan);
  if (socio.asistenciasSemana < plan.umbralJuego) {
    return fallo(
      `Necesitas ${plan.umbralJuego} asistencias esta semana para jugar. Llevas ${socio.asistenciasSemana}.`,
    );
  }

  const premio = obtenerPremioAleatorio(socio.asistenciasSemana);
  const ganado: PremioGanado = {
    id: premio.id,
    nombre: premio.nombre,
    emoji: premio.emoji,
    nivel: premio.nivel,
    codigoCanje: generarCodigoCanje(premio),
    semana: socio.semana,
    fecha: new Date().toISOString(),
    asistencias: socio.asistenciasSemana,
    vinculadoA: socio.codigo,
    emailEnviado: false,
  };

  const actualizado = guardarSocio({
    ...socio,
    premioSemana: ganado,
    historialPremios: [ganado, ...socio.historialPremios].slice(0, 12),
  });

  return exito({ socio: actualizado, premio: ganado, nuevo: true });
}

/* --------------------------------------------------------- EMAIL SIMULADO */

const formatoFechaEmail = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function construirEmailPremio(socio: SocioRegistro, premio: PremioGanado): EmailSimulado {
  const catalogo = PREMIOS_POR_ID[premio.id];
  const plan = obtenerPlan(socio.tipoPlan);
  const vence = new Date(premio.fecha);
  vence.setDate(vence.getDate() + catalogo.validezDias);
  const titulo =
    catalogo.categoria === "descuento" ? `${premio.nombre} (solo plan mensual)` : premio.nombre;

  const cuerpo = [
    `Hola ${socio.nombre},`,
    "",
    `¡Felicidades! Rascaste tu tarjeta semanal y ganaste: ${titulo} ${premio.emoji}`,
    `Categoría: ${NIVELES[premio.nivel].etiqueta}`,
    "",
    `Tu premio ya está vinculado a tu cuenta de socio (código ${socio.codigo}).`,
    `Código de canje: ${premio.codigoCanje}`,
    `Válido hasta: ${formatoFechaEmail.format(vence)}`,
    "",
    "Cómo canjearlo:",
    `1. ${catalogo.instrucciones}`,
    `2. ${textoAplicacion(catalogo, plan.esPlanMensual)}`,
    "3. Muestra este email o tu código en recepción. Premio personal e intransferible.",
    "",
    `Asistencias registradas esta semana: ${premio.asistencias} de ${DIAS_APERTURA_SEMANA}`,
    `Tu plan: ${plan.etiqueta}`,
    "",
    "Cuantas más asistencias registres cada semana, más sube tu nivel de suerte en el próximo Rasca y Gana.",
    "",
    `${SITE.name} · ${SITE.address}`,
    `WhatsApp: ${SITE.phoneDisplay}`,
  ].join("\n");

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    para: socio.email,
    asunto: `🎁 ${socio.nombre.split(" ")[0]}, ganaste: ${titulo}`,
    cuerpo,
    fecha: new Date().toISOString(),
    codigoCanje: premio.codigoCanje,
    estado: "enviado (simulado)",
  };
}

export type ResultadoEmail = { socio: SocioRegistro; email: EmailSimulado };

/**
 * POST /api/socios/rasca-y-gana/notificar
 * Servicio de email SIMULADO: en producción aquí iría Resend, SendGrid, etc.
 */
export async function apiEnviarEmailPremio(codigo: string): Promise<RespuestaApi<ResultadoEmail>> {
  const socio = buscarSocio(codigo);
  if (!socio) return fallo(SESION_INVALIDA);

  const premio = socio.premioSemana;
  if (!premio) return fallo("No hay ningún premio pendiente de envío esta semana.");

  if (premio.emailEnviado) {
    const existente = socio.emails.find((email) => email.codigoCanje === premio.codigoCanje);
    if (existente) return exito({ socio, email: existente });
  }

  const email = construirEmailPremio(socio, premio);
  await esperar(LATENCIA_MS.email);
  console.info(`📧 [EMAIL SIMULADO] Para: ${email.para}\nAsunto: ${email.asunto}\n\n${email.cuerpo}`);

  // Se relee el registro por si cambió durante el envío.
  const fresco = buscarSocio(codigo) ?? socio;
  const marcarEnviado = (item: PremioGanado): PremioGanado =>
    item.codigoCanje === premio.codigoCanje ? { ...item, emailEnviado: true } : item;

  const actualizado = guardarSocio({
    ...fresco,
    premioSemana: fresco.premioSemana ? marcarEnviado(fresco.premioSemana) : null,
    historialPremios: fresco.historialPremios.map(marcarEnviado),
    emails: [email, ...fresco.emails.filter((item) => item.codigoCanje !== premio.codigoCanje)].slice(
      0,
      20,
    ),
  });

  return exito({ socio: actualizado, email });
}

/* ------------------------------------------------- HERRAMIENTAS DE DEMO */

/** Simula el paso a la semana siguiente (racha, contador y juego). */
export async function apiSimularNuevaSemana(codigo: string): Promise<RespuestaApi<SocioRegistro>> {
  await esperar(LATENCIA_MS.utilidad);
  const socio = buscarSocio(codigo);
  if (!socio) return fallo(SESION_INVALIDA);

  const plan = obtenerPlan(socio.tipoPlan);
  const semana = desplazarSemana(socio.semana, 1);
  const mes = mesDe(lunesDeSemana(semana));
  const cambioDeMes = mes > socio.mes;

  return exito(
    guardarSocio({
      ...socio,
      semana,
      mes: cambioDeMes ? mes : socio.mes,
      asistenciasMes: cambioDeMes ? 0 : socio.asistenciasMes,
      asistenciasSemana: 0,
      premioSemana: null,
      rachaSemanas: socio.asistenciasSemana >= plan.umbralJuego ? socio.rachaSemanas + 1 : 0,
    }),
  );
}

/** Restaura la base de datos simulada a sus valores iniciales. */
export async function apiRestablecerDemo(codigo: string): Promise<RespuestaApi<SocioRegistro>> {
  await esperar(LATENCIA_MS.utilidad);
  restablecerBaseDatos();
  const socio = buscarSocio(codigo);
  if (!socio) return fallo("El socio ya no existe en la base de datos de prueba.");
  return exito(socio);
}
