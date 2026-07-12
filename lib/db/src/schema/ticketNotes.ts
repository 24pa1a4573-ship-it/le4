import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ticketsTable } from "./tickets";

export const ticketNotesTable = pgTable("ticket_notes", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id")
    .notNull()
    .references(() => ticketsTable.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertTicketNoteSchema = createInsertSchema(
  ticketNotesTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertTicketNote = z.infer<typeof insertTicketNoteSchema>;
export type TicketNote = typeof ticketNotesTable.$inferSelect;
