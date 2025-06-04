
import { z } from 'zod';

// Task status enum
export const taskStatusSchema = z.enum(['Backlog', 'In Progress', 'Done']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  description: z.string(),
  due_date: z.coerce.date(),
  status: taskStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  due_date: z.coerce.date(),
  status: taskStatusSchema.default('Backlog')
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating tasks
export const updateTaskInputSchema = z.object({
  id: z.number(),
  description: z.string().min(1, 'Description is required').optional(),
  due_date: z.coerce.date().optional(),
  status: taskStatusSchema.optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

// Input schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;
