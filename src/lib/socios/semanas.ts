import { weekKey } from "@/lib/week";

/** Utilidades de semanas ISO ("2026-W45") para el portal de socios. */

const PATRON_SEMANA = /^(\d{4})-W(\d{2})$/;

/** Lunes (fecha local, 00:00) de una semana ISO. */
export function lunesDeSemana(clave: string): Date {
  const coincidencia = PATRON_SEMANA.exec(clave);
  if (!coincidencia) {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7));
  }

  const anio = Number(coincidencia[1]);
  const semana = Number(coincidencia[2]);
  // El 4 de enero pertenece siempre a la semana ISO 1.
  const cuatroDeEnero = new Date(anio, 0, 4);
  const desplazamiento = (cuatroDeEnero.getDay() + 6) % 7; // lunes = 0
  return new Date(anio, 0, 4 - desplazamiento + (semana - 1) * 7);
}

/** Semana ISO desplazada N semanas (positivo = futuro). */
export function desplazarSemana(clave: string, semanas: number): string {
  const lunes = lunesDeSemana(clave);
  return weekKey(new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + semanas * 7));
}

/** Los 7 días (lunes → domingo) de una semana ISO. */
export function diasDeSemana(clave: string): Date[] {
  const lunes = lunesDeSemana(clave);
  return Array.from(
    { length: 7 },
    (_, indice) => new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + indice),
  );
}

/** "2026-W09" → "9" */
export function numeroSemana(clave: string): string {
  const numero = PATRON_SEMANA.exec(clave)?.[2];
  return numero ? String(Number(numero)) : clave;
}
