export type PlanId = "mensual_26" | "medio_mes_13";

export type Plan = {
  id: PlanId;
  name: string;
  sessions: number;
  price: number;
  currency: string;
  badge: string;
  description: string;
  features: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  mensual_26: {
    id: "mensual_26",
    name: "Plan Pro · Musculación",
    sessions: 26,
    price: 179,
    currency: "Bs",
    badge: "Más popular",
    description: "Acceso libre 6 días a la semana. El plan de los que no negocian con su rutina.",
    features: [
      "26 sesiones al mes",
      "Sala de fuerza + funcional + cardio",
      "Wellness, sauna y Wellness Bar",
      "Rasca y Gana semanal",
      "Seguimiento con entrenador",
    ],
  },
  medio_mes_13: {
    id: "medio_mes_13",
    name: "Plan Smart · Musculación",
    sessions: 13,
    price: 119,
    currency: "Bs",
    badge: "Flexible",
    description: "13 sesiones para las semanas de viajes, guardias o dobles turnos.",
    features: [
      "13 sesiones al mes",
      "Acceso a todas las zonas",
      "Wellness y Wellness Bar",
      "Rasca y Gana semanal",
    ],
  },
};

export function getPlan(plan: string): Plan {
  return PLANS[plan as PlanId] ?? PLANS.mensual_26;
}

export const PLAN_OPTIONS = Object.values(PLANS);

/** Tarifario completo mostrado en la web. */
export type PriceOption = { label: string; detail: string; price: number };
export type PriceGroup = {
  id: string;
  name: string;
  period: string;
  tagline: string;
  featured: boolean;
  options: PriceOption[];
};

export const PRICING: PriceGroup[] = [
  {
    id: "pro",
    name: "Plan Pro",
    period: "Mensual",
    tagline: "26 sesiones al mes para quienes entrenan en serio.",
    featured: true,
    options: [
      { label: "Musculación", detail: "26 sesiones", price: 179 },
      { label: "Cardio", detail: "26 sesiones", price: 199 },
      { label: "Musculación + Cardio", detail: "26 musculación + 26 cardio", price: 289 },
    ],
  },
  {
    id: "smart",
    name: "Plan Smart",
    period: "Medio mes",
    tagline: "13 sesiones para semanas flexibles.",
    featured: false,
    options: [
      { label: "Musculación", detail: "13 sesiones", price: 119 },
      { label: "Cardio", detail: "13 sesiones", price: 129 },
      { label: "Musculación + Cardio", detail: "13 musculación + 13 cardio", price: 189 },
    ],
  },
  {
    id: "sesion",
    name: "Sesión",
    period: "Por día",
    tagline: "Entrena un día sin compromiso.",
    featured: false,
    options: [
      { label: "Musculación", detail: "1 día", price: 19 },
      { label: "Cardio", detail: "1 día", price: 29 },
      { label: "Musculación + Cardio", detail: "1 día", price: 40 },
    ],
  },
];
