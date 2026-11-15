/**
 * BASE DE DATOS SIMULADA · Portal de socios (100 % navegador)
 *
 * - SOCIOS_SEMILLA es la "tabla" inicial de socios.
 * - Los cambios (asistencias, premios, emails) se guardan en localStorage y
 *   sobreviven a recargas igual que en un backend real.
 * - Al cambiar la semana ISO se reinician las asistencias semanales y el juego,
 *   y se actualiza la racha de constancia. Al cambiar de mes se reinician las
 *   sesiones consumidas del plan.
 */
import { weekKey } from "@/lib/week";
import { PLANES_SOCIO, obtenerPlan, type TipoPlan } from "./planes";
import type { NivelPremio, PremioId } from "./premios";
import { desplazarSemana } from "./semanas";

export type PremioGanado = {
  id: PremioId;
  nombre: string;
  emoji: string;
  nivel: NivelPremio;
  codigoCanje: string;
  semana: string;
  fecha: string; // ISO
  asistencias: number;
  /** Código del socio al que quedó vinculado el premio. */
  vinculadoA: string;
  emailEnviado: boolean;
};

export type EmailSimulado = {
  id: string;
  para: string;
  asunto: string;
  cuerpo: string;
  fecha: string; // ISO
  codigoCanje: string;
  estado: "enviado (simulado)";
};

export type SocioRegistro = {
  codigo: string;
  nombre: string;
  email: string;
  tipoPlan: TipoPlan;
  modalidad: string;
  entrenador: string;
  socioDesde: string;
  semana: string;
  mes: string;
  asistenciasSemana: number;
  asistenciasMes: number;
  ultimaAsistencia: string | null;
  /** Semanas consecutivas en las que el socio desbloqueó el juego. */
  rachaSemanas: number;
  premioSemana: PremioGanado | null;
  historialPremios: PremioGanado[];
  emails: EmailSimulado[];
};

type SocioSemilla = Pick<
  SocioRegistro,
  | "codigo"
  | "nombre"
  | "email"
  | "tipoPlan"
  | "modalidad"
  | "entrenador"
  | "socioDesde"
  | "asistenciasSemana"
  | "asistenciasMes"
  | "rachaSemanas"
>;

/** "Tabla" de socios de prueba. */
export const SOCIOS_SEMILLA: SocioSemilla[] = [
  {
    codigo: "1234",
    nombre: "Juan Pérez",
    email: "juan@email.com",
    tipoPlan: "completo",
    modalidad: "Musculación",
    entrenador: "Ivar López",
    socioDesde: "2024-03-12",
    asistenciasSemana: 2,
    asistenciasMes: 9,
    rachaSemanas: 3,
  },
  {
    codigo: "5678",
    nombre: "María López",
    email: "maria@email.com",
    tipoPlan: "medio",
    modalidad: "Musculación + Cardio",
    entrenador: "Francisco Terán",
    socioDesde: "2025-01-20",
    asistenciasSemana: 1,
    asistenciasMes: 5,
    rachaSemanas: 1,
  },
  {
    codigo: "2468",
    nombre: "Carlos Rojas",
    email: "carlos@email.com",
    tipoPlan: "completo",
    modalidad: "Musculación + Cardio",
    entrenador: "Ernesto Mejía",
    socioDesde: "2023-08-05",
    asistenciasSemana: 5,
    asistenciasMes: 18,
    rachaSemanas: 6,
  },
];

const CLAVE_BASE_DATOS = "stampa-socios-db-v2";
const CLAVES_OBSOLETAS = ["stampa-socios-db-v1"];
const CLAVE_SESION = "stampa-socios-sesion";

type BaseDatos = Record<string, SocioRegistro>;

export function semanaActual(fecha: Date = new Date()): string {
  return weekKey(fecha);
}

export function mesDe(fecha: Date = new Date()): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Valida y normaliza el código: "01234" → "1234". Rango permitido 00001 – 9999. */
export function normalizarCodigo(valor: string): string | null {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos || digitos.length > 5) return null;
  const numero = Number.parseInt(digitos, 10);
  if (!Number.isInteger(numero) || numero < 1 || numero > 9999) return null;
  return String(numero);
}

function hayAlmacenamiento(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function crearRegistro(semilla: SocioSemilla): SocioRegistro {
  return {
    ...semilla,
    semana: semanaActual(),
    mes: mesDe(),
    ultimaAsistencia: null,
    premioSemana: null,
    historialPremios: [],
    emails: [],
  };
}

function crearBaseSemilla(): BaseDatos {
  const base: BaseDatos = {};
  for (const semilla of SOCIOS_SEMILLA) {
    base[normalizarCodigo(semilla.codigo) ?? semilla.codigo] = crearRegistro(semilla);
  }
  return base;
}

function esRegistroValido(valor: unknown): valor is SocioRegistro {
  if (!valor || typeof valor !== "object") return false;
  const registro = valor as Partial<SocioRegistro>;
  return (
    typeof registro.codigo === "string" &&
    typeof registro.nombre === "string" &&
    typeof registro.email === "string" &&
    typeof registro.tipoPlan === "string" &&
    registro.tipoPlan in PLANES_SOCIO &&
    typeof registro.semana === "string" &&
    typeof registro.mes === "string" &&
    typeof registro.asistenciasSemana === "number" &&
    typeof registro.asistenciasMes === "number"
  );
}

/** Reinicia contadores si la semana o el mes reales avanzaron. */
function sincronizarPeriodo(registro: SocioRegistro): SocioRegistro {
  let actualizado: SocioRegistro = {
    ...registro,
    rachaSemanas: typeof registro.rachaSemanas === "number" ? registro.rachaSemanas : 0,
    historialPremios: Array.isArray(registro.historialPremios) ? registro.historialPremios : [],
    emails: Array.isArray(registro.emails) ? registro.emails : [],
  };

  // Las claves ISO ("2026-W45") y de mes ("2026-11") se comparan como texto.
  const semana = semanaActual();
  if (actualizado.semana < semana) {
    const consecutiva = desplazarSemana(actualizado.semana, 1) === semana;
    const constante =
      actualizado.asistenciasSemana >= obtenerPlan(actualizado.tipoPlan).umbralJuego;
    actualizado = {
      ...actualizado,
      semana,
      asistenciasSemana: 0,
      premioSemana: null,
      rachaSemanas: consecutiva && constante ? actualizado.rachaSemanas + 1 : 0,
    };
  }

  const mes = mesDe();
  if (actualizado.mes < mes) {
    actualizado = { ...actualizado, mes, asistenciasMes: 0 };
  }

  return actualizado;
}

export function guardarBaseDatos(base: BaseDatos): void {
  if (!hayAlmacenamiento()) return;
  try {
    window.localStorage.setItem(CLAVE_BASE_DATOS, JSON.stringify(base));
  } catch {
    /* almacenamiento lleno o bloqueado (modo privado) */
  }
}

/** SELECT * FROM socios */
export function leerBaseDatos(): BaseDatos {
  if (!hayAlmacenamiento()) return crearBaseSemilla();

  let crudo: Record<string, unknown> = {};
  try {
    for (const clave of CLAVES_OBSOLETAS) window.localStorage.removeItem(clave);
    const texto = window.localStorage.getItem(CLAVE_BASE_DATOS);
    if (texto) crudo = JSON.parse(texto) as Record<string, unknown>;
  } catch {
    crudo = {};
  }

  const base: BaseDatos = {};
  for (const [clave, registro] of Object.entries(crudo)) {
    if (esRegistroValido(registro)) base[clave] = sincronizarPeriodo(registro);
  }
  for (const semilla of SOCIOS_SEMILLA) {
    const clave = normalizarCodigo(semilla.codigo) ?? semilla.codigo;
    if (!base[clave]) base[clave] = crearRegistro(semilla);
  }

  guardarBaseDatos(base);
  return base;
}

/** SELECT * FROM socios WHERE codigo = ? */
export function buscarSocio(codigo: string): SocioRegistro | null {
  const clave = normalizarCodigo(codigo);
  if (!clave) return null;
  return leerBaseDatos()[clave] ?? null;
}

/** UPDATE socios SET … WHERE codigo = ? */
export function guardarSocio(socio: SocioRegistro): SocioRegistro {
  const base = leerBaseDatos();
  base[normalizarCodigo(socio.codigo) ?? socio.codigo] = socio;
  guardarBaseDatos(base);
  return socio;
}

export function restablecerBaseDatos(): void {
  guardarBaseDatos(crearBaseSemilla());
}

/* ----------------------------- Sesión simulada ---------------------------- */

export function guardarSesion(codigo: string): void {
  if (!hayAlmacenamiento()) return;
  try {
    window.localStorage.setItem(CLAVE_SESION, codigo);
  } catch {
    /* noop */
  }
}

export function leerSesion(): string | null {
  if (!hayAlmacenamiento()) return null;
  try {
    return window.localStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
}

export function cerrarSesion(): void {
  if (!hayAlmacenamiento()) return;
  try {
    window.localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* noop */
  }
}

export function restaurarSesion(): SocioRegistro | null {
  const codigo = leerSesion();
  if (!codigo) return null;
  const socio = buscarSocio(codigo);
  if (!socio) cerrarSesion();
  return socio;
}

export type UsuarioDemo = {
  codigo: string;
  nombre: string;
  plan: string;
  asistenciasSemana: number;
  umbralJuego: number;
};

export function listarUsuariosDemo(): UsuarioDemo[] {
  const base = leerBaseDatos();
  return SOCIOS_SEMILLA.map((semilla) => {
    const registro = base[normalizarCodigo(semilla.codigo) ?? semilla.codigo];
    const plan = obtenerPlan(semilla.tipoPlan);
    return {
      codigo: semilla.codigo,
      nombre: semilla.nombre,
      plan: plan.etiqueta,
      asistenciasSemana: registro?.asistenciasSemana ?? semilla.asistenciasSemana,
      umbralJuego: plan.umbralJuego,
    };
  });
}
