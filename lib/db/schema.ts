import {
  timestamp,
  integer,
  pgTable,
  varchar,
  boolean,
  text,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  esignature: text(),
  role: varchar({ length: 255, enum: ["employee", "manager", "admin"] }),
  default_chair: varchar({ length: 255 }),
  establishment_id: integer().references(() => establishmentsTable.id),
  clerk_id: varchar({ length: 255 }),
});

export const establishmentsTable = pgTable("establishments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  business_name: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  city: varchar({ length: 255 }).notNull(),
  state: varchar({ length: 255 }).notNull(),
  postal: varchar({ length: 255 }).notNull(),
  country: varchar({ length: 255 }).notNull(),
  chairs: integer().notNull(),
  premium: boolean().default(false),
  stripe_subscription_id: varchar({ length: 255 }),
  presets: json()
    .$type<string[]>()
    .default(["After Client", "End of Day", "Weekly"]),
});

export const logsTable = pgTable("logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  performed_at: timestamp("performed_at").notNull(),
  chair: varchar({ length: 255 }).notNull(),
  esignature: text(),
  user_id: integer()
    .references(() => usersTable.id)
    .notNull(),
  establishment_id: integer()
    .references(() => establishmentsTable.id)
    .notNull(),
  presets: json().$type<string[]>(),
});

export const invitesTable = pgTable("invites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  user_id: integer()
    .references(() => usersTable.id)
    .notNull(),
  establishment_id: integer()
    .references(() => establishmentsTable.id)
    .notNull(),
  invite_email: varchar({ length: 255 }).notNull(),
  accepted: boolean().default(false),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  establishment: one(establishmentsTable, {
    fields: [usersTable.establishment_id],
    references: [establishmentsTable.id],
  }),
  logs: many(logsTable),
}));

export const logsRelations = relations(logsTable, ({ one }) => ({
  establishment: one(establishmentsTable, {
    fields: [logsTable.establishment_id],
    references: [establishmentsTable.id],
  }),
  user: one(usersTable, {
    fields: [logsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const establishmentsRelations = relations(
  establishmentsTable,
  ({ many }) => ({
    users: many(usersTable),
    logs: many(logsTable),
  })
);
