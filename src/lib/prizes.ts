/**
 * Motor de premios del "Rasca y Gana".
 *
 * A mayor número de asistencias registradas en la semana, mayor peso de los
 * premios de alto valor (descuentos) y menor peso de los premios de menor valor.
 * El sorteo se ejecuta SIEMPRE en el servidor (nunca en el cliente).
 */

export type PrizeKind = "product" | "discount";

export type PrizeId =
  | "cafe"
  | "straps"
  | "sandwich"
  | "barrita"
  | "dona"
  | "disc10"
  | "disc20";

export type Prize = {
  id: PrizeId;
  label: string;
  kind: PrizeKind;
  emoji: string;
  value: string;
  description: string;
  discountPct?: number;
  highValue: boolean;
  /** Instrucciones de canje que viajan en el email al socio. */
  redeem: string;
};

export const PRIZES: Record<PrizeId, Prize> = {
  cafe: {
    id: "cafe",
    label: "Ganaste un café",
    kind: "product",
    emoji: "☕",
    value: "Café de especialidad",
    description: "Un café de especialidad en nuestro Wellness Bar para empezar con energía.",
    highValue: false,
    redeem: "Preséntate en el Wellness Bar del club y muestra tu código de canje.",
  },
  straps: {
    id: "straps",
    label: "Ganaste unos straps",
    kind: "product",
    emoji: "🏋️",
    value: "Straps de entrenamiento",
    description: "Straps de agarre para tus días de fuerza y dominadas.",
    highValue: false,
    redeem: "Recoge tus straps en recepción mostrando tu código de canje.",
  },
  sandwich: {
    id: "sandwich",
    label: "Ganaste un sándwich",
    kind: "product",
    emoji: "🥪",
    value: "Sándwich proteico",
    description: "Sándwich proteico del menú Stampa Kitchen para después de entrenar.",
    highValue: false,
    redeem: "Canjéalo en Stampa Kitchen antes de las 18:00 con tu código.",
  },
  barrita: {
    id: "barrita",
    label: "Ganaste una barrita Shockprotein",
    kind: "product",
    emoji: "🍫",
    value: "Barrita Shockprotein",
    description: "Una barrita proteica Shockprotein para tu post-entreno.",
    highValue: false,
    redeem: "Recógela en recepción con tu código de canje.",
  },
  dona: {
    id: "dona",
    label: "Ganaste una dona proteica",
    kind: "product",
    emoji: "🍩",
    value: "Dona proteica",
    description: "Dona proteica artesanal, el capricho que sí suma.",
    highValue: false,
    redeem: "Canjéala en el Wellness Bar con tu código de canje.",
  },
  disc10: {
    id: "disc10",
    label: "Descuento del 10%",
    kind: "discount",
    emoji: "🎟️",
    value: "10% de descuento",
    description: "Solo aplicable a la renovación del plan Mensual (26 sesiones).",
    discountPct: 10,
    highValue: true,
    redeem:
      "Aplica el código al renovar el plan Mensual de 26 sesiones. No acumulable con otras promociones y válido durante 30 días.",
  },
  disc20: {
    id: "disc20",
    label: "Descuento del 20%",
    kind: "discount",
    emoji: "🏆",
    value: "20% de descuento",
    description: "Solo aplicable a la renovación del plan Mensual (26 sesiones).",
    discountPct: 20,
    highValue: true,
    redeem:
      "Aplica el código al renovar el plan Mensual de 26 sesiones. No acumulable con otras promociones y válido durante 30 días.",
  },
};

export const PRIZE_LIST = Object.values(PRIZES);

/** Peso base de cada premio en función de las asistencias (0-6) de la semana. */
const WEIGHT_RULES: Record<PrizeId, (attendance: number) => number> = {
  cafe: (a) => Math.max(24 - 2.2 * a, 4),
  straps: (a) => Math.max(12 - 0.5 * a, 4),
  sandwich: (a) => Math.max(16 - 0.8 * a, 4),
  barrita: (a) => Math.max(18 - 1 * a, 4),
  dona: (a) => Math.max(15 - 1 * a, 4),
  disc10: (a) => 9 + 1.1 * a + 0.15 * a * a,
  disc20: (a) => 6 + 0.9 * a + 0.25 * a * a,
};

export function clampAttendance(value: number): number {
  return Math.max(0, Math.min(WEEK_LENGTH_MAX, Math.round(value)));
}

const WEEK_LENGTH_MAX = 6;

export type Odds = {
  id: PrizeId;
  label: string;
  emoji: string;
  kind: PrizeKind;
  highValue: boolean;
  probability: number;
};

/** Probabilidades normalizadas (en %) para mostrar en el dashboard. */
export function computeOdds(attendance: number): Odds[] {
  const safe = clampAttendance(attendance);
  const entries = (Object.keys(WEIGHT_RULES) as PrizeId[]).map((id) => ({
    id,
    weight: WEIGHT_RULES[id](safe),
  }));
  const total = entries.reduce((acc, item) => acc + item.weight, 0);

  return entries
    .map((entry) => {
      const prize = PRIZES[entry.id];
      return {
        id: prize.id,
        label: prize.label,
        emoji: prize.emoji,
        kind: prize.kind,
        highValue: prize.highValue,
        probability: Number(((entry.weight / total) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

export function highValueChance(attendance: number): number {
  return Number(
    computeOdds(attendance)
      .filter((odds) => odds.highValue)
      .reduce((acc, item) => acc + item.probability, 0)
      .toFixed(1),
  );
}

/** Sorteo ponderado con pesos dependientes de las asistencias. */
export function drawPrize(attendance: number, random: number = Math.random()): Prize {
  const safe = clampAttendance(attendance);
  const entries = (Object.keys(WEIGHT_RULES) as PrizeId[]).map((id) => ({
    id,
    weight: WEIGHT_RULES[id](safe),
  }));
  const total = entries.reduce((acc, item) => acc + item.weight, 0);
  let ticket = random * total;

  for (const entry of entries) {
    ticket -= entry.weight;
    if (ticket <= 0) return PRIZES[entry.id];
  }
  return PRIZES[entries[0].id];
}

export function buildCouponCode(prizeId: PrizeId, random: number = Math.random()): string {
  const suffix = Math.floor(random * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0")
    .slice(-4);
  return `ST-${prizeId.toUpperCase().slice(0, 4)}-${suffix}`;
}
