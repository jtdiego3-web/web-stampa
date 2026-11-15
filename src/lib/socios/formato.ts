/** Utilidades de formato para el portal de socios. */

const fechaCorta = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fechaHora = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const fechaLarga = new Intl.DateTimeFormat("es-BO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const diaCorto = new Intl.DateTimeFormat("es-BO", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const soloHora = new Intl.DateTimeFormat("es-BO", {
  hour: "2-digit",
  minute: "2-digit",
});

function aFecha(valor: string): Date {
  // "2024-03-12" se interpreta al mediodía para evitar desfases de zona horaria.
  return new Date(valor.length === 10 ? `${valor}T12:00:00` : valor);
}

export function formatearFecha(valor: string): string {
  const fecha = aFecha(valor);
  return Number.isNaN(fecha.getTime()) ? "—" : fechaCorta.format(fecha);
}

export function formatearFechaHora(valor: string | null): string {
  if (!valor) return "—";
  const fecha = aFecha(valor);
  return Number.isNaN(fecha.getTime()) ? "—" : fechaHora.format(fecha);
}

export function formatearFechaLarga(fecha: Date = new Date()): string {
  const texto = fechaLarga.format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearDiaCorto(fecha: Date): string {
  return diaCorto.format(fecha);
}

export function etiquetaUltimaAsistencia(valor: string | null): string {
  if (!valor) return "Sin registros";
  const fecha = aFecha(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  if (fecha.toDateString() === new Date().toDateString()) return `Hoy · ${soloHora.format(fecha)}`;
  return fechaHora.format(fecha);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function primerNombre(nombre: string): string {
  return nombre.split(/\s+/)[0] ?? nombre;
}
