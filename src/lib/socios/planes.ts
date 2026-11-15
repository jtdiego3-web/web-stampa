/**
 * PLANES DE SOCIO · reglas de conteo de asistencias
 *
 * El club abre 6 días a la semana (lunes a sábado), es decir ≈ 26 días al mes
 * (6 días × 52 semanas ÷ 12 meses). A partir de ahí se calcula el ritmo:
 *   · Plan Completo → 26 sesiones/mes → meta de 6 días por semana.
 *   · Medio Plan    → 13 sesiones/mes → meta de 3 días por semana.
 *
 * Opción A · Constancia: el Rasca y Gana se desbloquea al cumplir la mitad de la
 * meta semanal del plan (Completo: 3 asistencias · Medio: 2 asistencias).
 */
export const DIAS_APERTURA_SEMANA = 6;
export const DIAS_APERTURA_MES = 26;

export type TipoPlan = "completo" | "medio";

export type PlanSocio = {
  id: TipoPlan;
  nombre: string;
  etiqueta: string;
  periodo: string;
  sesionesMes: number;
  /** Ritmo recomendado (días por semana) según las sesiones del plan. */
  metaSemanal: number;
  /** Asistencias semanales necesarias para desbloquear el Rasca y Gana. */
  umbralJuego: number;
  /** Los descuentos del Rasca y Gana solo se aplican al plan mensual. */
  esPlanMensual: boolean;
};

function crearPlan(
  id: TipoPlan,
  nombre: string,
  periodo: string,
  sesionesMes: number,
  esPlanMensual: boolean,
): PlanSocio {
  const metaSemanal = Math.min(
    DIAS_APERTURA_SEMANA,
    Math.max(1, Math.round((sesionesMes / DIAS_APERTURA_MES) * DIAS_APERTURA_SEMANA)),
  );

  return {
    id,
    nombre,
    periodo,
    sesionesMes,
    esPlanMensual,
    etiqueta: `${nombre} · ${sesionesMes} sesiones al mes`,
    metaSemanal,
    umbralJuego: Math.ceil(metaSemanal / 2),
  };
}

export const PLANES_SOCIO: Record<TipoPlan, PlanSocio> = {
  completo: crearPlan("completo", "Plan Completo", "Mensual", 26, true),
  medio: crearPlan("medio", "Medio Plan", "Medio mes", 13, false),
};

export function obtenerPlan(tipo: string): PlanSocio {
  return PLANES_SOCIO[tipo as TipoPlan] ?? PLANES_SOCIO.completo;
}
