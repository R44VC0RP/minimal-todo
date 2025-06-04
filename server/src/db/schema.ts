
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define task status enum
export const taskStatusEnum = pgEnum('task_status', ['Backlog', 'In Progress', 'Done']);

export const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  due_date: timestamp('due_date').notNull(),
  status: taskStatusEnum('status').notNull().default('Backlog'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

// Export all tables for proper query building
export const tables = { tasks: tasksTable };
