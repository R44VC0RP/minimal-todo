
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput, type Task } from '../schema';

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  try {
    // Insert task record
    const result = await db.insert(tasksTable)
      .values({
        description: input.description,
        due_date: input.due_date,
        status: input.status // Will use default 'Backlog' if not provided
      })
      .returning()
      .execute();

    // Return the created task
    const task = result[0];
    return task;
  } catch (error) {
    console.error('Task creation failed:', error);
    throw error;
  }
};
