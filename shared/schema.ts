import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Domain redirector schema
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Redirecionador"),
  domain: text("domain").notNull(),
  alternativeDomain: text("alternative_domain").notNull().default("google.com"),
  autoRedirect: boolean("auto_redirect").notNull().default(true),
  delay: integer("delay").notNull().default(0),
  userId: integer("user_id").references(() => users.id),
});

export const insertDomainSchema = createInsertSchema(domains).pick({
  title: true,
  domain: true,
  alternativeDomain: true,
  autoRedirect: true,
  delay: true,
  userId: true,
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

// URL validation schema
export const domainValidationSchema = z.object({
  title: z.string().trim().min(1, { message: "O título não pode estar vazio" }).default("Redirecionador"),
  domain: z.string().trim().min(1, { message: "O domínio principal não pode estar vazio" })
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
      message: "Por favor, digite um URL válido (ex: exemplo.com.br)"
    }),
  alternativeDomain: z.string().trim().min(1, { message: "O domínio alternativo não pode estar vazio" })
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
      message: "Por favor, digite um URL válido (ex: exemplo.com.br)"
    }).default("google.com"),
  autoRedirect: z.boolean().default(true),
  delay: z.number().int().min(0).max(10).default(0),
});
