import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

// Schema for focus profiles
export const focusProfiles = pgTable("focus_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  accessStyle: text("access_style").default('blocklist').notNull(),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFocusProfileSchema = createInsertSchema(focusProfiles).pick({
  name: true,
  description: true,
  isActive: true,
  accessStyle: true,
});

export type InsertFocusProfile = z.infer<typeof insertFocusProfileSchema>;
export type FocusProfile = typeof focusProfiles.$inferSelect;

// Schema for blocked sites
export const blockedSites = pgTable("blocked_sites", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlockedSiteSchema = createInsertSchema(blockedSites).pick({
  profileId: true,
  url: true,
});

export type InsertBlockedSite = z.infer<typeof insertBlockedSiteSchema>;
export type BlockedSite = typeof blockedSites.$inferSelect;

// Schema for focus sessions
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  completed: boolean("completed").default(false),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  profileId: true,
  startTime: true,
});

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

// Schema for daily intentions
export const dailyIntentions = pgTable("daily_intentions", {
  id: serial("id").primaryKey(),
  intention: text("intention").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertDailyIntentionSchema = createInsertSchema(dailyIntentions).pick({
  intention: true,
});

export type InsertDailyIntention = z.infer<typeof insertDailyIntentionSchema>;
export type DailyIntention = typeof dailyIntentions.$inferSelect;
