import {
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Socios del club. El acceso al portal se hace con el código numérico (00001 - 09999). */
export const members = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 5 }).notNull(),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    plan: varchar("plan", { length: 24 }).notNull().default("mensual_26"),
    goal: varchar("goal", { length: 160 }).notNull().default("Bienestar general"),
    coach: varchar("coach", { length: 80 }).notNull().default("Equipo Stampa"),
    joinedAt: date("joined_at").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("activo"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("members_code_idx").on(table.code)],
);

/** Registro de asistencias (una por día). */
export const attendances = pgTable(
  "attendances",
  {
    id: serial("id").primaryKey(),
    memberId: integer("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
    weekKey: varchar("week_key", { length: 10 }).notNull(),
    source: varchar("source", { length: 24 }).notNull().default("recepcion"),
  },
  (table) => [
    index("attendances_member_idx").on(table.memberId),
    index("attendances_week_idx").on(table.memberId, table.weekKey),
  ],
);

/** Tiradas del rasca y gana (una por socio y semana ISO). */
export const scratches = pgTable(
  "scratches",
  {
    id: serial("id").primaryKey(),
    memberId: integer("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    weekKey: varchar("week_key", { length: 10 }).notNull(),
    prizeId: varchar("prize_id", { length: 40 }).notNull(),
    prizeLabel: varchar("prize_label", { length: 120 }).notNull(),
    prizeKind: varchar("prize_kind", { length: 20 }).notNull(),
    discountPct: integer("discount_pct"),
    couponCode: varchar("coupon_code", { length: 40 }).notNull(),
    attendanceAtDraw: integer("attendance_at_draw").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("scratches_member_week_idx").on(table.memberId, table.weekKey)],
);

/** Bandeja de salida simulada: cada premio genera un email al socio. */
export const emailLog = pgTable(
  "email_log",
  {
    id: serial("id").primaryKey(),
    memberId: integer("member_id").references(() => members.id, { onDelete: "set null" }),
    recipient: varchar("recipient", { length: 180 }).notNull(),
    subject: varchar("subject", { length: 200 }).notNull(),
    body: text("body").notNull(),
    kind: varchar("kind", { length: 40 }).notNull().default("premio"),
    status: varchar("status", { length: 24 }).notNull().default("simulado"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("email_log_member_idx").on(table.memberId)],
);

/** Leads de la newsletter (pop-up de captación). */
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 180 }).notNull(),
    name: varchar("name", { length: 120 }),
    source: varchar("source", { length: 40 }).notNull().default("popup"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("newsletter_email_idx").on(table.email)],
);

/** Mensajes del formulario de contacto. */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  topic: varchar("topic", { length: 60 }).notNull().default("Membresías"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Member = typeof members.$inferSelect;
export type Attendance = typeof attendances.$inferSelect;
export type Scratch = typeof scratches.$inferSelect;
export type EmailLogEntry = typeof emailLog.$inferSelect;
