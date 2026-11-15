/** Utilidades de semana ISO (lunes → domingo) usadas por el contador y el juego. */

export const WEEK_LENGTH = 6; // el club abre 6 días a la semana (domingo cerrado)

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // lunes = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function weekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export type WeekDay = {
  index: number;
  label: string;
  dayNumber: string;
  dateKey: string;
  isToday: boolean;
  isFuture: boolean;
  isClosed: boolean;
  trainedAt: string | null;
};

/** Construye el calendario de la semana actual marcando qué días hay asistencia. */
export function buildWeekCalendar(now: Date, checkInTimes: Date[]): WeekDay[] {
  const monday = startOfWeek(now);
  const todayKey = now.toDateString();

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const sameDay = checkInTimes
      .filter((value) => value.toDateString() === date.toDateString())
      .sort((a, b) => a.getTime() - b.getTime());
    const trainedAt = sameDay.length
      ? sameDay[0].toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : null;

    return {
      index,
      label: DAY_LABELS[index],
      dayNumber: String(date.getDate()).padStart(2, "0"),
      dateKey: date.toISOString(),
      isToday: date.toDateString() === todayKey,
      isFuture: date.getTime() > now.getTime() && date.toDateString() !== todayKey,
      isClosed: index === 6,
      trainedAt,
    };
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** Código de inscrito: normaliza 7 / 00007 / 0007 a "00007". */
export function normalizeMemberCode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits.length > 5) return null;
  const value = Number.parseInt(digits, 10);
  if (!Number.isFinite(value) || value < 1 || value > 9999) return null;
  return digits.padStart(5, "0");
}

/** Cabecera de fecha amable para el dashboard. */
export function formatLongDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
