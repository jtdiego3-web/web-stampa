import { pool } from "@/db";
import { addDays, startOfWeek, weekKey } from "@/lib/week";

/**
 * Crea el esquema (idempotente) y siembra socios de demostración con historial
 * de asistencias realista. Se ejecuta una sola vez por proceso.
 */
let readyPromise: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = bootstrap().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS members (
    id serial PRIMARY KEY,
    code varchar(5) NOT NULL,
    first_name varchar(80) NOT NULL,
    last_name varchar(120) NOT NULL,
    email varchar(180) NOT NULL,
    phone varchar(40),
    plan varchar(24) NOT NULL DEFAULT 'mensual_26',
    goal varchar(160) NOT NULL DEFAULT 'Bienestar general',
    coach varchar(80) NOT NULL DEFAULT 'Equipo Stampa',
    joined_at date NOT NULL,
    status varchar(24) NOT NULL DEFAULT 'activo',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS members_code_idx ON members (code)`,
  `CREATE TABLE IF NOT EXISTS attendances (
    id serial PRIMARY KEY,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    checked_in_at timestamptz NOT NULL DEFAULT now(),
    week_key varchar(10) NOT NULL,
    source varchar(24) NOT NULL DEFAULT 'recepcion'
  )`,
  `CREATE INDEX IF NOT EXISTS attendances_member_idx ON attendances (member_id)`,
  `CREATE INDEX IF NOT EXISTS attendances_week_idx ON attendances (member_id, week_key)`,
  `CREATE TABLE IF NOT EXISTS scratches (
    id serial PRIMARY KEY,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    week_key varchar(10) NOT NULL,
    prize_id varchar(40) NOT NULL,
    prize_label varchar(120) NOT NULL,
    prize_kind varchar(20) NOT NULL,
    discount_pct integer,
    coupon_code varchar(40) NOT NULL,
    attendance_at_draw integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS scratches_member_week_idx ON scratches (member_id, week_key)`,
  `CREATE TABLE IF NOT EXISTS email_log (
    id serial PRIMARY KEY,
    member_id integer REFERENCES members(id) ON DELETE SET NULL,
    recipient varchar(180) NOT NULL,
    subject varchar(200) NOT NULL,
    body text NOT NULL,
    kind varchar(40) NOT NULL DEFAULT 'premio',
    status varchar(24) NOT NULL DEFAULT 'simulado',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS email_log_member_idx ON email_log (member_id)`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id serial PRIMARY KEY,
    email varchar(180) NOT NULL,
    name varchar(120),
    source varchar(40) NOT NULL DEFAULT 'popup',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers (email)`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    email varchar(180) NOT NULL,
    phone varchar(40),
    topic varchar(60) NOT NULL DEFAULT 'Membresías',
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

type SeedMember = {
  code: string;
  firstName: string;
  lastName: string;
  plan: "mensual_26" | "medio_mes_13";
  goal: string;
  coach: string;
  joinedAt: string;
  /** Asistencias objetivo de la semana en curso. */
  currentWeek: number;
  /** Historial de semanas anteriores (la primera es la más reciente). */
  history: number[];
};

export const SEED_MEMBERS: SeedMember[] = [
  {
    code: "00001",
    firstName: "Laia",
    lastName: "Ferrer",
    plan: "mensual_26",
    goal: "Fuerza y técnica en sentadilla",
    coach: "Ivar López",
    joinedAt: "2023-02-14",
    currentWeek: 4,
    history: [5, 4, 5, 6, 4, 5, 3, 5],
  },
  {
    code: "00002",
    firstName: "Marc",
    lastName: "Soler",
    plan: "medio_mes_13",
    goal: "Volver a la rutina sin lesionarme",
    coach: "Ernesto Mejía",
    joinedAt: "2024-09-02",
    currentWeek: 2,
    history: [2, 3, 2, 2, 3, 2, 1, 2],
  },
  {
    code: "00007",
    firstName: "Aitana",
    lastName: "Vidal",
    plan: "mensual_26",
    goal: "Recomposición corporal y 3 dominadas",
    coach: "Francisco Terán",
    joinedAt: "2022-11-08",
    currentWeek: 5,
    history: [5, 6, 4, 5, 6, 5, 4, 6],
  },
  {
    code: "00012",
    firstName: "Iván",
    lastName: "Prats",
    plan: "mensual_26",
    goal: "Hipertrofia y movilidad de hombro",
    coach: "Ivar López",
    joinedAt: "2024-01-20",
    currentWeek: 1,
    history: [1, 2, 1, 2, 1, 2, 2, 1],
  },
  {
    code: "00142",
    firstName: "Núria",
    lastName: "Bassets",
    plan: "mensual_26",
    goal: "Media maratón en octubre",
    coach: "Ernesto Mejía",
    joinedAt: "2023-06-30",
    currentWeek: 3,
    history: [4, 3, 4, 4, 3, 5, 3, 4],
  },
  {
    code: "00214",
    firstName: "Diego",
    lastName: "Oller",
    plan: "medio_mes_13",
    goal: "Mantenerme fuerte después de los 40",
    coach: "Francisco Terán",
    joinedAt: "2025-03-11",
    currentWeek: 2,
    history: [2, 2, 1, 3, 2, 2, 2, 1],
  },
  {
    code: "00412",
    firstName: "Sofía",
    lastName: "Márquez",
    plan: "mensual_26",
    goal: "Primera dominada y menos dolor lumbar",
    coach: "Ivar López",
    joinedAt: "2024-05-17",
    currentWeek: 3,
    history: [3, 4, 3, 2, 4, 3, 3, 4],
  },
  {
    code: "00903",
    firstName: "Bruno",
    lastName: "Camps",
    plan: "medio_mes_13",
    goal: "Preparar oposiciones físicas",
    coach: "Ernesto Mejía",
    joinedAt: "2025-01-09",
    currentWeek: 4,
    history: [4, 5, 3, 4, 4, 5, 4, 3],
  },
];

const NAMES = [
  ["Andrea", "Mas"],
  ["Pau", "Riera"],
  ["Julia", "Cabot"],
  ["Héctor", "Salas"],
  ["Marina", "Llop"],
  ["Toni", "Bestard"],
] as const;

export function buildAttendanceRows(
  memberId: number,
  currentWeek: number,
  history: number[],
  seed: number,
): { memberId: number; checkedInAt: Date; weekKey: string }[] {
  const now = new Date();
  const monday = startOfWeek(now);
  const elapsedDays = Math.min(6, Math.floor((now.getTime() - monday.getTime()) / 86400000));
  const rows: { memberId: number; checkedInAt: Date; weekKey: string }[] = [];

  // Semanas anteriores (hasta 8 semanas de historial).
  for (let week = 1; week < 9; week += 1) {
    const target = history[(week - 1) % history.length] ?? 3;
    const weekStart = addDays(monday, -7 * week);
    const daySlots = [0, 1, 2, 3, 4, 5].filter((day) => (day + seed + week) % 7 !== 6);
    for (let session = 0; session < Math.min(target, 6); session += 1) {
      const day = daySlots[(session * 2 + seed + week) % daySlots.length];
      const date = addDays(weekStart, day);
      date.setHours(7 + ((seed + session + week) % 13), (session * 5 + seed) % 60, 0, 0);
      rows.push({ memberId, checkedInAt: date, weekKey: weekKey(date) });
    }
  }

  // Semana en curso: se usan los días anteriores a hoy para que el socio pueda
  // registrar su entrenamiento de hoy desde el portal durante la demo.
  const preferredDays: number[] = [];
  for (let day = elapsedDays - 1; day >= 0; day -= 1) preferredDays.push(day);
  if (elapsedDays === 0) preferredDays.push(0);

  const availableDays = Math.min(currentWeek, preferredDays.length, 6);
  for (let session = 0; session < availableDays; session += 1) {
    const day = preferredDays[session] ?? 0;
    const date = addDays(monday, day);
    const offsetHours = (seed + session) % 3;
    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      7 + offsetHours * 4,
      (session * 11 + seed) % 60,
      0,
      0,
    );
    if (candidate.getTime() > now.getTime()) {
      date.setHours(now.getHours(), Math.max(0, now.getMinutes() - 45), 0, 0);
      rows.push({ memberId, checkedInAt: new Date(date), weekKey: weekKey(date) });
    } else {
      rows.push({ memberId, checkedInAt: candidate, weekKey: weekKey(candidate) });
    }
  }

  return rows.sort((a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime());
}

export async function seedAttendanceForMember(
  memberId: number,
  currentWeek: number,
  history: number[],
  seed: number,
): Promise<void> {
  const rows = buildAttendanceRows(memberId, currentWeek, history, seed);
  if (!rows.length) return;

  const values: unknown[] = [];
  const placeholders = rows.map((row, index) => {
    values.push(row.memberId, row.checkedInAt, row.weekKey);
    return `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`;
  });

  await pool.query(
    `INSERT INTO attendances (member_id, checked_in_at, week_key) VALUES ${placeholders.join(", ")}`,
    values,
  );
}

async function bootstrap(): Promise<void> {
  for (const statement of DDL) {
    await pool.query(statement);
  }

  const existing = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM members");
  if (Number(existing.rows[0]?.count ?? "0") > 0) return;

  for (let index = 0; index < SEED_MEMBERS.length; index += 1) {
    const member = SEED_MEMBERS[index];
    const inserted = await pool.query<{ id: number }>(
      `INSERT INTO members (code, first_name, last_name, email, phone, plan, goal, coach, joined_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (code) DO NOTHING
       RETURNING id`,
      [
        member.code,
        member.firstName,
        member.lastName,
        `${member.firstName.toLowerCase()}.${member.lastName.toLowerCase().replace(/\s/g, "")}@demo.stampawellness.gym`,
        `+591 7${String(5900000 + index * 1371).padStart(7, "0")}`,
        member.plan,
        member.goal,
        member.coach,
        member.joinedAt,
      ],
    );
    const id = inserted.rows[0]?.id;
    if (!id) continue;
    await seedAttendanceForMember(id, member.currentWeek, member.history, index + 1);
  }
}

/** Nombre y email deterministas para códigos no sembrados (perfil demo automático). */
export function provisionIdentity(code: string): {
  firstName: string;
  lastName: string;
  email: string;
} {
  const numeric = Number.parseInt(code, 10);
  const [firstName, lastName] = NAMES[numeric % NAMES.length];
  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${code}@demo.stampawellness.gym`,
  };
}
