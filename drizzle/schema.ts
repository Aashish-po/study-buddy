import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Chat messages table
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  topic: varchar("topic", { length: 255 }),
  difficultyLevel: mysqlEnum("difficultyLevel", ["Beginner", "Intermediate", "Advanced"]).default("Intermediate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Study sessions table
export const studySessions = mysqlTable("studySessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  difficultyLevel: mysqlEnum("difficultyLevel", ["Beginner", "Intermediate", "Advanced"]).default("Intermediate").notNull(),
  learningStyle: mysqlEnum("learningStyle", ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"]).default("Visual").notNull(),
  duration: int("duration").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// Flashcards table
export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  mastered: boolean("mastered").default(false).notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Quiz results table
export const quizResults = mysqlTable("quizResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  difficultyLevel: mysqlEnum("difficultyLevel", ["Beginner", "Intermediate", "Advanced"]).default("Intermediate").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

// Learning progress table
export const learningProgress = mysqlTable("learningProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  masteryLevel: decimal("masteryLevel", { precision: 5, scale: 2 }).default("0").notNull(),
  lastStudied: timestamp("lastStudied"),
  totalTimeSpent: int("totalTimeSpent").default(0).notNull(),
  studyStreak: int("studyStreak").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// User preferences table
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  difficultyLevel: mysqlEnum("difficultyLevel", ["Beginner", "Intermediate", "Advanced"]).default("Intermediate").notNull(),
  learningStyle: mysqlEnum("learningStyle", ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"]).default("Visual").notNull(),
  notificationsEnabled: boolean("notificationsEnabled").notNull().default(true),
  darkModeEnabled: boolean("darkModeEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Study summaries table
export const studySummaries = mysqlTable("studySummaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Practice questions table
export const practiceQuestions = mysqlTable("practiceQuestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  question: text("question").notNull(),
  userAnswer: text("userAnswer").notNull(),
  aiEvaluation: text("aiEvaluation").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type ChatMessage = typeof chatMessages.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type QuizResult = typeof quizResults.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type StudySummary = typeof studySummaries.$inferSelect;
export type PracticeQuestion = typeof practiceQuestions.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type InsertStudySession = typeof studySessions.$inferInsert;
export type InsertFlashcard = typeof flashcards.$inferInsert;
export type InsertQuizResult = typeof quizResults.$inferInsert;
export type InsertLearningProgress = typeof learningProgress.$inferInsert;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type InsertStudySummary = typeof studySummaries.$inferInsert;
export type InsertPracticeQuestion = typeof practiceQuestions.$inferInsert;
