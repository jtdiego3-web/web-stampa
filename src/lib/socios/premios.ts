/**
 * MOTOR DE PREMIOS · "Rasca y Gana" (100 % navegador)
 *
 * CATÁLOGO AMPLIADO Y OCULTO: la interfaz nunca muestra esta lista. El premio se
 * sortea en el instante en que el socio termina de rascar su tarjeta.
 *
 * Opción A · Constancia
 *   Cada asistencia de la semana sube el "nivel de suerte" (0-6: el club abre 6
 *   días). Los premios de mayor valor ganan peso y los básicos lo pierden:
 *
 *       peso = max(pesoMinimo, pesoBase + factorAsistencia × asistencias)
 *
 * Opción B · Catálogo ampliado
 *   11 premios en 4 niveles (clásico, plus, mayor y legendario). La Sesión Gratis
 *   es legendaria: su peso es mínimo en todos los niveles (≈ 0,3 % – 1,1 %).
 *
 * El sorteo usa crypto.getRandomValues() → aleatoriedad criptográfica real.
 */

export const MAX_NIVEL_SUERTE = 6; // días que abre el club por semana

export type NivelPremio = "clasico" | "plus" | "mayor" | "legendario";
export type CategoriaPremio = "producto" | "descuento" | "sesion";

export type PremioId =
  | "espresso"
  | "capuccino"
  | "flatWhite"
  | "yogur"
  | "galleta"
  | "agua"
  | "barrita"
  | "dona"
  | "descuento10"
  | "descuento20"
  | "sesionGratis";

export type Premio = {
  id: PremioId;
  nombre: string;
  emoji: string;
  categoria: CategoriaPremio;
  nivel: NivelPremio;
  prefijo: string;
  descripcion: string;
  instrucciones: string;
  validezDias: number;
  pesoBase: number;
  factorAsistencia: number;
  pesoMinimo: number;
};

export const NIVELES: Record<NivelPremio, { etiqueta: string; titular: string }> = {
  clasico: { etiqueta: "Premio", titular: "¡Ganaste!" },
  plus: { etiqueta: "Premio Plus", titular: "¡Premio Plus!" },
  mayor: { etiqueta: "Premio Mayor", titular: "¡Premio Mayor!" },
  legendario: { etiqueta: "Premio Legendario", titular: "¡Premio Legendario!" },
};

const INSTRUCCIONES_DESCUENTO =
  "Presenta el código al renovar el plan mensual (Plan Completo · 26 sesiones). Válido para una sola renovación y no acumulable.";

/** Catálogo ampliado de premios (oculto en la interfaz). */
export const PREMIOS: readonly Premio[] = [
  {
    id: "espresso",
    nombre: "Café espresso",
    emoji: "☕",
    categoria: "producto",
    nivel: "clasico",
    prefijo: "ESPR",
    descripcion: "Un espresso intenso para arrancar con energía.",
    instrucciones: "Canjéalo en recepción por un café espresso.",
    validezDias: 14,
    pesoBase: 15,
    factorAsistencia: -1.1,
    pesoMinimo: 6,
  },
  {
    id: "capuccino",
    nombre: "Capuccino",
    emoji: "☕",
    categoria: "producto",
    nivel: "plus",
    prefijo: "CAPU",
    descripcion: "Capuccino cremoso para después de entrenar.",
    instrucciones: "Canjéalo en recepción por un capuccino.",
    validezDias: 14,
    pesoBase: 11,
    factorAsistencia: -0.6,
    pesoMinimo: 5,
  },
  {
    id: "flatWhite",
    nombre: "Flat White",
    emoji: "☕",
    categoria: "producto",
    nivel: "plus",
    prefijo: "FLAT",
    descripcion: "Doble espresso con leche texturizada.",
    instrucciones: "Canjéalo en recepción por un Flat White.",
    validezDias: 14,
    pesoBase: 10,
    factorAsistencia: -0.5,
    pesoMinimo: 5,
  },
  {
    id: "yogur",
    nombre: "Yogur Gratis",
    emoji: "🥣",
    categoria: "producto",
    nivel: "clasico",
    prefijo: "YOGU",
    descripcion: "Un yogur gratis para tu post-entreno.",
    instrucciones: "Canjea tu yogur gratis en recepción.",
    validezDias: 14,
    pesoBase: 12,
    factorAsistencia: -0.8,
    pesoMinimo: 5,
  },
  {
    id: "galleta",
    nombre: "Galleta Proteica",
    emoji: "🍪",
    categoria: "producto",
    nivel: "plus",
    prefijo: "GALL",
    descripcion: "Galleta alta en proteína para recargar.",
    instrucciones: "Recoge tu galleta proteica en recepción.",
    validezDias: 14,
    pesoBase: 10,
    factorAsistencia: -0.6,
    pesoMinimo: 5,
  },
  {
    id: "agua",
    nombre: "Botella de agua 600 ml",
    emoji: "💧",
    categoria: "producto",
    nivel: "clasico",
    prefijo: "AGUA",
    descripcion: "Hidratación para tu sesión: botella de 600 ml.",
    instrucciones: "Recoge tu botella de agua de 600 ml en recepción.",
    validezDias: 14,
    pesoBase: 16,
    factorAsistencia: -1.2,
    pesoMinimo: 6,
  },
  {
    id: "barrita",
    nombre: "Barrita Shockprotein",
    emoji: "🍫",
    categoria: "producto",
    nivel: "plus",
    prefijo: "SHOK",
    descripcion: "Barrita proteica Shockprotein para tu post-entreno.",
    instrucciones: "Recoge tu barrita Shockprotein en recepción.",
    validezDias: 14,
    pesoBase: 9,
    factorAsistencia: -0.4,
    pesoMinimo: 5,
  },
  {
    id: "dona",
    nombre: "Dona proteica",
    emoji: "🍩",
    categoria: "producto",
    nivel: "plus",
    prefijo: "DONA",
    descripcion: "El antojo que sí suma: dona alta en proteína.",
    instrucciones: "Canjea tu dona proteica en recepción.",
    validezDias: 14,
    pesoBase: 9,
    factorAsistencia: -0.4,
    pesoMinimo: 5,
  },
  {
    id: "descuento10",
    nombre: "Descuento del 10%",
    emoji: "🎟️",
    categoria: "descuento",
    nivel: "mayor",
    prefijo: "D10",
    descripcion: "10 % de descuento en el plan mensual.",
    instrucciones: INSTRUCCIONES_DESCUENTO,
    validezDias: 30,
    pesoBase: 4,
    factorAsistencia: 3,
    pesoMinimo: 4,
  },
  {
    id: "descuento20",
    nombre: "Descuento del 20%",
    emoji: "🏆",
    categoria: "descuento",
    nivel: "mayor",
    prefijo: "D20",
    descripcion: "20 % de descuento en el plan mensual.",
    instrucciones: INSTRUCCIONES_DESCUENTO,
    validezDias: 30,
    pesoBase: 1.5,
    factorAsistencia: 2,
    pesoMinimo: 1.5,
  },
  {
    id: "sesionGratis",
    nombre: "Sesión Gratis",
    emoji: "🏋️",
    categoria: "sesion",
    nivel: "legendario",
    prefijo: "SESN",
    descripcion: "Una sesión extra de musculación o cardio, totalmente gratis.",
    instrucciones: "Presenta el código en recepción para activar tu sesión gratis.",
    validezDias: 30,
    // Peso reducido: probabilidad muy baja en todos los niveles de suerte.
    pesoBase: 0.3,
    factorAsistencia: 0.12,
    pesoMinimo: 0.3,
  },
];

export const PREMIOS_POR_ID = Object.fromEntries(
  PREMIOS.map((premio) => [premio.id, premio]),
) as Record<PremioId, Premio>;

/** Nivel de suerte = asistencias de la semana, acotado a 0-6. */
export function nivelDeSuerte(asistencias: number): number {
  if (!Number.isFinite(asistencias)) return 0;
  return Math.min(MAX_NIVEL_SUERTE, Math.max(0, Math.floor(asistencias)));
}

export function calcularPeso(premio: Premio, asistencias: number): number {
  return Math.max(
    premio.pesoMinimo,
    premio.pesoBase + premio.factorAsistencia * nivelDeSuerte(asistencias),
  );
}

export type Probabilidad = { premio: Premio; peso: number; porcentaje: number };

export function calcularProbabilidades(asistencias: number): Probabilidad[] {
  const pesos = PREMIOS.map((premio) => ({ premio, peso: calcularPeso(premio, asistencias) }));
  const total = pesos.reduce((suma, item) => suma + item.peso, 0);
  return pesos.map((item) => ({ ...item, porcentaje: (item.peso / total) * 100 }));
}

/** Probabilidad (%) de un premio de alto valor (descuentos o Sesión Gratis). */
export function probabilidadPremioMayor(asistencias: number): number {
  return calcularProbabilidades(asistencias)
    .filter((item) => item.premio.nivel === "mayor" || item.premio.nivel === "legendario")
    .reduce((suma, item) => suma + item.porcentaje, 0);
}

/** Número aleatorio en [0, 1) con crypto.getRandomValues (fallback Math.random). */
export function aleatorioSeguro(): number {
  const cripto = globalThis.crypto;
  if (cripto && typeof cripto.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    cripto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  }
  return Math.random();
}

/**
 * ALGORITMO DE PROBABILIDAD (Opción A + Opción B integradas)
 * Lee las asistencias de la semana y devuelve un premio del catálogo ampliado
 * mediante un sorteo ponderado (ruleta). `aleatorio` es inyectable para tests.
 */
export function obtenerPremioAleatorio(
  asistencias: number,
  aleatorio: () => number = aleatorioSeguro,
): Premio {
  const pesos = PREMIOS.map((premio) => calcularPeso(premio, asistencias));
  const total = pesos.reduce((suma, peso) => suma + peso, 0);
  let boleto = aleatorio() * total;

  for (let indice = 0; indice < PREMIOS.length; indice += 1) {
    boleto -= pesos[indice];
    if (boleto < 0) return PREMIOS[indice];
  }
  return PREMIOS[PREMIOS.length - 1];
}

/** Código único de canje, p. ej. STAMPA-D20-7KQ2X */
export function generarCodigoCanje(premio: Premio, aleatorio: () => number = aleatorioSeguro): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sufijo = "";
  for (let i = 0; i < 5; i += 1) {
    sufijo += alfabeto[Math.floor(aleatorio() * alfabeto.length)];
  }
  return `STAMPA-${premio.prefijo}-${sufijo}`;
}

/** Cómo se aplica el premio según el plan del socio. */
export function textoAplicacion(premio: Premio, esPlanMensual: boolean): string {
  if (premio.categoria === "descuento") {
    return esPlanMensual
      ? "Solo plan mensual: se aplica en la renovación de tu Plan Completo (26 sesiones)."
      : "Solo plan mensual: úsalo al renovar pasándote al Plan Completo (26 sesiones).";
  }
  if (premio.categoria === "sesion") {
    return "Se suma a tu plan como una sesión adicional de musculación o cardio.";
  }
  return "Canje en recepción presentando tu código.";
}

/** Línea corta para la tarjeta revelada. */
export function resumenCanje(premio: Premio): string {
  if (premio.categoria === "descuento") return `Solo plan mensual · válido ${premio.validezDias} días`;
  if (premio.categoria === "sesion") return `Sesión extra · válida ${premio.validezDias} días`;
  return `Canje en recepción · válido ${premio.validezDias} días`;
}

export function formatearPorcentaje(valor: number): string {
  const numero = valor.toLocaleString("es-BO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${numero}\u00a0%`;
}
